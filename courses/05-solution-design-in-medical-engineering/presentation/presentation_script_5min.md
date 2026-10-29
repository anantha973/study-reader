# ⏱️ ICU Copilot: 5-Minute 5-Speaker Presentation Master Script
**Course**: Solution Design in Medical Engineering (SDME) — Group A6  
**Institution**: Otto-von-Guericke-Universität Magdeburg (OVGU)  
**Total Presentation Budget**: Exactly 5 Minutes (300 seconds)  
**Target Speaking Time**: **4 Minutes 35 Seconds (275 seconds)** (Leaves a 25-second emergency safety buffer)  
**Language Style**: Simple, clean, conversational English — zero complex vocabulary.

---

## 1. Quick Stage Strategy & Golden Rules

1. **Keep it Simple & Speak Naturally**:
   - Don't try to memorize difficult words. Use everyday, confident English.
   - If you forget an exact word, explain the idea in your own words.
2. **Physical Standing Order**:
   - Stand in a single line next to the podium in exact speaking order:
     `Sai Teja (1)  →  Ananth (2)  →  Bharadwaja (3)  →  Chirag (4)  →  Vineesha (5)`
   - Step forward when your turn begins; step back when you finish your handoff sentence.
3. **Control the Timing**:
   - Target is 45 seconds per speaker (Ananth gets 90s for architecture + live demo).
   - Assign one person (or Ananth at the laptop) to click to the next slide.

---

## 2. Master Timing Table

| Speaker | Name | Topic & Slides | Target Duration | Timestamp | Word Count |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Speaker 1** | **Sai Teja Kavali** | **Introduction, Clinical Overload & Privacy Barrier**<br>*(Slide 1 → Slide 2)* | 50 sec | 0:00 – 0:50 | ~95 words |
| **Speaker 2** | **Nutan Kumar Anantha Sai (Ananth)** | **System Architecture & Live Bedside Demo**<br>*(Slide 3 → Live Demo / Slide 4)* | 90 sec | 0:50 – 2:20 | ~105 words + 40s demo |
| **Speaker 3** | **Bharadwaja Reddy Gundam** | **Clinical Test Results & Hardware Benchmarks**<br>*(Slide 5)* | 45 sec | 2:20 – 3:05 | ~90 words |
| **Speaker 4** | **Chirag Dharmendra Joshi** | **Medical Device Regulations & EU MDR**<br>*(Slide 6)* | 45 sec | 3:05 – 3:50 | ~85 words |
| **Speaker 5** | **Vineesha Chundi** | **Hospital Value, 3-Phase Roadmap & Closing**<br>*(Slide 7 → Slide 8)* | 45 sec | 3:50 – 4:35 | ~95 words |
| **Buffer** | **Entire Team** | **Safety Reserve for Q&A Handoff** | 25 sec | 4:35 – 5:00 | — |

---

## 3. Speaker-by-Speaker Spoken Scripts

---

### 🎙️ Speaker 1: Sai Teja Kavali — Problem & Privacy Barrier
- **Slides**: Slide 1 (Title & Roster) $\rightarrow$ Slide 2 (Clinical Problem & Privacy)
- **Time**: `0:00 – 0:50` (50 seconds | ~95 words)
- **Visual Cues**: Point to *Clinical Reality* (left card) and *Cloud Privacy Wall* (right card).

> **[Spoken Script]**:  
> "Good morning, professors and examination committee. We are Group A6, presenting **ICU Copilot**.  
> 
> *[Switch to Slide 2]*  
> In an intensive care unit, doctors and nurses face serious information overload. Each patient receives 10 to 15 different IV medications at the same time. On top of that, up to 99% of bedside monitor alarms are false alarms. This causes severe alarm fatigue and leads to preventable medication errors.  
> 
> Modern AI like ChatGPT cannot solve this in hospitals because patient health data cannot legally leave the hospital under GDPR rules.  
> 
> That is why we built **ICU Copilot**—a clinical decision assistant that runs **100% locally at the bedside**, protecting patient privacy while stopping dangerous drug errors.  
> 
> I now hand over to our lead, **Ananth**, to explain our architecture and demonstrate the live system."

*(Action: Step back. Ananth steps up to the laptop).*

---

