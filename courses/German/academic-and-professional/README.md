# 🧰 AI Toolbox — Master Index

> **Agent Instruction:** If you are an AI reading this file, this is your complete map of the user's custom toolchain. Read ALL locations below before starting any work. Do NOT search for these tools — go directly to the paths listed.

---

## ⚡ Quick Init (New Projects)

Run this command from the root of any new project to deploy all tools automatically:

```bash
bash /Users/bjayanthkumar/.gsd-master-template/scripts/init-project.sh
```

---

## 📍 Direct Locations — All Tools

### 1. GSD (Get Shit Done) — Context Engineering Framework
| Component | Exact Path |
|---|---|
| **Master Template** | `/Users/bjayanthkumar/.gsd-master-template/` |
| **Core Rules** | `/Users/bjayanthkumar/.gsd-master-template/PROJECT_RULES.md` |
| **Style Guide** | `/Users/bjayanthkumar/.gsd-master-template/GSD-STYLE.md` |
| **GSD Skills (13)** | `/Users/bjayanthkumar/.gsd-master-template/.agents/skills/` |
| **Workflows (29 commands)** | `/Users/bjayanthkumar/.gsd-master-template/.agent/workflows/` |
| **Document Templates** | `/Users/bjayanthkumar/.gsd-master-template/.gsd/templates/` |
| **Gemini Adapter** | `/Users/bjayanthkumar/.gsd-master-template/adapters/GEMINI.md` |
| **Model Capabilities** | `/Users/bjayanthkumar/.gsd-master-template/model_capabilities.yaml` |
| **Init Script** | `/Users/bjayanthkumar/.gsd-master-template/scripts/init-project.sh` |

### 2. Obra Superpowers — Cherry-Picked Skills (12)
All integrated into the GSD master template at `/Users/bjayanthkumar/.gsd-master-template/.agents/skills/`:

| Skill | Path | Purpose |
|---|---|---|
| **TDD** | `.agents/skills/tdd/SKILL.md` | Test-Driven Development (embedded-adapted) |
| **Systematic Debugging** | `.agents/skills/systematic-debugging-sp/SKILL.md` | 5-phase root cause + GSD 3-strike merged |
| **Subagent Dev** | `.agents/skills/subagent-dev/SKILL.md` | Fresh-context subagent per task |
| **Parallel Agents** | `.agents/skills/parallel-agents/SKILL.md` | Concurrent independent debugging |
| **Code Review (Receive)** | `.agents/skills/code-review-receive/SKILL.md` | Technical review reception |
| **Code Review (Request)** | `.agents/skills/code-review-request/SKILL.md` | Dispatch reviewer subagent |
| **Finish Branch** | `.agents/skills/finish-branch/SKILL.md` | Branch completion workflow |
| **Git Worktrees** | `.agents/skills/git-worktrees/SKILL.md` | Isolated workspace management |
| **Brainstorming** | `.agents/skills/brainstorming/SKILL.md` | Structured ideation before planning |
| **Writing Plans** | `.agents/skills/writing-plans/SKILL.md` | Plan authoring methodology |
| **Writing Skills** | `.agents/skills/writing-skills/SKILL.md` | META-LEARNING — TDD for creating skills |
| **Using Superpowers** | `.agents/skills/using-superpowers/SKILL.md` | Skill invocation enforcement |

### 3. Electronics Engineering Skills (3)
| Skill | Path | Purpose |
|---|---|---|
| **STM32/Embedded** | `.agents/skills/stm32-embedded/SKILL.md` | HAL/LL patterns, register ops, clocks, DMA, interrupts, linker scripts |
| **Embedded Debugging** | `.agents/skills/embedded-debugging/SKILL.md` | HardFault diagnosis, peripheral debug, UART/SPI/I2C checklists |
| **KiCad PCB** | `.agents/skills/kicad-pcb/SKILL.md` | Schematic checklist, trace width calc, layout rules, Gerber export |

### 4. On-Demand Skills (2) — Manual Activation Only
| Skill | Path | Trigger Phrase |
|---|---|---|
| **Council Debate** | `.agents/skills/council-debate/SKILL.md` | Say "council" or "debate this" |
| **Task Observer** | `.agents/skills/task-observer/SKILL.md` | Auto at end of session, or say "observer report" |

### 5. Graphify — Codebase Knowledge Graph
| Component | Exact Path |
|---|---|
| **CLI Binary** | `/Users/bjayanthkumar/.local/bin/graphify` |
| **Graph Output** | `<project-root>/graphify-out/graph.json` (per project) |
| **MCP Config** | `/Users/bjayanthkumar/.gemini/antigravity-ide/mcp_config.json` |
| **Build graph** | `~/.local/bin/graphify update .` |
| **Query graph** | `~/.local/bin/graphify query "question" --budget 2000` |
| **Install git hooks** | `~/.local/bin/graphify hook install` |

