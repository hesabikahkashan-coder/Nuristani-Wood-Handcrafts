# Production V1 Verification Checklist

Execute these validation actions to verify major system modules have transitioned smoothly to Production-Ready status.

---

## 1. Deep Routing Handshake Verification
- [ ] **Direct URL Loading**: Enter `https://<YOUR_APP_URL>/blog` or `https://<YOUR_APP_URL>/about` directly into your browser's navigation bar. Confirm that the application loads that view directly (rather than defaulting to the HomePage).
- [ ] **Item Deep Links**: Access a product directly using `/products/<id>` (e.g., `/products/prod-1`) and a blog post directly via `/blog/<slug>` (e.g., `/blog/geometry-kafiristan`). Ensure that the detail page corresponding to that precise item is opened immediately upon page initialization.
- [ ] **History Steppers**: Use the browser's Back and Forward buttons. Verify that navigation states transition cleanly, keeping layout translations and current page history in lockstep.
- [ ] **Dynamic SEO Tracking**: Inspect the source elements of any deep link route. Confirm that the `<title>` and `<meta name="description">` blocks update dynamically to reflect the parameters of the active route.

---

## 2. Zero-Trust Administration Security Handshake
- [ ] **Credentials Decoupling Verification**: Boot the server without setting `ADMIN_EMAIL` or `ADMIN_PASSWORD` secrets. Attempt to submit credentials at `/api/admin/login`. Verify that logging warns of missing credentials on the server and blocks login with `500 Server Misconfiguration`.
- [ ] **Handshake Verification**: Navigate directly to `/api/admin/verify`. Confirm that without providing a valid admin authorization header, the server returns an HTTP status code `401 Unauthorized`.
- [ ] **Rate Limiting Restraints**: Attempt to make 10 consecutive bad login submissions to `/api/admin/login` within 10 seconds. Verify that the rate limit captures the fast automatons and return status `429 secured request threshold exceeded`.

---

## 3. Upload Security Sanitization Handshake
- [ ] **MIME & Extension Matching**: Attempt to upload a raw text script disguised with file extension `.png` or `.pdf`. Confirm that the magic headers validation check blocks the submission with an error code `400 Security breach block: Base64 data signature violates correct graphic headers`.
- [ ] **File Size Blockers**: Attempt to upload an image asset of size exceeding `5MB`. Verify that the size controller rejects the file.
- [ ] **Multiple Sizes Delivery**: Perform a valid image upload. Verify that the endpoint returns a JSON response containing correct absolute URLs for `url`, `thumbnailUrl`, `mediumUrl`, and `largeUrl`.

---

## 4. PWA Installation & Offline Resiliency Handshake
- [ ] **Installation Launcher**: Load the app in Chrome or Edge. Ensure that the PWA install option is available in the browser search bar.
- [ ] **Offline Loading**: Using Chrome DevTools, check the "Offline" checkbox in the "Network" panel. Reload the page. Verify that the system loads stored offline files smoothly from the Service Worker cache.
