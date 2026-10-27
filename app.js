// ── STATE ─────────────────────────────────────────────────────────────────
const isStatic = (typeof window.__STATIC_MODE__ !== "undefined" && window.__STATIC_MODE__) || 
                 (window.location.protocol === 'file:') || 
                 (window.location.hostname.endsWith('github.io'));

const state = {
  index: {},
  currentPath: null,
  currentMtime: null,
  pollTimer: null,
  searchQuery: "",
  activeHighlightId: null,
  activeTool: localStorage.getItem("study_reader_tool") || "read",
  penDrag: null,
};

// ── NOTES HELPERS (defined early so openFile() can use them) ──────────────
function getNotesKey(path) {
  return `study_notes_${path || '__global__'}`;
}
function loadNotes(path) {
  return localStorage.getItem(getNotesKey(path)) || '';
}
function saveNotes(path, text) {
  if (text) {
    localStorage.setItem(getNotesKey(path), text);
  } else {
    localStorage.removeItem(getNotesKey(path));
  }
}

// ── FETCH HELPERS ─────────────────────────────────────────────────────────
async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────
function restoreLastOpenedOrParam() {
  if (!state.index) return;
  // 1. Check URL query param ?file=...
  const urlParams = new URLSearchParams(window.location.search);
  const fileParam = urlParams.get("file");
  if (fileParam) {
    for (const [course, files] of Object.entries(state.index)) {
      const match = files.find(f => f.path === fileParam || f.path.endsWith("/" + fileParam));
      if (match) {
        openFile(match.path, course, match.name);
        return;
      }
    }
  }

  // 2. Restore last viewed file from localStorage
  try {
    const lastRaw = localStorage.getItem("study_reader_last_file");
    if (lastRaw) {
      const last = JSON.parse(lastRaw);
      if (last && last.path) {
        for (const [course, files] of Object.entries(state.index)) {
          const match = files.find(f => f.path === last.path);
          if (match) {
            openFile(match.path, course, match.name);
            return;
          }
        }
      }
    }
  } catch(e) {}
}

async function loadIndex() {
  // Hide sync button on static GitHub Pages (no server to sync from)
  if (isStatic) {
    const sb = document.getElementById("sync-btn");
    if (sb) sb.style.display = "none";
  }
  if (typeof window.__STUDY_INDEX__ !== "undefined" && window.__STUDY_INDEX__) {
    state.index = window.__STUDY_INDEX__;
    renderNav(state.index);
    restoreLastOpenedOrParam();
    return;
  }
  try {
    const idx = await apiGet("/api/index");
    state.index = idx;
    renderNav(idx);
    restoreLastOpenedOrParam();
  } catch(e) {
    document.getElementById("nav-placeholder").textContent = "Failed to load courses.";
  }
}

function renderNav(idx) {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = "";
  const q = state.searchQuery.toLowerCase();

  Object.entries(idx).forEach(([course, files]) => {
    const filtered = q
      ? files.filter(f => f.name.toLowerCase().includes(q) || course.toLowerCase().includes(q))
      : files;
    if (filtered.length === 0) return;

    // ── Course-level collapsible group ──
    const group = document.createElement("div");
    group.className = "course-group";

    const courseKey = `study_course_open_${course}`;
    const courseOpen = localStorage.getItem(courseKey) !== "0"; // default open

    const label = document.createElement("div");
    label.className = "course-label" + (courseOpen ? "" : " collapsed");
    label.innerHTML = `
      <span class="course-chevron">▾</span>
      <span class="course-icon">📚</span>
      <span class="course-title">${shortenCourse(course)}</span>
    `;

    const fileList = document.createElement("div");
    fileList.className = "tree-children" + (courseOpen ? "" : " collapsed");
    fileList.style.setProperty("--guide-x", "16px");

    label.addEventListener("click", () => {
      const isOpen = !fileList.classList.contains("collapsed");
      label.classList.toggle("collapsed", isOpen);
      fileList.classList.toggle("collapsed", isOpen);
      localStorage.setItem(courseKey, isOpen ? "0" : "1");
    });

    // Detect nested folders
    const coursePrefix = course + "/";
    const hasSubfolders = filtered.some(f => {
      const rel = f.path.startsWith("courses/")
        ? f.path.replace("courses/" + course + "/", "")
        : f.path.replace(coursePrefix, "");
      return rel.includes("/");
    });

    if (hasSubfolders) {
      const tree = buildFileTree(filtered, course);
      renderFileTree(tree, fileList, course, 0);
    } else {
      filtered.forEach(f => fileList.appendChild(makeFileItem(f, course, 0)));
    }

    group.appendChild(label);
    group.appendChild(fileList);
    nav.appendChild(group);
  });

  if (nav.innerHTML === "") {
    nav.innerHTML = '<div style="padding:16px;color:var(--text-faint);font-size:13px">No notes found</div>';
  }
}

