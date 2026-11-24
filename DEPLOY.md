# Deploy Sukesh Forge — free, with a .dev domain

The site is plain HTML/CSS/JS. There is nothing to install or build, so it cannot fail on a build step.
Open `index.html` in a browser to preview it right now.

## 0. Before anything: edit `js/config.js`
1. `email` → your real inbox.
2. `web3formsKey` → go to https://web3forms.com, enter your email, they mail you an **Access Key**. Paste it.
   Every contact-form message then lands in that inbox, with the visitor's email as the reply-to.
   (The key is safe to keep public; it can only send mail to you.)
3. Optional: `github` and `whatsapp` links (leave `''` to hide).

Until the key is set, the form falls back to opening the visitor's email app, so nothing is lost.

## 1. Put it on GitHub
1. Create a new **public** repo on github.com (e.g. `sukesh-forge`). Do not add a README.
2. In this folder:
```bash
git init
git add .
git commit -m "Sukesh Forge portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/sukesh-forge.git
git push -u origin main
```

## 2. Turn on GitHub Pages (free hosting)
Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
After ~1 minute the site is live at `https://<your-username>.github.io/sukesh-forge/`.

## 3. Get a free .dev domain
- **GitHub Student Developer Pack** (you are a student): sign in at https://education.github.com/pack, find the
  domain offer (Name.com has offered a free `.dev` for a year). Claim it and register e.g. `sukeshforge.dev`.
  Offers change and the domain renews at normal price after the free period, so check the terms on that page.
- **Fully free forever alternative:** a `yourname.is-a.dev` sub-domain (https://is-a.dev, requested by pull request).

## 4. Connect the domain to GitHub Pages
At your domain registrar's DNS panel add:

| Type  | Name | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| CNAME | www  | `<your-username>.github.io` |

Then repo → **Settings → Pages → Custom domain** → type `sukeshforge.dev` → Save.
Tick **Enforce HTTPS** when it becomes available (can take from a few minutes to an hour).
`.dev` domains only work over HTTPS, and GitHub gives you the certificate for free.
GitHub adds a `CNAME` file to the repo itself; run `git pull` before your next push.

## 5. Test the contact form
Open the live site, send yourself a message, check your inbox (and spam the first time).

## Updating the site later
Edit text, services or projects in `js/data.js`, then:
```bash
git add . && git commit -m "Update" && git push
```
It goes live in about a minute.

## Keep the site honest
Projects marked **Made-to-order** are systems you can build. When you deliver one for a real client, change its
`badge` to `'Live client'` and add the link. Add your own EKIP details in `js/data.js` as you like.

## If something looks wrong
- Blank page on github.io: Pages not enabled yet, or wait a minute and hard-refresh (Ctrl+Shift+R).
- Domain shows a certificate warning: wait for HTTPS provisioning, then tick Enforce HTTPS.
- Form says "opening your email app": the Web3Forms key in `config.js` is still the placeholder.
- Form fails: check the key is copied exactly, and that you confirmed your email with Web3Forms.
