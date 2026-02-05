# 🚀 Deployment Guide: Render.com

Since Cloudflare has strict size limits (3MB) for the Free Tier, **Render.com** is the best alternative for your Full-Stack Next.js app. It runs your code as a real server, so you never hit those "bundle size" errors.

## 1. Setup on Render

1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository: `ai-integrated-pos-system`.

## 2. Configuration (Important!)

Render will try to guess your settings, but double-check these:

*   **Name:** `smart-pos-system` (or whatever you like)
*   **Region:** `Singapore` (Best for Laos/SE Asia) 🌏
*   **Branch:** `main`
*   **Runtime:** `Node`
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`
*   **Plan:** `Free` (Your app will "sleep" after 15 mins of inactivity, but wakes up when you visit it).

## 3. Environment Variables

Click on **"Environment"** or **"Advanced"** and add these 5 keys (Same as before):

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `libsql://...` (Your Turso URL) |
| `TURSO_AUTH_TOKEN` | `ey...` (Your Turso Token) |
| `NEXTAUTH_SECRET` | `528f...` (The secure key we generated) |
| `NEXTAUTH_URL` | `https://your-app-name.onrender.com` (Update this after you create the service!) |
| `GEMINI_API_KEY` | `AIza...` (Your AI Key) |

## 4. Deploy!

1.  Click **Create Web Service**.
2.  Watch the logs. It will take about 3-5 minutes.
3.  Once it says **"Live"**, click the link at the top (e.g., `https://smart-pos.onrender.com`).

**That's it! No code changes needed.** ✅
