"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { signIn, auth } from "@/auth"
import { UserRole } from "@/types"
import { AuthError } from "next-auth"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  // FIX: Use nativeEnum for TypeScript enums
  role: z.nativeEnum(UserRole) 
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: "Invalid input data" }
  }
  
  const { email, password, name, role } = parsed.data
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existingUser) {
    return { error: "User already exists" }
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  try {
    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role
      }
    })
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to create user" }
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function loginUser(data: z.infer<typeof loginSchema>, callbackUrl?: string) {
  const parsed = loginSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: "Invalid input data" }
  }
  
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl || "/"
    })
    // Removed `return { success: true }` as it is unreachable code.
    // Next.js takes over via the redirect error thrown by `signIn`.
  } catch (error) {
    // FIX: Properly handle AuthErrors and re-throw the rest
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    
    // CRITICAL: This re-throws the NEXT_REDIRECT error so navigation works, 
    // and also surfaces genuine server crashes instead of hiding them.
    throw error
  }
}

export async function signInWithGoogle(callbackUrl?: string) {
  try {
    await signIn("google", {
      redirectTo: callbackUrl || "/dashboard"
    })
  } catch (error) {
    throw error
  }
}

export async function completeOnboarding(data: { role: string; name: string; bio: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: data.role,
        name: data.name,
        bio: data.bio
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error("[ONBOARDING] ❌ Error:", error.message || error)
    return { error: "Failed to update profile" }
  }
}
