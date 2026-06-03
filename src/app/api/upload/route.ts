import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getPresignedUploadUrl } from "@/lib/s3"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { filename, contentType, folder = "uploads" } = body

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const extension = filename.split('.').pop()
    const key = `${folder}/${session.user.id}/${crypto.randomUUID()}.${extension}`

    const url = await getPresignedUploadUrl(key, contentType)

    return NextResponse.json({ url, key })
  } catch (error) {
    console.error("Presigned URL error:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
