import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const key = searchParams.get('key')
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 })

    const buffer = Buffer.from(await req.arrayBuffer())

    // Enforce 20MB limit
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 20MB limit." }, { status: 400 })
    }
    
    // Save to public/uploads
    const dest = path.join(process.cwd(), "public", "uploads", key)
    
    // Ensure parent directory exists
    await fs.mkdir(path.dirname(dest), { recursive: true })
    
    // Write buffer to file
    await fs.writeFile(dest, buffer)

    return NextResponse.json({ success: true, url: `/uploads/${key}` })
  } catch (error: any) {
    console.error("Mock upload error:", error)
    return NextResponse.json({ error: error.message || "Failed to write local file" }, { status: 500 })
  }
}
