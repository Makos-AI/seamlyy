"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { signIn } from "@/auth"
import { UserRole } from "@/types"
import { AuthError } from "next-auth"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum([UserRole.ARTIST, UserRole.VIEWER])
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

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: "Invalid input data" }
  }
  
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard"
    })
    return { success: true }
  } catch (error: any) {
    if (error && (error.message === "NEXT_REDIRECT" || error.digest?.startsWith("NEXT_REDIRECT"))) {
      throw error
    }
    return { error: "Invalid email or password" }
  }
}