/**
 * Build a recursive folder tree from a flat file list.
 * Each node: { _files: [...], _dirs: { dirName: node } }
 */
function buildFileTree(files, course) {
  const root = { _files: [], _dirs: {} };
  files.forEach(f => {
    let rel = f.path;
    if (rel.startsWith("courses/" + course + "/")) rel = rel.slice(("courses/" + course + "/").length);
    else if (rel.startsWith(course + "/")) rel = rel.slice((course + "/").length);

    const parts = rel.split("/");
    if (parts.length === 1) {
      root._files.push(f);
    } else {
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts[i];
        if (!node._dirs[dir]) node._dirs[dir] = { _files: [], _dirs: {} };
        node = node._dirs[dir];
      }
      node._files.push(f);
    }
  });
  return root;
}

/** Count total files in a tree node recursively */
function countTreeFiles(node) {
  let n = node._files.length;
  Object.values(node._dirs).forEach(child => { n += countTreeFiles(child); });
  return n;
}

/** Friendly folder display name — preserve original casing if ALL_CAPS or short */
function friendlyDirName(raw) {
  if (raw === raw.toUpperCase() && raw.length <= 30) return raw; // ALL_CAPS — keep as-is (e.g. A1_THEMATIC_UNITS)
  return raw.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Render a tree node recursively (VS Code-style).
 * depth = 0 means direct children of course root.
 * indent = 12px per depth level; guide line shown at parent's icon x-position.
 */
function renderFileTree(node, container, course, depth) {
  const BASE_INDENT = 8;   // px from left for depth=0 items
  const STEP       = 16;   // px per depth increment

  // Files first (root-level of this node)
  node._files.forEach(f => container.appendChild(makeFileItem(f, course, depth)));

  // Subdirectories, sorted alphabetically
  Object.keys(node._dirs).sort().forEach(dirName => {
    const child   = node._dirs[dirName];
    const count   = countTreeFiles(child);
    const folderKey = `study_folder_${course}_${dirName}`;
    const saved   = localStorage.getItem(folderKey);
    // Default open when ≤6 files; always open for small folders
    const startOpen = saved !== null ? saved === "1" : count <= 6;

    const indent = BASE_INDENT + depth * STEP;
    const childGuideX = indent + STEP + 10; // x of the guide line for children

    // ── Folder row ──
    const folderRow = document.createElement("div");
    folderRow.className = "folder-row";
    folderRow.style.paddingLeft = `${indent}px`;

    folderRow.innerHTML = `
      <span class="folder-chevron ${startOpen ? "open" : "closed"}">▾</span>
      <span class="folder-icon">📁</span>
      <span class="folder-label-text">${friendlyDirName(dirName)}</span>
      <span class="folder-badge">${count}</span>
    `;

    // ── Children wrapper with guide line ──
    const childWrap = document.createElement("div");
    childWrap.className = "tree-children" + (startOpen ? "" : " collapsed");
    childWrap.style.setProperty("--guide-x", `${childGuideX}px`);

    // Toggle open/closed
    folderRow.addEventListener("click", () => {
      const isOpen = !childWrap.classList.contains("collapsed");
      childWrap.classList.toggle("collapsed", isOpen);
      const ch = folderRow.querySelector(".folder-chevron");
      ch.classList.toggle("open",   !isOpen);
      ch.classList.toggle("closed",  isOpen);
      // Update folder icon: open vs closed
      const icon = folderRow.querySelector(".folder-icon");
      icon.textContent = isOpen ? "📁" : "📂";
      localStorage.setItem(folderKey, isOpen ? "0" : "1");
    });

    // Set initial icon state
    const initIcon = folderRow.querySelector(".folder-icon");
    initIcon.textContent = startOpen ? "📂" : "📁";

    // Recurse into children
    renderFileTree(child, childWrap, course, depth + 1);

    container.appendChild(folderRow);
    container.appendChild(childWrap);
  });
}

/** Create a single file item (VS Code-style with icon) */
function makeFileItem(f, course, depth) {
  const BASE_INDENT = 8;
  const STEP        = 16;
  const indent = BASE_INDENT + depth * STEP + 22; // +22 = chevron(16) + folder-icon gap

  const item = document.createElement("div");
  item.className = "file-item" + (f.path === state.currentPath ? " active" : "");
  item.title = f.path;
  item.style.paddingLeft = `${indent}px`;
  item.innerHTML = `
    <span class="file-icon">M↓</span>
    <span class="file-name-text">${f.name}</span>
  `;
  item.addEventListener("click", () => openFile(f.path, course, f.name));
  return item;
}

function shortenCourse(name) {
  // Shorten long course names for sidebar display
  const map = {
    "Digital Information Processing": "Digital Info Processing",
    "Computed Tomography I - Methods on CT": "Computed Tomography I",
    "Clinical Aspects in Imaging and Radiation Therapy": "Clinical Aspects",
    "Introduction to Programming Techniques in Engineering": "Programming Techniques",
    "Mathematical Foundations": "Mathematical Foundations",
    "German": "German (Deutsch)",
  };
  return map[name] || name;
}

// ── SEARCH (DEBOUNCED) ────────────────────────────────────────────────────
let searchDebounceTimer = null;
document.getElementById("search-input").addEventListener("input", function() {
  clearTimeout(searchDebounceTimer);
  const q = this.value;
  searchDebounceTimer = setTimeout(() => {
    state.searchQuery = q;
    renderNav(state.index);
  }, 150);
});

// ── OPEN FILE ─────────────────────────────────────────────────────────────
async function openFile(filePath, course, fileName) {
  state.currentPath = filePath;
  hideToolbar();

  // Save last opened note to localStorage
  try {
    localStorage.setItem("study_reader_last_file", JSON.stringify({ path: filePath, course: course, name: fileName }));
  } catch(e) {}

  if (window.innerWidth <= 768) {
    toggleSidebar(false);
  }

  // Update active state
  document.querySelectorAll(".file-item").forEach(el => {
    el.classList.toggle("active", el.title === filePath);
  });

  // Update breadcrumb
  const bc = document.getElementById("breadcrumb");
  bc.innerHTML = `<span class="bc-course">${shortenCourse(course)}</span>
                  <span class="bc-sep">/</span>
                  <span class="bc-file">${fileName}</span>
                  <span id="bc-meta" class="bc-meta"></span>`;

  // Reset progress bar on file open
  const pb = document.getElementById("progress-bar");
  if (pb) pb.style.width = "0%";

  // Show loading
  document.getElementById("welcome").style.display = "none";
  document.getElementById("error-box").style.display = "none";
  document.getElementById("md-body").style.display = "none";
  document.getElementById("loading").style.display = "block";

  // Load persisted notes for this file
  if (notesArea) {
    notesArea.value = loadNotes(filePath);
  }

  await loadContent(filePath);
}

async function loadContent(filePath) {
  try {
    let content = "";
    const bust = `_t=${Date.now()}`;
    if (isStatic) {
      const sep = filePath.includes("?") ? "&" : "?";
      const r = await fetch(encodeURI(filePath) + sep + bust, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      content = await r.text();
    } else {
      const data = await apiGet(`/api/file?path=${encodeURIComponent(filePath)}&${bust}`);
      content = data.content;
      state.currentMtime = data.mtime;
    }
    renderMarkdown(content, filePath);
  } catch(e) {
    showError("Failed to load file: " + e.message);
  }
}

// ── MARKDOWN RENDERER ─────────────────────────────────────────────────────
function renderMarkdown(raw, filePath) {
  // Calculate word count and estimated reading time (~200 words/min)
  const words = raw.trim() ? (raw.match(/\S+/g) || []).length : 0;
  const mins = Math.max(1, Math.round(words / 200));
  const bcMeta = document.getElementById("bc-meta");
  if (bcMeta) {
    bcMeta.textContent = `· ${words.toLocaleString()} words · ~${mins} min read`;
  }

  // Get the directory of the file for resolving relative image paths
  const fileDir = filePath.substring(0, filePath.lastIndexOf("/") + 1);

  marked.setOptions({ breaks: true, gfm: true });

  // Step 1: protect math from marked's backslash-eating in lists
  // We extract all math, replace with safe placeholders, restore after parsing
  const mathStore = [];
  let processed = raw;

  // Display math $$ ... $$ (must be before inline $)
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (m) => {
    mathStore.push(m); return `<!--MATH${mathStore.length - 1}-->`;
  });
  // Inline math $ ... $
  processed = processed.replace(/\$([^\n$`]+?)\$/g, (m) => {
    mathStore.push(m); return `<!--MATH${mathStore.length - 1}-->`;
  });
  // \[ ... \] display
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (m) => {
    mathStore.push(m); return `<!--MATH${mathStore.length - 1}-->`;
  });
  // \( ... \) inline
  processed = processed.replace(/\\\(([^\n]+?)\\\)/g, (m) => {
    mathStore.push(m); return `<!--MATH${mathStore.length - 1}-->`;
  });

  // Step 2: fix relative image paths
  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      if (src.startsWith("http") || src.startsWith("data:")) {
        return match;
      }
      const fullPath = fileDir + src;
      const target = isStatic ? encodeURI(fullPath) : `/assets/${encodeURI(fullPath)}`;
      return `![${alt}](${target})`;
    }
  );

  // Step 3: parse markdown
  let html = marked.parse(processed);

  // Step 4: restore math placeholders (HTML comments survive marked.parse)
  html = html.replace(/<!--MATH(\d+)-->/g, (_, i) => mathStore[+i]);

  // Step 5: GitHub-style alert callouts
  html = html.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/gi,
    (m, type) => `<blockquote class="alert-${type.toLowerCase()}"><p>`
  );

  // Step 5.5: add loading="lazy" for image performance
  html = html.replace(/<img\s+/gi, '<img loading="lazy" ');

  // Step 6: inject into DOM
  const body = document.getElementById("md-body");
  body.innerHTML = html;
  body.style.display = "block";
  document.getElementById("loading").style.display = "none";

  // Step 7: syntax highlight
  body.querySelectorAll("pre code").forEach(el => hljs.highlightElement(el));

  // Scroll to top & reset progress bar
  const scrollArea = document.getElementById("scroll-area");
  if (scrollArea) scrollArea.scrollTop = 0;
  const pb = document.getElementById("progress-bar");
  if (pb) pb.style.width = "0%";

  // Step 8: render math (with retry in case KaTeX CDN not yet loaded)
  setTimeout(() => renderMathInDoc(0), 150);
}

function renderMathInDoc(retryCount = 0) {
  if (!window.renderMathInElement) {
    // KaTeX not yet loaded — retry in 200ms up to 15 times (~3 sec max)
    if (retryCount < 15) {
      setTimeout(() => renderMathInDoc(retryCount + 1), 200);
    }
    return;
  }
  const body = document.getElementById("md-body");
  if (!body) return;
  renderMathInElement(body, {
    delimiters: [
      { left: "$$",  right: "$$",  display: true  },
      { left: "$",   right: "$",   display: false },
      { left: "\\[", right: "\\]", display: true  },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
  // Re-apply saved text highlights on top of rendered document
  applySavedHighlights(state.currentPath);
}

// ── SYNC & REFRESH MANAGER ────────────────────────────────────────────────
async function syncNotes() {
  const syncBtn = document.getElementById("sync-btn");
  const syncIcon = document.getElementById("sync-icon");
  if (syncBtn) {
    syncBtn.classList.add("spinning");
    syncBtn.removeAttribute("data-status");
  }

  try {
    if (!isStatic) {
      const idx = await apiGet(`/api/index?_t=${Date.now()}`);
      state.index = idx;
      renderNav(idx);
    }
    if (state.currentPath) {
      await loadContent(state.currentPath);
    }
    // Success feedback
    if (syncBtn && syncIcon) {
      syncBtn.classList.remove("spinning");
      syncBtn.setAttribute("data-status", "success");
      syncBtn.title = "Synced just now";
      syncIcon.textContent = "✅";
      setTimeout(() => {
        syncBtn.removeAttribute("data-status");
        syncBtn.title = "Refresh Notes (Key: R)";
        syncIcon.textContent = "🔄";
      }, 1500);
    }
  } catch (e) {
    // Error feedback
    if (syncBtn && syncIcon) {
      syncBtn.classList.remove("spinning");
      syncBtn.setAttribute("data-status", "error");
      syncBtn.title = "Sync failed — check connection";
      syncIcon.textContent = "❌";
      setTimeout(() => {
        syncBtn.removeAttribute("data-status");
        syncBtn.title = "Refresh Notes (Key: R)";
        syncIcon.textContent = "🔄";
      }, 2000);
    }
  }
}

// Auto-sync when switching back to the browser window/tab from your editor
window.addEventListener("focus", () => {
  if (state.currentPath && !isStatic) {
    syncNotes();
  }
});

// ── ERROR ─────────────────────────────────────────────────────────────────
function showError(msg) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("md-body").style.display = "none";
  const err = document.getElementById("error-box");
  err.textContent = msg;
  err.style.display = "block";
}

// ── SMART TEXT HIGHLIGHTING & ANNOTATIONS ──────────────────────────────────
const hlToolbar = document.getElementById("hl-toolbar");

function getStoredHighlights(filePath) {
  if (!filePath) return [];
  try {
    const raw = localStorage.getItem(`study_hl_${filePath}`);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    return [];
  }
}

function saveStoredHighlights(filePath, list) {
  if (!filePath) return;
  try {
    localStorage.setItem(`study_hl_${filePath}`, JSON.stringify(list));
  } catch(e) {}
}

function getSelectionOffsets(container) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  const preRange = document.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;

  preRange.setEnd(range.endContainer, range.endOffset);
  const end = preRange.toString().length;

  const text = range.toString().trim();
  if (!text || start >= end) return null;

  return { start, end, text, rect: range.getBoundingClientRect() };
}

function highlightOffsets(container, start, end, color, id) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let currentOffset = 0;
  const nodesToWrap = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const nodeLength = node.nodeValue.length;
    const nodeStart = currentOffset;
    const nodeEnd = currentOffset + nodeLength;

    if (nodeEnd > start && nodeStart < end) {
      const overlapStart = Math.max(0, start - nodeStart);
      const overlapEnd = Math.min(nodeLength, end - nodeStart);
      nodesToWrap.push({ node, overlapStart, overlapEnd });
    }
    currentOffset += nodeLength;
  }

  for (let i = nodesToWrap.length - 1; i >= 0; i--) {
    const { node, overlapStart, overlapEnd } = nodesToWrap[i];
    let targetNode = node;
    if (overlapEnd < targetNode.nodeValue.length) {
      targetNode.splitText(overlapEnd);
    }
    if (overlapStart > 0) {
      targetNode = targetNode.splitText(overlapStart);
    }
    const mark = document.createElement("mark");
    mark.className = `study-hl study-hl-${color}`;
    mark.setAttribute("data-hl-id", id);
    targetNode.parentNode.insertBefore(mark, targetNode);
    mark.appendChild(targetNode);
  }
}

function removeHighlightFromDOM(id) {
  const container = document.getElementById("md-body");
  if (!container) return;
  const marks = container.querySelectorAll(`mark[data-hl-id="${id}"]`);
  marks.forEach(mark => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  });
  container.normalize();
}

function removeHighlight(id) {
  removeHighlightFromDOM(id);
  const list = getStoredHighlights(state.currentPath);
  const filtered = list.filter(h => h.id !== id);
  saveStoredHighlights(state.currentPath, filtered);
}

function removeOverlappingHighlights(filePath, start, end) {
  const list = getStoredHighlights(filePath);
  const remaining = [];
  list.forEach(h => {
    if (Math.max(start, h.start) < Math.min(end, h.end)) {
      removeHighlightFromDOM(h.id);
    } else {
      remaining.push(h);
    }
  });
  saveStoredHighlights(filePath, remaining);
}

function updateHighlightColor(id, newColor) {
  const list = getStoredHighlights(state.currentPath);
  const h = list.find(x => x.id === id);
  if (h) {
    h.color = newColor;
    saveStoredHighlights(state.currentPath, list);
  }
  const marks = document.querySelectorAll(`mark[data-hl-id="${id}"]`);
  marks.forEach(m => {
    m.className = `study-hl study-hl-${newColor}`;
  });
}

function applyHighlightFromSelection(color) {
  const container = document.getElementById("md-body");
  const selInfo = getSelectionOffsets(container);
  if (!selInfo) return;

  const id = `hl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Remove any overlapping existing highlights
  removeOverlappingHighlights(state.currentPath, selInfo.start, selInfo.end);

  // Apply new highlight in DOM
  highlightOffsets(container, selInfo.start, selInfo.end, color, id);

  // Add to storage
  const list = getStoredHighlights(state.currentPath);
  list.push({
    id,
    start: selInfo.start,
    end: selInfo.end,
    color,
    text: selInfo.text
  });
  list.sort((a, b) => a.start - b.start);
  saveStoredHighlights(state.currentPath, list);

  window.getSelection()?.removeAllRanges();
}

function applySavedHighlights(filePath) {
  if (!filePath) return;
  const container = document.getElementById("md-body");
  if (!container) return;

  // Clear existing marks in DOM first to avoid duplicates
  container.querySelectorAll("mark.study-hl").forEach(m => {
    const p = m.parentNode;
    while (m.firstChild) p.insertBefore(m.firstChild, m);
    p.removeChild(m);
  });
  container.normalize();

  const list = getStoredHighlights(filePath);
  if (!list.length) return;

  const fullText = container.textContent;
  list.forEach(h => {
    let start = h.start;
    let end = h.end;

    // Verify text matches or find location nearby
    if (fullText.substring(start, end) !== h.text) {
      const idx = fullText.indexOf(h.text);
      if (idx !== -1) {
        start = idx;
        end = idx + h.text.length;
        h.start = start;
        h.end = end;
      } else {
        return; // Text was deleted/changed
      }
    }
    highlightOffsets(container, start, end, h.color, h.id);
  });
  saveStoredHighlights(filePath, list);
}

function showToolbarForRect(rect, activeMarkId = null) {
  if (!hlToolbar) return;
  const wrap = document.getElementById("content-wrap");
  const wrapRect = wrap.getBoundingClientRect();

  const rawLeft = (rect.left - wrapRect.left) + (rect.width / 2);
  const left = Math.max(65, Math.min(wrapRect.width - 65, rawLeft));
  let top = rect.top - wrapRect.top;

  if (top < 45) {
    top = (rect.bottom - wrapRect.top);
    hlToolbar.style.transform = "translate(-50%, 8px)";
  } else {
    hlToolbar.style.transform = "translate(-50%, -100%)";
  }

  hlToolbar.style.left = `${left}px`;
  hlToolbar.style.top = `${top}px`;
  hlToolbar.style.display = "flex";

  state.activeHighlightId = activeMarkId;
}

function hideToolbar() {
  if (!hlToolbar) return;
  hlToolbar.style.display = "none";
  state.activeHighlightId = null;
}

// Prevent button touches from collapsing active selection
if (hlToolbar) {
  hlToolbar.addEventListener("mousedown", (e) => e.preventDefault());
  hlToolbar.addEventListener("pointerdown", (e) => e.preventDefault());

  hlToolbar.querySelectorAll(".hl-btn[data-color]").forEach(btn => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-color");
      if (state.activeHighlightId) {
        updateHighlightColor(state.activeHighlightId, color);
      } else {
        applyHighlightFromSelection(color);
      }
      hideToolbar();
    });
  });

  const clearBtn = document.getElementById("hl-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (state.activeHighlightId) {
        removeHighlight(state.activeHighlightId);
      } else {
        const sel = getSelectionOffsets(document.getElementById("md-body"));
        if (sel) {
          removeOverlappingHighlights(state.currentPath, sel.start, sel.end);
        }
      }
      window.getSelection()?.removeAllRanges();
      hideToolbar();
    });
  }
}

