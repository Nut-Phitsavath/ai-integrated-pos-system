# Final Deployment Guide

Follow these 3 steps exactly to get your site live.

## Step 1: Push Code
I have already prepared your code and committed it. You just need to send it to GitHub.
Run this in your terminal:
```powershell
git push
```
*(If it says "upstream not set", run the command it suggests, usually `git push --set-upstream origin master`)*

## Step 2: Get Database Credentials (Turso)
You already have a database called `smart-pos` (Active and Healthy).
You just need to get the connection details for Cloudflare.

1.  **Get Credentials (SAVE THESE):**
    *   **URL:** `turso db show smart-pos --url`
        *(Example: libsql://smart-pos-yourname.turso.io)*
    *   **Token:** `turso db tokens create smart-pos`
        *(It's a very long string, copy the whole thing)*

## Step 3: Configure Cloudflare Pages
1.  Go to Cloudflare Dashboard -> **Select Repository** -> `smart-pos-system`.
2.  **Build Settings** (Use these EXACTLY):
    *   **Framework Preset:** `Next.js`
    *   **Build Command:** `npm run pages:build`
    *   **Output Directory:** `.vercel/output/static`

3.  **Environment Variables** (Add these):
    *   `DATABASE_URL`: (Paste your Turso URL from Step 2)
    *   `TURSO_AUTH_TOKEN`: (Paste your Turso Token from Step 2)
    *   `NEXTAUTH_SECRET`: (Type any random long password here)
    *   `NEXTAUTH_URL`: `https://YOUR-PROJECT-NAME.pages.dev` (You can update this after deployment if the URL changes)

4.  Click **Save and Deploy**.
