# Walloon Prospector (Waloński Poszukiwacz) 🧭🪨

Welcome to **The Walloon Prospector**, a hybrid geology scanning, logging, and retail provenance web application based at **Zagroda Alpakoterapii**. The app is themed around the historical medieval Walloons (*Walończycy*)—the legendary mineral hunters of the Sudeten mountains.

---

## 👥 Dual-Mode App Features

1.  **Public Visitor Experience**:
    *   **The Walloon's Eye (Scanner)**: Snap a photo of a mineral to identify it and read a kid-friendly alchemical Walloon legend in **English (EN)**, **Polish (PL)**, or **Czech (CS)**.
    *   **The Lost Map**: Interactive map showing trail pathways, historic mines (Krobica's St. John), and mineral outcrops.
2.  **Private Admin Portal**:
    *   **Specimens Catalog**: Take photos of found stones and let Gemini automatically parse geological names, hardness, and folklore.
    *   **Walk Logs**: Log walk dates, coordinates, and notes.
    *   **Tumble Forge**: Track tumbling stages (Coarse, Medium, Pre-Polish, Polish, Burnishing) and active batches.
    *   **Provenance Scribe**: Print custom parchment specimen cards with QR codes and stories in all three languages.

---

## 📁 Project Directory Structure

*   `src/app/`: Next.js App Router source (Public Pages, Admin Panel, and API Routes).
*   `src/lib/translations/`: Multilingual context and dictionaries for EN, PL, and CS.
*   `prisma/schema.prisma`: Database mapping walks, specimens, and tumble runs.
*   `deploy-vps.ps1`: Remote deployment script to sync with Hostinger VPS.
*   `docs/`: Main geology and prospecting guides:
    *   [prospector_briefing.md](file:///f:/Rocks/docs/prospector_briefing.md): Vision and strategy archive.
    *   [beginners_field_guide.md](file:///f:/Rocks/docs/beginners_field_guide.md): English guide to Sudeten minerals.
    *   [dog_walk_protocol.md](file:///f:/Rocks/docs/dog_walk_protocol.md): Field logging protocol.
    *   [tumbling_log.md](file:///f:/Rocks/docs/tumbling_log.md): Tumbler logs template.

---

## 🚀 Getting Started

### 1. Configure local variables
Ensure your `.env` file contains:
*   `DATABASE_URL` (custom Postgres schema URL)
*   `GEMINI_API_KEY` (Gemini API access)
*   `AUTH_SECRET` & `AUTH_GOOGLE_*` (Google OAuth)
*   `ALLOWED_EMAILS` (Your whitelisted emails)

### 2. Start the local server
```bash
npm run dev
```
Open **[http://localhost:3500](http://localhost:3500)** in your browser.

---

## 🚢 VPS Deployment

The app is set up to deploy to the same **Hostinger VPS** (`46.202.129.30`) as EviScout, running isolated on port **`3500`** under **PM2**.

### 1. Initialize and Push to GitHub
If you haven't already, push your code to your GitHub repository:
```bash
git init
git add .
git commit -m "feat: initial commit of Walloon Prospector"
git remote add origin https://github.com/Janbo63/walloon-prospector.git
git branch -M main
git push -u origin main
```

### 2. Run the deployment script
Deploy directly from your local PowerShell terminal:
```powershell
.\deploy-vps.ps1
```

### 3. Add Domain mapping in Caddy
Add a Caddyfile redirect block on the VPS to point to port `3500` (e.g. for `walon.zagrodaalpakoterapii.com`):
```caddy
walon.zagrodaalpakoterapii.com {
    reverse_proxy localhost:3500
}
```
Reload Caddy on the VPS:
```bash
caddy reload --config /etc/caddy/Caddyfile
```
