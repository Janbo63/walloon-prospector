# Project Prospector: Implementation Briefing

**Objective**: Leverage a RAG-based AI ecosystem to optimize geological discovery, mineral identification, and retail business operations at Zagroda Alpakoterapii.

---

## I. The "Geological Agent" Ecosystem (High-Level Architecture)

To move from a hobbyist to a successful prospector/seller, you need an agentic system that acts as your Digital Prospecting Partner.

1. **The Research Agent**: Scrapes historical geological surveys, Walloon folklore, and academic papers on Sudeten mineralogy. Its primary function is to identify "High-Probability Zones" (HPZs) based on geological maps and historic mine locations.
2. **The Identification Agent**: A vision-based RAG agent. You upload photos of your finds; it cross-references them with mineralogical databases to provide identification, hardness estimates, and potential market value.
3. **The Inventory & Valuation Agent**: Manages your shop inventory. It tracks the "story" of each stone (where it was found, its composition, and its historical context) to generate compelling product descriptions for customers.

---

## II. Data Integration & "Scrubbing"

Your competitive advantage is the synthesis of public data and your proprietary knowledge.

* **Ingestion (The Data Scrub)**:
  * **Public Datasets**: Ingest open-source geological survey data of the Lower Silesian region.
  * **Historical Archives**: Use your "Investigative Agent" to OCR and digest historical texts regarding the Walloons and mining in the Mirsk/Świeradów-Zdrój area.
  * **Topographic Analysis**: Feed LiDAR/DEM data into your system. Train the agent to recognize the "signature" of a man-made adit or a quartz-rich outcrop.
* **User-Driven Refinement**:
  As you walk, your field notes become Ground Truth Data. If you find "X" mineral at "Y" coordinates, feed that back into the model to refine its predictive accuracy for the next search area.

---

## III. High-Level Implementation Plan (Phased Approach)

| Phase | Focus | Actionable Task |
| :--- | :--- | :--- |
| **Phase 1: Knowledge Base** | Establishing the "Brain" | Build a RAG database containing local mineral guides and scanned historical maps. |
| **Phase 2: Predictive Modeling** | Scout Optimization | Deploy a simple agent that takes your current GPS and correlates it with geological maps to suggest "hot zones" for your next walk. |
| **Phase 3: Processing** | Shop Integration | Implement the identification agent to assist in grading your stones. Start the "Tumbling Log" to document the journey from field-find to shop-ready. |
| **Phase 4: Monetization** | Retail & Storytelling | Auto-generate "Specimen Cards" for your shop that include the geological age, discovery location, and historical lore of each stone. |

---

## IV. The "Zagroda" Business Model: Premium Storytelling

Selling stones isn't about the rock; it’s about the provenance. Your shop at the farm can command higher prices by positioning every specimen as a piece of "Sudeten History."

* **The Provenance Engine**: Your system should automatically generate a PDF or QR-code-ready card for every stone sold:
  > *"Found at: [Coordinates] | Geological Formation: Izera Gneiss | Associated Folklore: Likely a site favored by medieval Walloons."*
* **Technology-Enhanced Shop**: Use a tablet in your shop to display a map showing where the specific item being sold was found. This turns a simple transaction into a "Local Discovery Experience."

---

## V. Immediate Technical Recommendations

1. **Local Storage**: Since you already maintain a home server, keep your RAG pipeline local. This ensures your discovery "heat maps" and proprietary research stay private.
2. **Vision-Language Model (VLM)**: Use a high-end VLM (like Gemini 1.5 Pro) for the Identification Agent. It is excellent at distinguishing between "bone-looking" quartz and actual fossils or minerals.
3. **The "Scout" Module**: Integrate this as a plugin for your existing EviScout app architecture. You don't need a new app; you need a new Persona for your AI: "The Prospector."
