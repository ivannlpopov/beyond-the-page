# Beyond the Page — Groq AI prototype v2

Three languages: **EN / NL / RU**. Default local demo is free and rule-based. Live AI uses Groq through a Cloudflare Worker. VANTER and all products are fictional.

## 1. Create the Cloudflare Worker

1. Sign in to https://dash.cloudflare.com/ and go to **Workers & Pages → Create → Worker**.
2. Deploy the starter Worker, open **Edit code**, replace its code with `worker/worker.js`, and **Deploy**.
3. In **Settings → Variables and Secrets**, add:
   - **Secret** `GROQ_API_KEY`: paste your Groq key (do not share it or commit it).
   - **Text variable** `ALLOWED_ORIGIN`: your website's exact origin, e.g. `https://YOURUSERNAME.github.io` (no path or trailing slash).
   - **Text variable** `KNOWLEDGE_BASE_URL`: public base URL of the site, e.g. `https://YOURUSERNAME.github.io/beyond-the-page` (no trailing slash). This is the path containing `data/knowledge.json`.
   - Optional `GROQ_MODEL`: `openai/gpt-oss-20b` (default).
4. Deploy changes if Cloudflare requests it. Copy the Worker URL `https://NAME.ACCOUNT.workers.dev`.

## 2. Publish the site

1. Upload site files (including `data/`, `app.js`, `styles.css`, `index.html`, `config.js`) to GitHub Pages. Do **not** upload `worker/` if unnecessary; it contains no secret but is server-only.
2. Edit `config.js` and put your Worker URL inside the quotes:
   `window.BTP_API_ENDPOINT = 'https://NAME.ACCOUNT.workers.dev';`
3. Refresh your published site. Status should show **LIVE AI**. Enter a free-form request and press **Build my page**.

**Important:** Cloudflare CORS origin must match the real GitHub Pages origin exactly. If the site is `https://user.github.io/project/`, `ALLOWED_ORIGIN` is `https://user.github.io` and `KNOWLEDGE_BASE_URL` is `https://user.github.io/project`. Local `file://` pages cannot use this production Worker unless you change origin handling.

## Test and troubleshoot

- No Worker configured: the local demo engine works without AI.
- **LIVE AI** visible but result says local demo: open browser DevTools → Network; check the Worker request status. 403 = origin mismatch, 503 = secret missing, 502 = model or knowledge URL problem.
- Check `https://YOURUSERNAME.github.io/PROJECT/data/knowledge.json` in a browser; it should show JSON.
- Do not confuse a rule-based fallback page with an AI-generated page. AI pages show **LIVE AI** in the result.
- Cloudflare/Groq free-tier quotas apply. This prototype does not include user authentication or rate limits. Keep access limited for demonstrations; revoke the API key if exposed.
- No real customer records, contracts, or SEVERIN confidential materials are included.
