import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
  }
}

export const Categories = [
  'Digital Art', 
  'Oil Paintings', 
  'Photography', 
  'Sculptures', 
  'Watercolor', 
  'Mixed Media'
] as const;

export type Category = typeof Categories[number];
