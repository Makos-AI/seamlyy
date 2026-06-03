import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

const HARDCODED_USERS = [
  { id: "artist-1", email: "artist1@example.com", password: "password123", name: "Amara Nnachi", role: "ARTIST" },
  { id: "collector-1", email: "collector@example.com", password: "password123", name: "Sarah Jenkins", role: "VIEWER" }
]

export const handlers = {
  GET: () => new Response("Mock Auth Active", { status: 200 }),
  POST: () => new Response("Mock Auth Active", { status: 200 })
}

export function auth(...args: any[]) {
  // If it's a middleware wrapper (auth(callback))
  if (args.length === 1 && typeof args[0] === "function") {
    const callback = args[0]
    return async (req: NextRequest) => {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get("seamlyy_session")?.value
      let session = null
      if (sessionCookie) {
        try {
          session = { user: JSON.parse(decodeURIComponent(sessionCookie)) }
        } catch {}
      }

      // Attach session to request
      const mockReq = req as any
      mockReq.auth = session

      return callback(mockReq)
    }
  }

  // If it's a session getter (await auth())
  return getSession()
}

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("seamlyy_session")?.value
  if (!sessionCookie) return null

  try {
    const user = JSON.parse(decodeURIComponent(sessionCookie))
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image || null
      }
    }
  } catch {
    return null
  }
}

export async function signIn(provider: string, options: any) {
  if (provider !== "credentials") {
    throw new Error("Only credentials provider is supported in mock auth")
  }

  const { email, password, redirectTo } = options
  const user = HARDCODED_USERS.find(u => u.email === email && u.password === password)
  
  if (!user) {
    throw new Error("CredentialsSignin")
  }

  const cookieStore = await cookies()
  cookieStore.set("seamlyy_session", JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }), { path: "/" })

  if (redirectTo) {
    redirect(redirectTo)
  }
  return { success: true }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("seamlyy_session")
  redirect("/")
}
