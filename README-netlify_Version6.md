```markdown
Netlify deployment instructions (static site + optional serverless verification)

Option 1 — Fastest: Netlify drag-and-drop (static-only)
- If you only want the page (client-side format check) and no server verification:
  1. Zip your repository folder (contains index.html).
  2. Sign in to Netlify (https://app.netlify.com).
  3. On your Netlify dashboard click "Add new site" → "Deploy manually" → Drag & drop your zip or folder.
  4. Netlify will publish a random site name; set a nicer one in Site settings.
  - This method does NOT use the function (VERIFY_ENDPOINT in index.html should be set to '' for client-only fallback).

Option 2 — Recommended: Git-backed + Netlify Functions (secure verification)
A. Create a Git repo (GitHub/GitLab/Bitbucket) and push the project (index.html, netlify.toml, netlify/functions/*)
B. In Netlify:
   1. Click "Add new site" → "Import from Git" → connect your Git provider → choose the repo and branch (main).
   2. Build settings: since site is static, leave Build command blank and Publish directory as `.` (or set `public` if you use a build step).
   3. Deploy site — Netlify will build and create a URL.
C. Add environment variables for the function:
   - In Netlify site dashboard → Site settings → Build & deploy → Environment → Environment variables
     - GUMROAD_PRODUCT_PERMA = your-product-permalink
     - GUMROAD_ACCESS_TOKEN = (optional)
D. The Netlify function is available at:
   - https://<your-site>.netlify.app/.netlify/functions/verify-license
E. Edit index.html if you left VERIFY_ENDPOINT blank — set it to:
   - const VERIFY_ENDPOINT = '/.netlify/functions/verify-license';
   Re-deploy (push) the change if required.
F. Test:
   - Open your site, enter a real license key and verify. The function will call Gumroad and return { valid: true } on success.

Option 3 — Local CLI deploy (build + functions)
- Install Netlify CLI: npm i -g netlify-cli
- Login: netlify login
- From your project folder:
  - netlify init    # create or link a site
  - netlify env:set GUMROAD_PRODUCT_PERMA your-product-permalink
  - netlify env:set GUMROAD_ACCESS_TOKEN your-token   # optional
  - netlify deploy --prod --dir=.    # publishes site root (index.html) and functions
  - Netlify will return the site URL.

Notes & security
- Always set Gumroad tokens as Netlify environment variables — never put secrets in index.html.
- Notion links are public — anyone with the link can access them. If you need stricter control, serve files as protected downloads from your server or generate short-lived signed URLs.
- Logging & rate-limiting: consider logging verification attempts and adding throttling if needed.

If you want, I can:
- Provide a ready-to-run repo zip (including the function) you can upload to Netlify by drag & drop.
- Walk you step-by-step live: tell me which hosting option you prefer (drag-and-drop, Git import, or Netlify CLI) and I’ll give the exact commands/screens to follow.
```