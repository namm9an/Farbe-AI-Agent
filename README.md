# Farbe AI Agent

An internal design review tool for color matching and visual consistency checks. Upload a reference brand asset and the design you are working on — the app extracts both palettes, scores the match, and returns designer-readable findings and suggestions.

Built for event creatives, partner branding, banners, booth assets, and campaign graphics at E2E Networks.

---

## What it does

- Extracts dominant color palettes from any uploaded image using deterministic pixel analysis
- Compares reference and target palettes using CIE76 perceptual color distance
- Scores the match from 0–100 and classifies colors as primary, secondary, accent, or neutral
- Flags mismatched tones and imbalances with plain-language findings
- Generates actionable suggestions via a hosted Qwen vision-language model (optional — works without it too)
- Persists all analysis runs to SQLite for internal history

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Image processing | Sharp |
| Color comparison | Custom CIE76 implementation |
| AI suggestions | OpenAI-compatible endpoint (Qwen3-VL-8B-Instruct via E2E inference) |
| Persistence | SQLite via better-sqlite3 |
| Deployment | Single Next.js process on Ubuntu VM, nginx reverse proxy |

---

## Getting started locally

```bash
git clone https://github.com/namm9an/Farbe-AI-Agent.git
cd Farbe-AI-Agent
npm install
cp .env.example .env
# fill in your E2E_LLM_API_KEY in .env
npm run dev
```

App runs at `http://localhost:3000`.

The LLM layer is optional — if `E2E_LLM_API_KEY` is not set, the app still runs and returns deterministic findings and suggestions without the model narrative.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `E2E_LLM_BASE_URL` | No | Base URL of your OpenAI-compatible inference endpoint |
| `E2E_LLM_API_KEY` | No | API key for the inference endpoint |
| `E2E_LLM_MODEL` | No | Model name (default: `Qwen/Qwen3-VL-8B-Instruct`) |
| `DATABASE_URL` | No | Path to the SQLite file (default: `data/farbe.db`) |

---

## Project structure

```
src/
  app/
    api/analyze/       # POST endpoint — runs the full analysis pipeline
    layout.tsx
    page.tsx
  components/
    analyzer-form.tsx  # Upload panel for reference and target images
    results-panel.tsx  # Palette display, match score, findings, suggestions
  lib/
    analysis/
      color-extraction.ts   # Pixel bucketing and palette extraction using Sharp
      compare-palettes.ts   # CIE76 delta-E matching, scoring, findings, suggestions
    llm/
      client.ts        # Wraps the hosted Qwen endpoint for suggestion narratives
    db.ts              # SQLite setup and analysis run persistence
    env.ts             # Typed environment config
  types/
    analysis.ts        # Shared TypeScript types
scripts/
  start-vm.sh          # Production start with configurable host and port
  deploy-vm.sh         # Install, build, kill old process, and restart on VM
deploy/
  nginx/
    farbe-ai-agent.conf  # nginx server block for farbe.docustory.in
```

---

## Deploying to the VM

```bash
# On the VM
cd /root
git clone https://github.com/namm9an/Farbe-AI-Agent.git farbe-ai-agent
cd farbe-ai-agent

# Create .env with your actual values
cp .env.example .env
nano .env

# Deploy (install, build, start on port 3001)
bash scripts/deploy-vm.sh
```

App will be running at `http://205.147.100.39:3001`.

When the domain `farbe.docustory.in` is ready, enable the nginx config:

```bash
ln -s /etc/nginx/sites-available/farbe-ai-agent /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d farbe.docustory.in
```

---

## Pulling updates on the VM

```bash
cd /root/farbe-ai-agent
git stash
git pull origin main
git stash drop
bash scripts/deploy-vm.sh
```

---

## How the analysis works

1. Both images are resized to 180×180 and converted to raw RGBA pixels using Sharp
2. Transparent, near-white, and near-black pixels are excluded
3. Remaining pixels are bucketed into 16-step color groups and sorted by frequency
4. The top 6 colors per image become the extracted palette
5. Each reference color is matched to its closest target color using CIE76 delta-E distance
6. A weighted match score (0–100) is computed from distances and color weights
7. Findings and suggestions are built from the match data
8. If an LLM endpoint is configured, the structured findings are sent to Qwen for a plain-language summary and two additional recommendations
9. The result is returned to the UI and saved to SQLite
