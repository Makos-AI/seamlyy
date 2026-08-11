import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { processUploadedImage } from "@/lib/image-processing"
import { supabaseAdmin } from "@/lib/supabase"
import { promises as fs } from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { extractLSBWatermark, embedLSBWatermark, generatePHash, compareHashes } from "@/lib/inspection-engine"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentTypeHeader = req.headers.get("content-type") || ""

    // Handle FormData direct file upload (Preferred: handles variants & Supabase upload)
    if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      const folder = (formData.get("folder") as string) || "artworks"

      console.log(`[UPLOAD] Received upload request: folder="${folder}", userId="${session.user.id}"`)

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // Enforce 20MB limit
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "File size exceeds 20MB limit." }, { status: 400 })
      }

      // MIME validation
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and AVIF are allowed." }, { status: 400 })
      }

      console.log(`[UPLOAD] File: "${file.name}", size=${file.size}, type="${file.type}"`)

      const inputBuffer = Buffer.from(await file.arrayBuffer())
      const extension = file.name.split(".").pop() || "jpg"
      const baseKey = `${session.user.id}/${crypto.randomUUID()}.${extension}`

      // --- INSPECTION ENGINE ---
      let inspectionStatus = "PUBLISHED"
      let watermarkPayload = null

      if (folder === "artworks") {
        try {
          const user = await prisma.user.findUnique({ where: { id: session.user.id } })
          if (user?.protectionActivated) {
            // Stage 1: Watermark Scan
            const foreignWatermark = await extractLSBWatermark(inputBuffer)
            if (foreignWatermark && foreignWatermark !== session.user.id) {
              inspectionStatus = "FLAGGED_DUPLICATE_WATERMARK"
              watermarkPayload = foreignWatermark
            }

            // Stage 2: Signature Scan (if not already flagged)
            if (inspectionStatus === "PUBLISHED" && user.signatureHash) {
              const uploadHash = await generatePHash(inputBuffer)
              const distance = compareHashes(uploadHash, user.signatureHash)
              console.log(`[INSPECTION] pHash distance: ${distance}`)
              
              if (distance > 20) {
                inspectionStatus = "FLAGGED_INVALID_SIGNATURE"
              }
            }
          }
        } catch (err) {
          console.error("[INSPECTION] Error:", err)
        }
      }
      // --------------------------

      // Process image variants using sharp
      const processed = await processUploadedImage(inputBuffer, baseKey, file.type)

      // Embed Artist ID Watermark into Master file if protection is active and it's a valid upload
      if (folder === "artworks" && inspectionStatus === "PUBLISHED") {
        try {
          processed.master.buffer = await embedLSBWatermark(processed.master.buffer, session.user.id)
        } catch(e) {
          console.log("[INSPECTION] Failed to embed watermark:", e)
        }
      }

      const bucketName = folder === "covers" ? "covers" : "artworks"
      console.log(`[UPLOAD] Target Supabase bucket: "${bucketName}"`)

      // Attempt upload to Supabase Storage
      let thumbUrl = ""
      let displayUrl = ""
      let masterUrl = ""
      let isSupabaseConfigured = false

      try {
        // Check/ensure bucket exists
        const { data: bData, error: bError } = await supabaseAdmin.storage.getBucket(bucketName)
        console.log(`[UPLOAD] getBucket("${bucketName}"): exists=${!!bData}, error=${bError?.message || 'none'}`)
        
        if (!bData) {
          console.log(`[UPLOAD] Creating bucket "${bucketName}"...`)
          const { error: createErr } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 20971520,
          })
          if (createErr) {
            console.error(`[UPLOAD] Failed to create bucket: ${createErr.message}`)
          } else {
            console.log(`[UPLOAD] Bucket "${bucketName}" created successfully`)
          }
        }

        // Upload thumbnail
        console.log(`[UPLOAD] Uploading thumbnail: key="${processed.thumbnail.key}"`)
        let { error: thumbErr } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(processed.thumbnail.key, processed.thumbnail.buffer, {
            contentType: processed.thumbnail.contentType,
            upsert: true,
          })

        if (thumbErr && (thumbErr.message?.includes("not found") || thumbErr.message?.includes("Bucket"))) {
          console.log(`[UPLOAD] Bucket not found on upload, retrying after create...`)
          await supabaseAdmin.storage.createBucket(bucketName, { public: true })
          const retry = await supabaseAdmin.storage
            .from(bucketName)
            .upload(processed.thumbnail.key, processed.thumbnail.buffer, {
              contentType: processed.thumbnail.contentType,
              upsert: true,
            })
          thumbErr = retry.error
        }

        if (!thumbErr) {
          isSupabaseConfigured = true
          console.log(`[UPLOAD] ✅ Thumbnail uploaded to Supabase`)

          // Upload display variant
          const { error: dispErr } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(processed.display.key, processed.display.buffer, {
              contentType: processed.display.contentType,
              upsert: true,
            })
          if (dispErr) {
            console.error(`[UPLOAD] ⚠ Display upload error: ${dispErr.message}`)
          } else {
            console.log(`[UPLOAD] ✅ Display uploaded to Supabase`)
          }

          // Upload master variant
          const { error: masterErr } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(processed.master.key, processed.master.buffer, {
              contentType: processed.master.contentType,
              upsert: true,
            })
          if (masterErr) {
            console.error(`[UPLOAD] ⚠ Master upload error: ${masterErr.message}`)
          } else {
            console.log(`[UPLOAD] ✅ Master uploaded to Supabase`)
          }

          thumbUrl = supabaseAdmin.storage.from(bucketName).getPublicUrl(processed.thumbnail.key).data.publicUrl
          displayUrl = supabaseAdmin.storage.from(bucketName).getPublicUrl(processed.display.key).data.publicUrl
          masterUrl = supabaseAdmin.storage.from(bucketName).getPublicUrl(processed.master.key).data.publicUrl

          console.log(`[UPLOAD] ✅ All 3 variants uploaded to "${bucketName}" bucket`)
          console.log(`[UPLOAD] thumbUrl: ${thumbUrl}`)
          console.log(`[UPLOAD] displayUrl: ${displayUrl}`)
        } else {
          console.error(`[UPLOAD] ❌ Supabase thumbnail upload failed: ${thumbErr.message}`)
        }
      } catch (sbErr: any) {
        console.error(`[UPLOAD] ❌ Supabase Storage error:`, sbErr.message || sbErr)
      }

      // Local storage fallback if Supabase bucket isn't available yet
      if (!isSupabaseConfigured || !thumbUrl) {
        console.log(`[UPLOAD] ⚠ Falling back to local storage (public/uploads/)`)
        const publicUploadsDir = path.join(process.cwd(), "public", "uploads")
        await fs.mkdir(path.join(publicUploadsDir, path.dirname(processed.thumbnail.key)), { recursive: true })

        await fs.writeFile(path.join(publicUploadsDir, processed.thumbnail.key), processed.thumbnail.buffer)
        await fs.writeFile(path.join(publicUploadsDir, processed.display.key), processed.display.buffer)
        await fs.writeFile(path.join(publicUploadsDir, processed.master.key), processed.master.buffer)

        thumbUrl = `/uploads/${processed.thumbnail.key}`
        displayUrl = `/uploads/${processed.display.key}`
        masterUrl = `/uploads/${processed.master.key}`
        console.log(`[UPLOAD] Local fallback complete: ${thumbUrl}`)
      }

      const response = {
        success: true,
        thumbnailUrl: thumbUrl,
        thumbnailKey: processed.thumbnail.key,
        displayUrl: displayUrl,
        displayKey: processed.display.key,
        highResKey: processed.master.key,
        masterUrl: masterUrl,
        blurDataURL: processed.blurDataURL,
        masterWidth: processed.master.width,
        masterHeight: processed.master.height,
        inspectionStatus,
        watermarkPayload,
        // Legacy fields for backwards compatibility
        url: thumbUrl,
        key: processed.thumbnail.key,
      }

      console.log(`[UPLOAD] ✅ Upload complete. Status: ${inspectionStatus}. Returning response with thumbnailUrl="${thumbUrl}"`)

      return NextResponse.json(response)
    }

    // JSON upload preflight endpoint (legacy fallback)
    const body = await req.json()
    const { filename, contentType, contentLength, folder = "artworks" } = body

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const extension = filename.split(".").pop() || "jpg"
    const key = `${folder}/${session.user.id}/${crypto.randomUUID()}.${extension}`

    return NextResponse.json({
      url: `/api/upload/mock?key=${key}`,
      key: key,
    })
  } catch (error: any) {
    console.error("[UPLOAD] ❌ Fatal upload error:", error)
    return NextResponse.json({ error: error.message || "Failed to process upload" }, { status: 500 })
  }
}