// ── APPLE PENCIL DIRECT INK / HIGHLIGHT MODE ──────────────────────────────
function getCaretRangeFromPoint(x, y) {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const r = document.createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.setEnd(pos.offsetNode, pos.offset);
    return r;
  }
  return null;
}

function createOrderedRange(r1, r2) {
  if (!r1 || !r2) return null;
  const c1 = r1.startContainer;
  const o1 = r1.startOffset;
  const c2 = r2.startContainer;
  const o2 = r2.startOffset;
  const range = document.createRange();
  if (c1 === c2) {
    range.setStart(c1, Math.min(o1, o2));
    range.setEnd(c1, Math.max(o1, o2));
    return range;
  }
  const comp = c1.compareDocumentPosition(c2);
  if (comp & Node.DOCUMENT_POSITION_FOLLOWING) {
    range.setStart(c1, o1);
    range.setEnd(c2, o2);
  } else {
    range.setStart(c2, o2);
    range.setEnd(c1, o1);
  }
  return range;
}

function applyHighlightFromRangeObject(range, color) {
  const container = document.getElementById("md-body");
  if (!container || !range) return;

  const preRange = document.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;

  preRange.setEnd(range.endContainer, range.endOffset);
  const end = preRange.toString().length;

  const realStart = Math.min(start, end);
  const realEnd = Math.max(start, end);
  const text = range.toString().trim();
  if (!text || realStart >= realEnd) return;

  const id = `hl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  removeOverlappingHighlights(state.currentPath, realStart, realEnd);
  highlightOffsets(container, realStart, realEnd, color, id);

  const list = getStoredHighlights(state.currentPath);
  list.push({ id, start: realStart, end: realEnd, color, text });
  list.sort((a, b) => a.start - b.start);
  saveStoredHighlights(state.currentPath, list);
}

function setHighlighterTool(tool) {
  state.activeTool = tool;
  localStorage.setItem("study_reader_tool", tool);

  document.querySelectorAll(".palette-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tool") === tool);
  });

  const body = document.getElementById("md-body");
  if (body) {
    body.classList.remove("tool-active-pen", "tool-active-eraser", "tool-pen-yellow", "tool-pen-green", "tool-pen-red");
    if (tool === "eraser") {
      body.classList.add("tool-active-eraser");
    } else if (tool !== "read") {
      body.classList.add("tool-active-pen", `tool-pen-${tool}`);
    }
  }

  if (tool !== "read") {
    hideToolbar();
    window.getSelection()?.removeAllRanges();
  }
}

// Attach tool palette buttons
document.querySelectorAll(".palette-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setHighlighterTool(btn.getAttribute("data-tool"));
  });
});

// Trigger popup on text selection or clicking existing highlight (Read mode only)
const mdBodyEl = document.getElementById("md-body");
if (mdBodyEl) {
  mdBodyEl.addEventListener("pointerup", (e) => {
    if (state.activeTool !== "read") return;
    setTimeout(() => {
      const clickedMark = e.target.closest("mark.study-hl");
      if (clickedMark) {
        const hId = clickedMark.getAttribute("data-hl-id");
        const rect = clickedMark.getBoundingClientRect();
        showToolbarForRect(rect, hId);
        return;
      }

      const sel = getSelectionOffsets(mdBodyEl);
      if (sel && sel.text.length > 0) {
        showToolbarForRect(sel.rect, null);
      } else {
        hideToolbar();
      }
    }, 40);
  });

  // Direct Apple Pencil & Mouse Drag Handling
  mdBodyEl.addEventListener("pointerdown", (e) => {
    if (state.activeTool === "read") return;

    // Palm rejection: allow fingers to scroll smoothly!
    if (e.pointerType === "touch") return;

    // Eraser mode: direct tap/swipe to erase
    if (state.activeTool === "eraser") {
      const mark = e.target.closest("mark.study-hl");
      if (mark) {
        removeHighlight(mark.getAttribute("data-hl-id"));
      }
      return;
    }

    // Direct Highlighter Pen mode (Apple Pencil or Mouse)
    const range = getCaretRangeFromPoint(e.clientX, e.clientY);
    if (!range) return;

    state.penDrag = {
      active: true,
      anchorNode: range.startContainer,
      anchorOffset: range.startOffset,
      anchorRange: range,
      color: state.activeTool,
    };

    // Initialize selection at pointer point
    const sel = window.getSelection();
    try {
      sel.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
    } catch(err) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
}

window.addEventListener("pointermove", (e) => {
  if (!state.penDrag || !state.penDrag.active) return;
  if (e.pointerType === "touch") return;

  const moveRange = getCaretRangeFromPoint(e.clientX, e.clientY);
  if (!moveRange) return;

  const container = document.getElementById("md-body");
  if (!container || !container.contains(moveRange.startContainer)) return;

  state.penDrag.currentRange = moveRange;

  // Real-time visual feedback: selection extends letter by letter naturally
  const sel = window.getSelection();
  try {
    sel.setBaseAndExtent(
      state.penDrag.anchorNode,
      state.penDrag.anchorOffset,
      moveRange.startContainer,
      moveRange.startOffset
    );
  } catch(err) {
    const ord = createOrderedRange(state.penDrag.anchorRange, moveRange);
    if (ord) {
      sel.removeAllRanges();
      sel.addRange(ord);
    }
  }
});

window.addEventListener("pointerup", (e) => {
  if (!state.penDrag || !state.penDrag.active) return;
  if (e.pointerType === "touch") return;

  const drag = state.penDrag;
  state.penDrag = null;

  const sel = window.getSelection();
  let targetRange = null;

  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
    targetRange = sel.getRangeAt(0);
  } else if (drag.anchorRange && drag.currentRange) {
    const ord = createOrderedRange(drag.anchorRange, drag.currentRange);
    if (ord && ord.toString().trim().length > 0) {
      targetRange = ord;
    }
  }

  if (targetRange && targetRange.toString().trim().length > 0) {
    applyHighlightFromRangeObject(targetRange, drag.color);
  }

  window.getSelection()?.removeAllRanges();
});

// Dismiss toolbar on clicks outside or Escape
document.addEventListener("pointerdown", (e) => {
  if (!hlToolbar || hlToolbar.style.display === "none") return;
  if (hlToolbar.contains(e.target)) return;
  if (e.target.closest("mark.study-hl")) return;
  hideToolbar();
});

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "Escape") {
    hideToolbar();
    setHighlighterTool("read");
  } else if (e.key === "0") {
    setHighlighterTool("read");
  } else if (e.key === "1") {
    setHighlighterTool("yellow");
  } else if (e.key === "2") {
    setHighlighterTool("green");
  } else if (e.key === "3") {
    setHighlighterTool("red");
  } else if (e.key.toLowerCase() === "e") {
    setHighlighterTool("eraser");
  } else if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) {
    syncNotes();
  } else if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey) {
    toggleNotesPanel();
  }
});

// Restore saved tool state
setHighlighterTool(state.activeTool);

// Wire Sync button
const syncBtn = document.getElementById("sync-btn");
if (syncBtn) {
  syncBtn.addEventListener("click", () => syncNotes());
}

// ── THEME TOGGLE (ANTIGRAVITY MODERN LIGHT / DARK) ──────────────────────
const themeBtn = document.getElementById("theme-btn");
const themeIcon = document.getElementById("theme-icon");
const hljsThemeLink = document.getElementById("hljs-theme");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("study_reader_theme", theme);
  if (theme === "light") {
    if (themeIcon) themeIcon.textContent = "☀️";
    if (hljsThemeLink) {
      hljsThemeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
    }
  } else {
    if (themeIcon) themeIcon.textContent = "🌙";
    if (hljsThemeLink) {
      hljsThemeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
    }
  }
}

const currentTheme = localStorage.getItem("study_reader_theme") || 
  (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(currentTheme);

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
  });
}

// ── SIDEBAR TOGGLE & PERSISTENCE ──────────────────────────────────────────
const appEl = document.getElementById("app");

// ── NOTES PANEL ───────────────────────────────────────────────────────────
const notesPanel = document.getElementById('notes-panel');
const notesArea  = document.getElementById('notes-area');
const notesToggleBtn = document.getElementById('notes-toggle-btn');
const notesCloseBtn  = document.getElementById('notes-close-btn');

let notesSaveTimer = null;
if (notesArea) {
  notesArea.addEventListener('input', () => {
    clearTimeout(notesSaveTimer);
    notesSaveTimer = setTimeout(() => {
      saveNotes(state.currentPath, notesArea.value);
    }, 400);
  });
}

function toggleNotesPanel(forceShow) {
  const shouldCollapse = (forceShow !== undefined)
    ? !forceShow
    : !appEl.classList.contains('notes-collapsed');

  if (shouldCollapse) {
    appEl.classList.add('notes-collapsed');
    localStorage.setItem('study_reader_notes_panel', 'collapsed');
    if (notesToggleBtn) {
      notesToggleBtn.classList.remove('active');
      notesToggleBtn.title = 'Open Notes Panel (Key: N)';
    }
  } else {
    appEl.classList.remove('notes-collapsed');
    localStorage.setItem('study_reader_notes_panel', 'expanded');
    if (notesToggleBtn) {
      notesToggleBtn.classList.add('active');
      notesToggleBtn.title = 'Collapse Notes Panel (Key: N)';
    }
    if (notesArea) notesArea.focus();
  }
}

if (notesToggleBtn) notesToggleBtn.addEventListener('click', () => toggleNotesPanel());
if (notesCloseBtn)  notesCloseBtn.addEventListener('click',  () => toggleNotesPanel(false));

// Restore notes panel state (default: collapsed)
const savedNotesPanel = localStorage.getItem('study_reader_notes_panel');
if (savedNotesPanel === 'expanded') {
  appEl.classList.remove('notes-collapsed');
  if (notesToggleBtn) {
    notesToggleBtn.classList.add('active');
    notesToggleBtn.title = 'Collapse Notes Panel (Key: N)';
  }
} else {
  appEl.classList.add('notes-collapsed');
}
const sidebarToggleBtn = document.getElementById("sidebar-toggle");
const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");

function toggleSidebar(forceState) {
  const shouldCollapse = (forceState !== undefined)
    ? !forceState
    : !appEl.classList.contains("sidebar-collapsed");

  if (shouldCollapse) {
    appEl.classList.add("sidebar-collapsed");
    localStorage.setItem("study_reader_sidebar", "collapsed");
    if (sidebarToggleBtn) {
      sidebarToggleBtn.setAttribute("aria-expanded", "false");
      sidebarToggleBtn.title = "Expand Sidebar (⌘B)";
    }
  } else {
    appEl.classList.remove("sidebar-collapsed");
    localStorage.setItem("study_reader_sidebar", "expanded");
    if (sidebarToggleBtn) {
      sidebarToggleBtn.setAttribute("aria-expanded", "true");
      sidebarToggleBtn.title = "Collapse Sidebar (⌘B)";
    }
  }
}

if (sidebarToggleBtn) sidebarToggleBtn.addEventListener("click", () => toggleSidebar());
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener("click", () => toggleSidebar(false));
if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));

// Keyboard shortcut: Cmd+B (Mac) or Ctrl+B
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
    e.preventDefault();
    toggleSidebar();
  }
});

// Restore sidebar state
const savedSidebar = localStorage.getItem("study_reader_sidebar");
if (savedSidebar === "collapsed" || (savedSidebar === null && window.innerWidth < 850)) {
  appEl.classList.add("sidebar-collapsed");
  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute("aria-expanded", "false");
    sidebarToggleBtn.title = "Expand Sidebar (⌘B)";
  }
} else {
  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute("aria-expanded", "true");
    sidebarToggleBtn.title = "Collapse Sidebar (⌘B)";
  }
}

// ── READING PROGRESS SCROLL LISTENER ──────────────────────────────────────
const scrollAreaEl = document.getElementById("scroll-area");
const progressBarEl = document.getElementById("progress-bar");
if (scrollAreaEl && progressBarEl) {
  scrollAreaEl.addEventListener("scroll", () => {
    const maxScroll = scrollAreaEl.scrollHeight - scrollAreaEl.clientHeight;
    const pct = maxScroll > 0 ? (scrollAreaEl.scrollTop / maxScroll) * 100 : 0;
    progressBarEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }, { passive: true });
}

// ── INIT ──────────────────────────────────────────────────────────────────
loadIndex();
