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

    let url = ""
    const hasRealS3 = process.env.AWS_ACCESS_KEY_ID && 
                      process.env.AWS_ACCESS_KEY_ID !== "your_access_key_id" &&
                      process.env.AWS_SECRET_ACCESS_KEY &&
                      process.env.AWS_SECRET_ACCESS_KEY !== "your_secret_access_key"

    if (hasRealS3) {
      try {
        url = await getPresignedUploadUrl(key, contentType)
      } catch (err) {
        console.warn("Failed to get S3 presigned URL, falling back to mock upload URL")
        url = `/api/upload/mock?key=${key}`
      }
    } else {
      url = `/api/upload/mock?key=${key}`
    }

    return NextResponse.json({ url, key })
  } catch (error) {
    console.error("Presigned URL error:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