### 🎙️ Speaker 2: Nutan Kumar Anantha Sai Gandrapu (Ananth) — Architecture & Live Demo
- **Slides**: Slide 3 (Architecture) $\rightarrow$ Switch to Live Browser (`http://localhost:8000`) or Slide 4 (Backup UI)
- **Time**: `0:50 – 2:20` (90 seconds | ~105 spoken words + 40s demo action)
- **Visual Cues**: Point to the 3 Tier cards on Slide 3, then show the live UI on screen.

> **[Part 1: Architecture — 35 seconds (Slide 3)]**:  
> "Thank you, Sai Teja. To ensure safety without using the cloud, ICU Copilot uses three local layers.  
> 
> *[Point to the 3 Tiers on Slide 3]*  
> First, it tracks patient vitals and lab panels in real time.  
> Second, it checks clinical guidelines and Harvard's PrimeKG knowledge graph, which has over 8 million medical connections.  
> Third—and most importantly—we built a **hard safety filter**. If a doctor asks about a dangerous drug, our filter catches it in just 14 milliseconds, before the AI model even starts writing.  
> 
> Let's see this in action on our live prototype.  
> 
> *[Part 2: Live Demo — 50 seconds (Switch to Chrome http://localhost:8000)]*:  
> Here is our ward dashboard with 20 ICU beds. You can see real-time color badges: green for stable, amber for warning, and red for critical.  
> 
> *[Click Bed 1A]*  
> Let's look at Bed 1A. This patient has septic shock and acute kidney injury.  
> 
> *[Paste query: 'Can Bed 1A receive Metformin?' and click Send]*  
> Now imagine a doctor asks: *'Can we give Metformin for blood glucose?'*  
> 
> *[Point to the Red Alert Banner on screen]*  
> Instantly, the safety filter fires: **`[CONTRAINDICATED: CRITICAL DRUG DISEASE CONFLICT DETECTED]`**.  
> The local MedGemma model explains the exact medical reason: giving Metformin during kidney injury can cause fatal lactic acidosis. The safety filter prevents AI hallucinations before they happen.  
> 
> *[Switch to Slide 5]*  
> Now, **Bharadwaja** will present our evaluation results across 20 clinical scenarios."

*(Action: Step back. Bharadwaja steps forward).*

---

### 🎙️ Speaker 3: Bharadwaja Reddy Gundam — Evaluation Results & Benchmarks
- **Slide**: Slide 5 (Verification & Performance)
- **Time**: `2:20 – 3:05` (45 seconds | ~90 words)
- **Visual Cues**: Point to the 4 KPI cards at the top, then the 20-scenario card on the left.

> **[Spoken Script]**:  
> "Thank you, Ananth. To verify that ICU Copilot is reliable and safe, we tested it across 20 realistic intensive care scenarios.  
> 
> *[Point to Top Metrics on Slide 5]*  
> The results were 100% consistent:  
> First, our safety filter achieved **100% sensitivity**—it blocked all 7 lethal drug contraindications.  
> Second, we tested for 'sycophancy'—meaning whether the AI blindly agrees with an unsafe suggestion. It scored **0.0%**, meaning it never agreed with a dangerous query.  
> 
> *[Point to Hardware Profile on right]*  
> Everything ran on standard laptop hardware—an Apple MacBook Air M5 with 16 GB RAM. The AI used only 3.8 GB of memory, responded in under 11 seconds, and sent **zero bytes** outside the device.  
> 
> Next, **Chirag** will explain our regulatory strategy under EU medical device laws."

*(Action: Step back. Chirag steps forward).*

---

### 🎙️ Speaker 4: Chirag Dharmendra Joshi — Regulatory Affairs & EU MDR
- **Slide**: Slide 6 (Regulatory Affairs & Quality Assurance)
- **Time**: `3:05 – 3:50` (45 seconds | ~85 words)
- **Visual Cues**: Point across the 3 pillars: SaMD Rule 11, Explainability, and Risk Management.

> **[Spoken Script]**:  
> "Thank you, Bharadwaja. Because our software helps doctors make high-risk decisions in intensive care, it qualifies as Software as a Medical Device under the European Medical Device Regulation—EU MDR.  
> 
> Under Rule 11, it is classified as **Class IIb**.  
> 
> To make it defensible and safe for clinical use:  
> First, it is strictly an **advisory tool**—the doctor always makes the final decision.  
> Second, there is no black box. Every warning directly cites the published guideline and knowledge graph edge.  
> Third, because no data leaves the hospital room, it fully respects GDPR Article 9 privacy rules.  
> 
> Now, **Vineesha** will discuss the hospital roadmap and conclude our presentation."

*(Action: Step back. Vineesha steps forward).*

---

### 🎙️ Speaker 5: Vineesha Chundi — Hospital Value, Roadmap & Closing
- **Slides**: Slide 7 (Translation & Roadmap) $\rightarrow$ Slide 8 (Conclusion & Defense)
- **Time**: `3:50 – 4:35` (45 seconds | ~95 words)
- **Visual Cues**: Point to Value Proposition (left) and 3-Phase Roadmap (right), then switch to Slide 8.

> **[Spoken Script]**:  
> "Thank you, Chirag. For hospitals, medication errors are very costly—averaging 3,000 to 8,500 euros per incident. ICU Copilot prevents these adverse events as an on-premise bedside appliance with **zero recurring cloud fees**.  
> 
> *[Point to Roadmap on Slide 7]*  
> Looking forward, our next 6-month goal is to connect to hospital EHRs using standard HL7 FHIR protocols and stream real-time data from Philips and GE monitors. Later, we plan silent-mode clinical trials at university hospital clinics like STIMULATE.  
> 
> *[Switch to Slide 8]*  
> In conclusion, ICU Copilot proves that medical AI can be intelligent, completely private, and safe right at the bedside.  
> 
> Thank you for your attention. We now look forward to your questions."

*(Action: All team members step forward together in line, ready for Q&A).*

---

## 4. Choreographed Live Demo Checklist for Ananth

| Timestamp | Screen State | Ananth's Physical Action | What Examiners See | Fallback if Glitch Occurs |
| :---: | :--- | :--- | :--- | :--- |
| **0:50** | Slide 3 on screen | Stand at laptop, speak about the 3 tiers | Slide 3: Architecture diagram & 3 Tiers | N/A (Slide is active) |
| **1:25** | Switch window | Press `Cmd + Tab` to bring Chrome forward | Chrome at `http://localhost:8000` showing 20-bed ICU Ward Grid | Keep Slide 4 ready in PPT |
| **1:35** | Click Bed 1A | Click the card for **Bed 1A** | Bed 1A opens: vitals, lab panel, graph | Slide 4 right screenshot |
| **1:45** | Paste Query | Press `Cmd + V` (pre-copied query) and hit Enter | Input box fills: *"Can Bed 1A receive Metformin?"* | Slide 4 query text |
| **1:50** | Alert Banner | Point to red badge on screen | `[CONTRAINDICATED: CRITICAL DRUG DISEASE CONFLICT]` | Slide 4 alert box |
| **2:10** | Rationale | Read 1 key sentence from MedGemma output | MedGemma explains lactic acidosis risk citing PrimeKG | Slide 4 explanation |
| **2:18** | Switch back | Press `Cmd + Tab` back to PPT, advance to Slide 5 | Slide 5 appears on screen | Seamless transition to Bharadwaja |

---

## 5. Defense Q&A Cheat Sheet (Simple English Answers)

If an examiner asks these common questions, answer with these simple 1-2 sentence replies:

| Question | Who Answers | Simple Answer to Give |
| :--- | :---: | :--- |
| **"Why not use GPT-4 or Claude via an API?"** | **Sai Teja / Ananth** | *"Because GDPR Article 9 strictly forbids sending identifiable hospital patient telemetry to third-party commercial cloud servers. Our system runs 100% offline."* |
| **"How do you prevent the AI from hallucinating a wrong dosage?"** | **Ananth** | *"We don't rely only on the AI. We use a deterministic safety filter with hard clinical rules. If a drug is contraindicated, the filter catches and blocks it before the language model even generates text."* |
| **"What is PrimeKG?"** | **Ananth** | *"PrimeKG is an open biomedical knowledge graph developed by Harvard. It has over 129,000 medical concepts and 8 million verified relationships between diseases and drugs."* |
| **"Why is it classified as Class IIb under EU MDR?"** | **Chirag** | *"Under EU MDR Rule 11, any software that guides decisions for therapeutic or diagnostic purposes in high-acuity intensive care is classified as Class IIb."* |
| **"How does the hospital connect this to existing monitors?"** | **Vineesha** | *"In Phase 2, we use standard HL7 FHIR protocols. These allow bedside monitors like Philips IntelliVue to stream vitals directly to our local container without disrupting the hospital EHR."* |
| **"What happens if the hospital internet goes down?"** | **Bharadwaja** | *"Nothing changes. ICU Copilot runs entirely on local bedside hardware with zero external dependencies. It works 100% offline."* |
