import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()

  if (session?.user?.id) {
    // If they have signed up, take them to explore galleries page
    return NextResponse.redirect(new URL("/explore", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }

  // If not signed up, take them to login (sign in page)
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
