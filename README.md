# DynoX 3D product viewer — REUDE Technologies

Interactive viewer for the DynoX thrust stands: **RTS Compact 5** (5 kgf), **RTS Pro 20** (20 kgf)
and **RTS Ultra 50** (50 kgf). Customers can rotate, zoom and pan; switch designs; see the exploded
sub-assemblies; lay every component out on the table; download the user manual; save images of the
current view; and send a quote request (SRS form) to the REUDE sales team.

## Links to send customers

| Link | Opens |
|---|---|
| `https://<your-domain>/` | RTS Compact 5 |
| `https://<your-domain>/?model=pro-20` | RTS Pro 20 |
| `https://<your-domain>/?model=ultra-50` | RTS Ultra 50 |
| `https://<your-domain>/?quote=1` | Quote request form (this is what the QR code opens) |

## Folder layout

```
index.html, styles.css, app.js      page and viewer engine (three.js r160 in vendor/)
quote.js                            Get a quote form, QR code, email fallback
api/quote.js                        Vercel function that emails the form (needs SMTP settings)
models/*.js                         catalogs: names, descriptions, sub-assemblies, exploded offsets
models/*.nodes.js                   generated maps of 3D bodies to parts (do not hand-edit)
model/*.glb                         compressed 3D models
manuals/*.pdf                       user manuals (downloaded by the User manual button)
assets/                             REUDE logo files and the printable SRS form PDF
vendor/                             three.js and the QR code library
```

## Deploy: GitHub → Vercel, assets on Cloudflare R2

**1. Vercel (connected to GitHub, deploys on every push)**
1. In Vercel, choose Add New → Project and import `REUDE-Technologies/dynox-viewer`.
2. Framework preset: **Other**. Build command: empty. Output directory: `./`. Deploy.
3. Every push to `main` now redeploys automatically; other branches get preview links.

**2. Cloudflare R2 (3D models and manuals)**
1. Cloudflare dashboard → R2 → Create bucket, e.g. `reude-assets`.
2. Bucket → Settings → Public access: connect a custom domain such as `assets.reude.tech`
   (or enable the r2.dev URL for testing).
3. Bucket → Settings → CORS policy: paste `tools/r2-cors.json` (add your own domain if different).
4. Upload the files once: `npx wrangler login`, then `tools/upload-r2.sh reude-assets dynox`.
5. In `site.config.js` set `ASSET_BASE` to e.g. `https://assets.reude.tech/dynox/`, commit and push.

The viewer loads models and manuals from R2 and falls back to the copies in this repo if R2 is
unreachable. To update a model or manual later, re-run the upload script; no redeploy is needed
unless the file name changes.

### Make Get a quote send email

The form posts to `/api/quote`, which emails **cmo_ira@reude.tech** and **business@reude.tech**
with the customer as reply-to. Add these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Example |
|---|---|
| `SMTP_HOST` | `smtp.zoho.in` or `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | the mailbox that sends, e.g. `noreply@reude.tech` |
| `SMTP_PASS` | its password or app password |
| `MAIL_FROM` | `DynoX Viewer <noreply@reude.tech>` |

Until these are set (or when the site is opened without the API), the form falls back to opening the
visitor's email app with the request filled in, addressed to both recipients.

## Viewer behaviour

- **Auto-rotate** starts slowly whenever a design is opened and stops as soon as the visitor interacts. The Rotate button toggles it.
- **Exploded** separates whole sub-assemblies in straight lines parallel to the side view.
- **Spread 0–100 %** moves every component together onto a work table; back to 0 % reassembles it.
- **Save image** downloads a PNG of the current view with labels, model name, state and view name.
- **User manual** downloads the PDF for the selected design.

Keyboard: E exploded, T table layout, L labels, F fit, Esc clear selection.

## Editing text

Customer-facing component text is in `models/compact-5.js`, `models/pro-20.js` and `models/ultra-50.js`.

## Orange slot covers (REUDE standard)

Every DynoX design shows orange T-slot cover strips in the exposed slots of its aluminium extrusions.
They are generated from the 3D model by `tools/slotcovers.mjs`, which finds each slot, skips the
lengths covered by brackets and nuts, and appends one cover mesh per extrusion to the GLB (so the
strips move with their profile in the exploded and table views). In the components list they are one
item, "Slot cover strips". To add covers to a new model:

```
node tools/slotcovers.mjs source.glb model/<name>.glb covers.json "<extrusion node indices>"
```

then add the printed cover node numbers to the model's catalog in `models/`.
