// DynoX viewer settings.
// ASSET_BASE: where the large files (3D models in model/ and manuals in manuals/) are served from.
//   ''                                   -> served by this site (Vercel), the default
//   'https://assets.reude.tech/dynox/'   -> Cloudflare R2 bucket on a custom domain (keep the trailing slash)
//   'https://pub-xxxxxxxx.r2.dev/'       -> Cloudflare R2 public development URL
// If R2 cannot be reached, the viewer falls back to the copies on this site automatically.
export const ASSET_BASE = '';