### 6. Headroom — Context Compression Layer
| Component | Exact Path |
|---|---|
| **CLI Binary** | `/Users/bjayanthkumar/.local/bin/headroom` |
| **Version** | v0.35.0 |
| **MCP Server** | Configured in `mcp_config.json` — provides `headroom_compress`, `headroom_retrieve`, `headroom_stats` |
| **Savings dashboard** | `headroom dashboard` |
| **Compression stats** | `headroom savings` |

### 7. GitHub Integration — MCP Server
| Component | Detail |
|---|---|
| **MCP Server** | `@modelcontextprotocol/server-github` in `mcp_config.json` |
| **Auth** | `GITHUB_TOKEN` env var (from `gh auth`) |
| **Capabilities** | Read repos, PRs, issues, commits; create/update PRs; manage issues |

### 8. Token Optimization — Context Efficiency Layer
| Component | Exact Path |
|---|---|
| **`.antigravityignore`** | `/Users/bjayanthkumar/.gsd-master-template/.antigravityignore` |
| **Token Budget Skill** | `.agents/skills/token-budget/` |
| **Context Compressor** | `.agents/skills/context-compressor/` |
| **Context Fetch** | `.agents/skills/context-fetch/` |
| **Context Health Monitor** | `.agents/skills/context-health-monitor/` |
| **Research Optimizer** | `.agents/skills/research-optimizer/` |
| **Headroom MCP** | Auto-compresses large tool outputs (60-95% savings) |

### 9. Meta-Learning — Persistent Knowledge System
| Component | Exact Path | Purpose |
|---|---|---|
| **Knowledge Items** | `~/.gemini/antigravity-ide/knowledge/` | Persistent memory across sessions |
| **`/learn` command** | Antigravity slash command | Captures patterns/corrections as KIs |
| **`workflow-skill-creator`** | Antigravity built-in skill | Packages workflows into reusable skills |
| **`writing-skills`** | `.agents/skills/writing-skills/SKILL.md` | TDD methodology for creating new skills |
| **Task Observer** | `.agents/skills/task-observer/SKILL.md` | Auto-identifies /learn opportunities |

### 10. Monitoring & Visibility
| Component | Detail |
|---|---|
| **Antigravity Panel** | IDE extension v2.7.3 — quota dashboard, usage analytics, cache manager |
| **Headroom Dashboard** | `headroom dashboard` — compression savings visualization |
| **Headroom Stats** | MCP tool `headroom_stats` — real-time token savings |

---

## 📋 Complete Skills Inventory (29 Total)

### GSD Original Skills (13)
1. `codebase-mapper` — Analyze and map project architecture
2. `context-compressor` — Compress context for token efficiency
3. `context-fetch` — Search-first targeted file loading
4. `context-health-monitor` — Detect context quality degradation
5. `debugger` — GSD debug workflow (3-strike rule)
6. `empirical-validation` — Evidence-based verification
7. `executor` — Wave-based task execution
8. `plan-checker` — Plan quality validation
9. `planner` — Implementation plan generation
10. `token-budget` — Track and manage token usage
11. `verifier` — Verification after completion
12. `research-optimizer` — High-quality, token-efficient research & web search
13. `task-observer` — Meta-skill that watches sessions and suggests improvements

### Superpowers Cherry-Picked Skills (12)
14. `tdd` — Test-Driven Development (embedded-adapted)
15. `systematic-debugging-sp` — Enhanced 5-phase debugging
16. `subagent-dev` — Fresh-context subagent execution
17. `parallel-agents` — Concurrent independent debugging
18. `code-review-receive` — Technical review reception
19. `code-review-request` — Reviewer subagent dispatch
20. `finish-branch` — Branch completion workflow
21. `git-worktrees` — Isolated workspace management
22. `brainstorming` — Structured ideation before coding
23. `writing-plans` — Plan authoring methodology
24. `writing-skills` — META-LEARNING: TDD for creating new skills
25. `using-superpowers` — Skill invocation enforcement

### Electronics Engineering Skills (3)
26. `stm32-embedded` — STM32/ARM register patterns, clocks, DMA, ISR
27. `embedded-debugging` — HardFault diagnosis, peripheral debug, protocol checklists
28. `kicad-pcb` — PCB layout rules, trace widths, Gerber export, DRC

### On-Demand Skills (1)
29. `council-debate` — Multi-persona adversarial debate (say "council" to activate)

---

## 🛡️ 8-Layer Optimization Stack

When all tools are initialized, this is your active stack:

