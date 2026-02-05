# 🚀 Deployment Guide: Railway.app

Railway is another excellent alternative that uses different infrastructure routing, which may work better from your location in Laos.

## 1. Setup on Railway

1. Go to [railway.app](https://railway.app/)
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository: `ai-integrated-pos-system`
5. Railway will auto-detect it's a Next.js app

## 2. Environment Variables

After deployment starts, click on your service, then go to **Variables** tab and add:

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | Your Turso URL (starts with `libsql://...`) |
| `TURSO_AUTH_TOKEN` | Your Turso token (starts with `eyJ...`) |
| `NEXTAUTH_SECRET` | Your secure key (e.g., `528f6907fca188f9...`) |
| `NEXTAUTH_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` (Railway auto-fills this!) |
| `GEMINI_API_KEY` | Your AI key (starts with `AIza...`) |

**Important:** For `NEXTAUTH_URL`, use the special Railway variable `https://${{RAILWAY_PUBLIC_DOMAIN}}` - it automatically uses your generated domain!

## 3. Deploy Settings

Railway should auto-detect everything, but verify:

*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`
*   **Port:** Railway auto-detects (usually 3000)

## 4. Deploy!

1. Click **Deploy**
2. Wait 3-5 minutes for the build
3. Once live, Railway will show you the URL (e.g., `https://your-app.up.railway.app`)

## 5. Test Connectivity

Before celebrating, test if you can actually reach it from Laos:

```powershell
curl.exe -I -m 10 https://your-app.up.railway.app
```

If this returns `HTTP 200 OK`, you're good! 🎉

---

**Note:** Railway's free tier gives you $5/month credit. Your app should stay well within this limit.
