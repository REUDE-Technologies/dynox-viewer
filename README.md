# REUDE DynoX — Interactive 3D Thrust Stand Viewer

A high-performance, web-based 3D product viewer and engineering assembly visualizer for the **DynoX** series of thrust and torque test stands by **REUDE Technologies**.

Built with pure vanilla Three.js and ES Modules. Fully static, zero-build architecture that runs in any modern browser.

---

## Supported Stand Models

| Model | Rating | Thrust Axis | Primary Applications | 3D Model Asset |
| :--- | :--- | :---: | :--- | :--- |
| **RTS Compact 5** | 5 kgf (50 N) | `+X` | Micro/mini drone motors, small UAV propellers, benchtop R&D | `model/5kg.glb` |
| **RTS Pro 20** | 20 kgf (200 N) | `+Z` | Industrial multicopters, eVTOL subscale testing, high-torque BLDC | `model/20kg.glb` |
| **RTS Ultra 50** | 50 kgf (500 N) | `-Z` | Heavy-lift UAVs, agricultural drones, large-diameter propulsion | `model/50kg.glb` |

---

## Key Features

* **Photorealistic 3D WebGL Rendering**:
  * Physically-Based Rendering (PBR) materials: anodized 6061 aluminium, carbon fiber weave, matte 3D-printed PLA, green solder-mask PCB, and optical acrylic.
  * Studio softbox lighting, directional sun with PCF soft shadows, and warm engineering beige backdrop.
* **Engineering Exploded Views**:
  * Smooth, interpolated explode animation with interactive distance slider (0% assembled to 100% exploded).
  * Generous component spacing (130 mm – 160 mm uniform intervals) along natural mechanical assembly axes with zero overlapping or visual crowding.
  * **DAQ Module Subassembly**: Tiered vertical explosion directly over its chassis mount (housing seated on rail, PCB at +55 mm, REUDE logo lid at +110 mm).
  * **Propeller Blades**: Synchronized grouping in a dedicated forward section ahead of the hub lock-nut and clamp collar.
* **Interactive Parts Catalog & Callout Labels**:
  * Interactive SVG leader lines and numbered callout pins dynamically tracked to 3D parts.
  * Collapsible parts dashboard grouped by assembly section (Frame and base, Force-sensing head, Motor and propeller, Sensors and electronics, Fasteners).
  * Part selection with isolate mode, zoom-to-part camera framing, and material specifications.
* **Calibrated Camera Presets**:
  * Model-aware camera orientations for **Front** (direct head-on view of motor/propeller face), **Side** (profile elevation), **Top** (overhead bench plan), and **Iso** (isometric perspective).
* **Quotation & Documentation Suite**:
  * Model-specific PDF user manual downloads (`manuals/compact5.pdf`, `manuals/pro20.pdf`, `manuals/ultra50.pdf`).
  * "Get a quote" modal with ROTRIX SRS form integration and mobile QR code scanner.
  * High-resolution image capture with studio vignette overlay (`Save image`).

---

## Project Structure

```
dynox-3d-viewer/
├── index.html                           # Main application HTML shell
├── styles.css                           # UI design system & responsive layout (warm beige theme)
├── app.js                               # Core Three.js scene, rendering, camera, and interaction logic
├── models.js                            # Model registry, exploded-view vectors, and part categorization
├── catalog.js                           # Component taxonomy, metadata, and default catalog items
├── bom.js                               # Bill of materials pricing, currency, and reference mapping
├── bom.html                             # Printable / exportable Bill of Materials page
├── quote.html                           # Interactive ROTRIX SRS quote request form
├── designs-api.js                       # Supabase client integration for shared design uploads
├── Logo-Primary.png                     # Cropped, full-resolution REUDE Technologies logo
├── dynox_thrust_stands_components.csv   # Consolidated components breakdown for all 3 models (77 rows)
├── DESIGNS_BACKEND_DOCUMENTATION.md     # Complete backend architecture & API reference
├── package.json                         # Project metadata and local launch scripts
├── vercel.json                          # Production deployment headers and caching rules
│
├── model/                               # 3D CAD assets (Meshopt-compressed GLTF binaries)
│   ├── 5kg.glb                          # RTS Compact 5 model
│   ├── 20kg.glb                         # RTS Pro 20 model
│   └── 50kg.glb                         # RTS Ultra 50 model
│
├── manuals/                             # Official PDF user manuals per model
│   ├── compact5.pdf                     # RTS Compact 5 User Manual
│   ├── pro20.pdf                        # RTS Pro 20 User Manual
│   └── ultra50.pdf                      # RTS Ultra 50 User Manual
│
├── vendor/                              # Bundled third-party libraries (no CDN dependency)
│   ├── three/                           # Three.js r160 core and addons (OrbitControls, GLTFLoader)
│   └── qr/                              # QR code generator library
│
└── tools/                               # Development and data export utilities
    ├── convert-step.mjs                 # SolidWorks STEP to GLB converter
    └── generate-components-csv.mjs      # CSV components generator script
```

---

## Quick Start (Local Development)

Because the viewer uses modern JavaScript ES Modules (`import`/`export`), it must be served through a local HTTP server (browsers block module loading over `file://` protocol):

### Option 1: Python (Recommended, no install required)
```bash
python -m http.server 8765
```
Open **[http://127.0.0.1:8765](http://127.0.0.1:8765)** in your browser.

### Option 2: Node.js (via package.json)
```bash
npm start
```

### Option 3: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## Direct URL Stand Parameters

You can navigate directly to any model using URL query parameters:
* **RTS Compact 5**: `http://127.0.0.1:8765/?stand=compact5`
* **RTS Pro 20**: `http://127.0.0.1:8765/?stand=pro20`
* **RTS Ultra 50**: `http://127.0.0.1:8765/?stand=ultra50`

---

## Production Deployment

The project is static and requires zero build steps or server-side runtimes.

### Vercel
1. Push this directory to your GitHub / GitLab repository.
2. Import the project into Vercel.
3. Framework Preset: **Other**. Build Command: *leave empty*. Output Directory: `./`.
4. Deploy. The included `vercel.json` automatically configures caching headers for GLB models.

### Alternative Hosts
Compatible with any static hosting platform: Netlify, Cloudflare Pages, AWS S3 + CloudFront, or Apache/Nginx.

---

## Data & Export Documentation

* **[`dynox_thrust_stands_components.csv`](./dynox_thrust_stands_components.csv)**: Full components table with 77 classified parts across all three stands, formatted with Model ID, Model Name, Rating, Item #, Part Name, Section, Material, Quantity, and Description.
* **[`DESIGNS_BACKEND_DOCUMENTATION.md`](./DESIGNS_BACKEND_DOCUMENTATION.md)**: Architecture documentation covering the Supabase Storage bucket, PostgreSQL table schema, Row-Level Security policies, and REST API endpoints.

---

## License

Proprietary © 2026 REUDE Technologies. All rights reserved.
