import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  migrations: {
    schemaPath: './prisma/schema.prisma',
    databaseUrl: process.env.DATABASE_URL,
  },
})
