# Specimen Catalog & Inventory 💎🏷️

This folder houses individual records of your cataloged specimens. These records feed the **Provenance Engine** to generate shop displays, tablet maps, and print-ready QR codes or Specimen Cards.

Each cataloged stone should have its own file named `SPEC-XXX.md`.

---

## 🏷️ Shop Specimen Card Template

Copy and paste this template when a stone is selected for the shop catalog:

```markdown
# Specimen Record: [SPEC-001]

*   **Status**: [Rough / In Tumble / Cabinet / Ready for Shop / Sold]
*   **Inventory Price**: [e.g., 45 PLN]
*   **QR Code Link**: [Generated URL]

---

## 🏛️ Zagroda Alpakoterapii — Provenance Card

### 🪨 [Specimen Name: e.g., Sudeten Milky Quartz]
> *"A beautiful piece of local history, hand-found right here in the Izera Foothills."*

*   **Discovery Location**: Mirsk area, Lower Silesia, Poland
*   **Coordinates**: `50.912345, 15.387654`
*   **Geological Formation**: Izera Gneiss / Izera Metamorphic Zone
*   **Estimated Age**: ~500 Million Years (Neoproterozoic / Early Paleozoic)
*   **Lore & History**: 
    The Mirsk and Świeradów-Zdrój area was actively searched by the Walloons ( medieval mineral prospectors from Western Europe) who left secret symbols carved in stone. Quartz was highly prized by them as a guide mineral for precious metals and gemstones.

---

## ⚙️ Processing & Tumbling History
*   **Cleaned**: YYYY-MM-DD
*   **Tumble Run ID**: [e.g., Run #1]
*   **Process Detail**: Tumbled for 4 weeks through 4 stages of silicon carbide and aluminum oxide polishing.
*   **Finished State**: Smooth, glass-like shine highlighting internal crystalline fractures.
```

---

## 🖼️ Specimen Media
Keep photos of your cataloged specimens in a subdirectory: `specimens/photos/SPEC-XXX-front.jpg`. High-resolution pictures will be utilized by the VLM (Vision-Language Model) for automated identification, grading, and validation.
