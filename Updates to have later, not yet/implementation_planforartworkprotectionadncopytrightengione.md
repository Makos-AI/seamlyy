# Artwork Protection and Copyright Engine Implementation

This plan outlines the architecture and execution phases for the comprehensive Artwork Protection feature on Seamlyy. It builds directly upon the provided architecture, focusing on frictionless onboarding, immutable signatures, automated steganography/watermark inspections, and front-end scrape protections.

## User Review Required

> [!WARNING]
> **Database `status` Field Conflict**
> Your proposed schema replaces the existing `status` field on `Artwork` with a new `UploadStatus` enum (`PUBLISHED`, `FLAGGED...`). However, `status` is currently used to track the sales state (`NOT_FOR_SALE`, `FIXED_PRICE`, `PREMIUM_LOCKED`). 
> **Decision Made in Plan:** I will introduce a *new* field called `inspectionStatus` to track the flagging states, leaving the sales `status` intact to prevent breaking the marketplace logic.

> [!IMPORTANT]
> **OpenCV and Steganography Environment**
> True OpenCV ORB feature extraction and DWT/DCT steganography require native binaries or dedicated microservices (e.g., a Python backend). Running heavy image processing synchronously in a Next.js API route will cause timeouts. 
> **Decision Made in Plan:** I will implement the *complete architectural pipeline* in Next.js (the stages, the database updates, the UI flags), but I will abstract the actual CV/Steganography logic into placeholder service functions. These will simulate the checks, ready for you to plug in a Python API or WebAssembly module later.

## Proposed Changes

---

### Phase 1: Database Schema Updates
We will update Prisma to support the new protection features, signatures, and community reports.

#### [MODIFY] [`prisma/schema.prisma`](file:///C:/Users/PC/Desktop/Coding/Seamlyy/prisma/schema.prisma)
- **User Model:** Add `protectionActivated` (Boolean), `signatureLocked` (Boolean), `signatureUrl` (String), and `signatureVector` (Json).
- **Artwork Model:** Add `inspectionStatus` (String, default `"PUBLISHED"`), `hasValidSignature` (Boolean), `hasForeignWatermark` (Boolean), and `watermarkPayload` (String).
- **New Model:** `ArtworkReport` to track community flags (`reason`, `details`, relations to `Artwork` and `User`).

---

### Phase 2: Profile Settings & Master Signature
Move the protection activation to the user's dashboard settings so it doesn't block onboarding.

#### [MODIFY] `src/app/(main)/dashboard/settings/page.tsx`
- Add a new "Artwork Protection" tab/section.
- Include a file upload specifically for the master signature.
- Provide a button to permanently lock the signature (`signatureLocked = true`).

#### [NEW] `src/actions/protection.ts`
- Server actions to handle activating protection and locking the master signature.

---

### Phase 3: Upload Inspection Pipeline
Update the upload flow to route artworks through the two-stage inspection.

#### [MODIFY] [`src/actions/artwork.ts`](file:///C:/Users/PC/Desktop/Coding/Seamlyy/src/actions/artwork.ts)
- Update `createArtworkAction` to check the artist's `protectionActivated` status.
- Implement the two stages before saving the final artwork record:
  - **Stage 1 (Signature Check):** Check if signature vector matches. If not, set `inspectionStatus = "FLAGGED_INVALID_SIGNATURE"`.
  - **Stage 2 (Watermark Check):** Scan for foreign invisible watermarks. If found, set `inspectionStatus = "FLAGGED_DUPLICATE_WATERMARK"`.
- Return the specific flag status to the client.

#### [NEW] `src/lib/inspection-engine.ts`
- Create utility functions `verifySignature()` and `scanForWatermark()`. (These will contain the API boundaries for the computer vision services).

---

### Phase 4: Flagged Upload UI Dialogs
When the upload action returns a flag, we need to interrupt the user with the appropriate choices.

#### [MODIFY] [`src/app/(main)/dashboard/upload/page.tsx`](file:///C:/Users/PC/Desktop/Coding/Seamlyy/src/app/(main)/dashboard/upload/page.tsx)
- Integrate state for rendering the warning dialogs.
- Implement **Dialog A (Signature Mismatch)** with options to "Submit for Review" or "Proceed as Unverified".
- Implement **Dialog B (Duplicate Watermark)** with options to "File Dispute" or "Cancel Upload".

---

### Phase 5: Front-End Rendering Defenses
Protect the artwork on the display pages from casual theft (right-click, drag, print).

#### [NEW] `src/components/ProtectedArtCanvas.tsx`
- Create the React component utilizing HTML5 `<canvas>` to render the image instead of an `<img>` tag, blocking context menus and drag events.

#### [MODIFY] `src/app/(main)/artwork/[id]/page.tsx`
- Replace standard `<img>` or `ImageWithFallback` components with the new `ProtectedArtCanvas` for the main display image.

#### [MODIFY] `src/app/globals.css`
- Add CSS `@media print` rules to hide canvases during printing/PDF export.
- Add `user-select: none` utility classes.

---

### Phase 6: Community Reporting
Allow collectors to flag suspicious artwork.

#### [NEW] `src/components/ReportArtworkModal.tsx`
- A modal form collecting the reason (e.g., "Signature Forgery", "Stolen Artwork") and details.

#### [MODIFY] `src/app/(main)/artwork/[id]/page.tsx`
- Add a "Report Artwork" flag button that opens the modal.

#### [MODIFY] `src/actions/report.ts` (New file)
- Server action to handle `prisma.artworkReport.create()`.

## Verification Plan

### Automated / Build Checks
- Run `npx prisma generate` and `npx prisma db push` to ensure schema updates succeed.
- Run `npm run build` to verify type safety across the new `inspectionStatus` fields.

### Manual Verification
1. **Settings:** Navigate to dashboard settings, upload a master signature, and verify it locks successfully.
2. **Upload Simulation:**
   - Upload an artwork. Alter the dummy inspection logic to simulate an invalid signature and verify Dialog A appears.
   - Alter the dummy logic to simulate a duplicate watermark and verify Dialog B appears.
3. **Defense Check:** Open an artwork page, attempt to right-click -> Save As (should be blocked), try dragging the image (should be blocked), and press Ctrl+P (artwork should be hidden with a red warning text).
4. **Reporting:** Click the report button on an artwork, submit a claim, and verify it appears in the database.
