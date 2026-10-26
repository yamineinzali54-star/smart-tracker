<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SmartTrack AI Agent

This app is now structured as an **AI agent** for personal expense tracking.

## Agent capabilities

- **Autonomous response**: interprets user intent and responds conversationally.
- **Task execution**: can add expense, delete latest expense, clear all, or summarize.
- **API integration**: uses Gemini (`gemini-1.5-flash`) for action planning.
- **Memory system**: stores short-term conversation history in localStorage.
- **Error handling**: falls back to deterministic parsing when API output fails.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` and set your key:
   ```bash
   VITE_GEMINI_API_KEY=your_key_here
   ```
3. Start app:
   ```bash
   npm run dev
   ```
