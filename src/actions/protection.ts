"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"
import imghash from "imghash"

export async function activateArtworkProtection(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const file = formData.get("signatureFile") as File
  if (!file) {
    return { success: false, error: "No signature file provided" }
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user?.signatureLocked) {
      return { success: false, error: "Signature is already locked. Contact support to change." }
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate pHash
    const hash = await imghash.hash(buffer, 8, 'hex') // 8x8 = 64 bit hash

    // Upload signature to Supabase (we'll store it in a 'signatures' bucket)
    const extension = file.name.split('.').pop() || 'png'
    const key = `${session.user.id}/master_signature_${Date.now()}.${extension}`

    // Ensure bucket exists (best effort)
    try { await supabaseAdmin.storage.createBucket('signatures', { public: false }) } catch (e) {}

    const { error: uploadError } = await supabaseAdmin.storage
      .from('signatures')
      .upload(key, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error("[PROTECTION ACTION] Signature upload error:", uploadError)
      return { success: false, error: "Failed to upload signature image" }
    }

    // Save to DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        protectionActivated: true,
        signatureLocked: true,
        signatureUrl: key,
        signatureHash: hash
      }
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (err: any) {
    console.error("[PROTECTION ACTION] Error:", err)
    return { success: false, error: err.message || "Failed to activate protection" }
  }
}