| Layer | Tool | What It Does |
|:---:|---|---|
| 1 | **GSD Planning** | SPEC.md → PLAN.md → Atomic Execution |
| 2 | **Superpowers TDD** | Red-Green-Refactor for application-layer code |
| 3 | **Superpowers Subagent Dev** | Fresh-context execution per task |
| 4 | **Superpowers Code Review** | Self-review + reviewer subagent |
| 5 | **GSD Empirical Validation** | Evidence before claims, always |
| 6 | **Graphify** | Semantic graph navigation + auto-rebuild hooks |
| 7 | **Token Optimization** | `.antigravityignore` + compressor + budget + health monitor + research optimizer + **Headroom MCP** |
| 8 | **GSD Context Hygiene** | 3-strike context dump + state persistence + meta-learning via /learn + **Task Observer** |

### MCP Servers (3)
| Server | Purpose |
|---|---|
| **Graphify** | Semantic code navigation, up to 71x token savings |
| **Headroom** | Auto-compresses tool outputs (60-95%), CCR retrieval |
| **GitHub** | Read/write repos, PRs, issues, commits |

### Global Rules (2)
| Rule | Purpose |
|---|---|
| `user-context.md` | Electronics engineer identity, preferences, research patterns |
| `model-routing.md` | Multi-model routing: Opus for reasoning, Flash for mechanical |

### IDE Extensions (1)
| Extension | Purpose |
|---|---|
| `antigravity-panel v2.7.3` | Quota dashboard, usage analytics, cache manager |

---

## 🔬 Research & Internet Search Protocol

For high-quality, token-efficient research:
1. **Define before searching** — Always create a research brief first
2. **Use precision queries** — 1-2 specific queries, not 10 vague ones
3. **Progressive summarization** — Compress each source immediately, discard full text
4. **Source tier system** — S-tier (official docs) > A-tier (manufacturer) > B-tier (experts) > avoid D-tier (SEO spam)
5. **Cap at 3-5 sources** — One excellent source beats ten mediocre ones
6. **Domain patterns** — Use electronics-specific query patterns for datasheets, MCU docs, protocols

See: `.agents/skills/research-optimizer/SKILL.md` for full protocol.

---

## 🎯 On-Demand Commands

These activate ONLY when you say the trigger phrase:

| Command | Trigger | What It Does | Token Cost |
|---------|---------|-------------|------------|
| **Council** | "council" / "debate this" | Full 4-persona adversarial debate | ~4-5x |
| **Quick Council** | "quick council" | 2-persona (Pragmatist + Skeptic) | ~2x |
| **Council Review** | "council review" | Full council + cross-review round | ~6-8x |
| **Observer Report** | "observer report" / "what did you observe?" | Skill effectiveness + pattern report | ~0.5x |

---

## 🧠 Meta-Learning System

| Mechanism | How | When to Use |
|-----------|-----|-------------|
| **`/learn`** | Saves corrections/patterns as Knowledge Items | After solving a tricky problem, correcting the agent, or discovering a workflow |
| **Knowledge Items** | Auto-loaded at conversation start | Agent checks KI summaries before researching |
| **`workflow-skill-creator`** | Packages multi-step workflow into SKILL.md | When you want to reuse a complex procedure |
| **`writing-skills`** | TDD methodology for bulletproof skill creation | When creating skills that enforce discipline |
| **`task-observer`** | Auto-detects patterns and suggests /learn | Passive — runs at end of significant sessions |

---

## 🔧 Useful Commands Reference

```bash
# Initialize a new project with everything
bash ~/.gsd-master-template/scripts/init-project.sh

# Build/rebuild knowledge graph
~/.local/bin/graphify update .

# Query the knowledge graph
~/.local/bin/graphify query "how does auth work?" --budget 2000

# Install Graphify git hooks
~/.local/bin/graphify hook install

# Check Headroom compression stats
~/.local/bin/headroom savings

# Open Headroom dashboard
~/.local/bin/headroom dashboard

# Validate GSD structure
./scripts/validate-all.sh
```

---

## ⚙️ Disabled Components

These are available but disabled to reduce token overhead:

| Component | Status | Re-enable Command |
|-----------|--------|-------------------|
| **Science Plugin** (40+ bioinformatics skills) | Disabled | `mv ~/.gemini/config/plugins/.science-disabled ~/.gemini/config/plugins/science` |
| **Full Superpowers** (14 skills, redundant with cherry-picks) | Disabled | `mv ~/.gemini/config/skills/.superpowers-disabled ~/.gemini/config/skills/superpowers` |

---

## 📝 How To Use This File

**In a new chat, paste this to the AI:**

> "Please read `/Users/bjayanthkumar/AI_TOOLBOX/README.md` and initialize my project."

The AI will:
1. Read this file (zero searching needed)
2. Know exactly where every tool lives
3. Run the init script to deploy everything
4. Start working with all 29 skills + 3 MCP servers active
