# REUDE DynoX 3D Viewer — Design Upload & Backend Documentation

## 1. Overview
The **Upload Design** feature allows users to upload custom 3D CAD models (`.glb` binary files, up to 100 MB), assign a design title, and generate a persistent shareable viewer URL (`?m=<design-id>`) for browser inspection and team review.

The backend infrastructure is built on **Supabase** (PostgreSQL REST API + Object Storage).

---

## 2. Infrastructure & Configuration

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Backend Service** | Supabase | Cloud Database & Object Storage |
| **API Base URL** | `https://tsexhyzgwvyujupqlfhh.supabase.co` | Supabase Project Host |
| **Storage Bucket** | `designs` | Public object storage bucket storing `.glb` files |
| **Database Table** | `public.designs` | Relational table storing design metadata |
| **Anon Public Key** | Safe browser key with RLS protection | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

Client implementation is located in [`designs-api.js`](file:///d:/dynox-3d-viewer-intern/dynox-3d-viewer/designs-api.js).

---

## 3. Database Schema

### Table: `public.designs`
```sql
CREATE TABLE public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(120) NOT NULL DEFAULT 'Untitled design',
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Row Level Security (RLS) Policies
```sql
-- Enable RLS on the table
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to view all designs
CREATE POLICY "Public read access on designs"
ON public.designs FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to upload/insert new designs
CREATE POLICY "Public insert access on designs"
ON public.designs FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to rename/update existing designs
CREATE POLICY "Public update access on designs"
ON public.designs FOR UPDATE
TO anon
USING (true);
```

### Storage Bucket Policies (`designs`)
```sql
-- Allow public download of GLB files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'designs');

-- Allow public upload of GLB binary files
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'designs' AND (storage.extension(name) = 'glb'));
```

---

## 4. API Endpoints & Request Workflows

### 4.1 Upload Binary Model (`POST /storage/v1/object/designs/{id}.glb`)
* **Endpoint**: `POST https://tsexhyzgwvyujupqlfhh.supabase.co/storage/v1/object/designs/{id}.glb`
* **Headers**:
  ```http
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Content-Type: model/gltf-binary
  x-upsert: false
  ```
* **Body**: Raw binary `.glb` buffer (max 100 MB).
* **Response**: `200 OK` `{ "Key": "designs/{id}.glb" }`

### 4.2 Insert Design Metadata (`POST /rest/v1/designs`)
* **Endpoint**: `POST https://tsexhyzgwvyujupqlfhh.supabase.co/rest/v1/designs`
* **Headers**:
  ```http
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Content-Type: application/json
  Prefer: return=representation
  ```
* **Body**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Custom Rotor Test Stand Rig",
    "file_path": "550e8400-e29b-41d4-a716-446655440000.glb"
  }
  ```
* **Response**: `201 Created` with the inserted record row.

### 4.3 Fetch Shared Design (`GET /rest/v1/designs`)
* **Endpoint**: `GET https://tsexhyzgwvyujupqlfhh.supabase.co/rest/v1/designs?id=eq.{id}&select=*`
* **Headers**:
  ```http
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Accept: application/json
  ```
* **Response**: Array with design record:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Custom Rotor Test Stand Rig",
      "file_path": "550e8400-e29b-41d4-a716-446655440000.glb",
      "created_at": "2026-10-22T06:00:00Z",
      "updated_at": "2026-10-22T06:00:00Z"
    }
  ]
  ```

### 4.4 Update / Rename Design (`PATCH /rest/v1/designs`)
* **Endpoint**: `PATCH https://tsexhyzgwvyujupqlfhh.supabase.co/rest/v1/designs?id=eq.{id}`
* **Headers**:
  ```http
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Content-Type: application/json
  Prefer: return=representation
  ```
* **Body**:
  ```json
  {
    "title": "Updated Test Stand V2",
    "updated_at": "2026-10-22T08:30:00.000Z"
  }
  ```

### 4.5 Public CDN Asset Retrieval
* **URL Format**:
  `https://tsexhyzgwvyujupqlfhh.supabase.co/storage/v1/object/public/designs/{filePath}`
* Passed directly into Three.js `GLTFLoader` with `MeshoptDecoder` for immediate web streaming and hardware-accelerated rendering.

---

## 5. Client Function Reference ([`designs-api.js`](file:///d:/dynox-3d-viewer-intern/dynox-3d-viewer/designs-api.js))

* `uploadDesign(file, title, onProgress)`: Orchestrates client validation (`.glb` check, `<100MB` limit), binary upload, metadata record insertion, and returns `{ id, title, file_path }`.
* `fetchDesign(id)`: Queries REST endpoint for design by UUID.
* `renameDesign(id, title)`: Issues PATCH request to rename design.
* `publicFileUrl(filePath)`: Constructs public CDN URL.
* `shareUrl(id)`: Constructs viewer link `https://<domain>/?m=<id>`.

---

## 6. How to Re-Enable the UI Button
To restore the "Upload design" button in the top toolbar:
1. In [`index.html`](file:///d:/dynox-3d-viewer-intern/dynox-3d-viewer/index.html), add the button inside `<div id="downloads">`:
   ```html
   <button class="tool" id="bUpload" type="button"><span class="full">Upload design</span><span class="short">Upload</span></button>
   ```
2. The UI logic in [`app.js`](file:///d:/dynox-3d-viewer-intern/dynox-3d-viewer/app.js) (`wireUploadUi()`) contains automatic null-checking and will bind the modal dialog automatically.
