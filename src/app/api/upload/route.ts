import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { processUploadedImage } from "@/lib/image-processing"
import { supabaseAdmin } from "@/lib/supabase"
import { promises as fs } from "fs"
import path from "path"

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

      const inputBuffer = Buffer.from(await file.arrayBuffer())
      const extension = file.name.split(".").pop() || "jpg"
      const baseKey = `${session.user.id}/${crypto.randomUUID()}.${extension}`

      // Process image variants using sharp
      const processed = await processUploadedImage(inputBuffer, baseKey, file.type)

      const bucketName = folder === "covers" ? "covers" : "artworks"

      // Attempt upload to Supabase Storage
      let thumbUrl = ""
      let displayUrl = ""
      let masterUrl = ""
      let isSupabaseConfigured = false

      try {
        // Check/ensure bucket exists
        const { data: bData } = await supabaseAdmin.storage.getBucket(bucketName)
        if (!bData) {
          await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 20971520,
          })
        }

        let { error: thumbErr } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(processed.thumbnail.key, processed.thumbnail.buffer, {
            contentType: processed.thumbnail.contentType,
            upsert: true,
          })

        if (thumbErr && (thumbErr.message?.includes("not found") || thumbErr.message?.includes("Bucket"))) {
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
          await supabaseAdmin.storage
            .from(bucketName)
            .upload(processed.display.key, processed.display.buffer, {
              contentType: processed.display.contentType,
              upsert: true,
            })

          await supabaseAdmin.storage
            .from(bucketName)
            .upload(processed.master.key, processed.master.buffer, {
              contentType: processed.master.contentType,
              upsert: true,
            })

          thumbUrl = supabaseAdmin.storage.from(bucketName).getPublicUrl(processed.thumbnail.key).data.publicUrl
          displayUrl = supabaseAdmin.storage.from(bucketName).getPublicUrl(processed.display.key).data.publicUrl
          masterUrl = supabaseAdmin.storage.from(bucketName).getPublicUrl(processed.master.key).data.publicUrl
        } else {
          console.warn("Supabase Storage returned upload error:", thumbErr.message)
        }
      } catch (sbErr) {
        console.warn("Supabase Storage upload failed/unconfigured, falling back to local storage:", sbErr)
      }

      // Local storage fallback if Supabase bucket isn't available yet
      if (!isSupabaseConfigured || !thumbUrl) {
        const publicUploadsDir = path.join(process.cwd(), "public", "uploads")
        await fs.mkdir(path.join(publicUploadsDir, folder, session.user.id), { recursive: true })

        await fs.writeFile(path.join(publicUploadsDir, processed.thumbnail.key), processed.thumbnail.buffer)
        await fs.writeFile(path.join(publicUploadsDir, processed.display.key), processed.display.buffer)
        await fs.writeFile(path.join(publicUploadsDir, processed.master.key), processed.master.buffer)

        thumbUrl = `/uploads/${processed.thumbnail.key}`
        displayUrl = `/uploads/${processed.display.key}`
        masterUrl = `/uploads/${processed.master.key}`
      }

      return NextResponse.json({
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
        // Legacy fields for backwards compatibility
        url: thumbUrl,
        key: processed.thumbnail.key,
      })
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
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Failed to process upload" }, { status: 500 })
  }
}
