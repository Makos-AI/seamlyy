import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// DTO interface for standard sales
interface SalesDTO {
  totalAmount: number;
  transactionCount: number;
  recentSales: { id: string, amount: number, createdAt: Date }[];
}

// DTO interface for web monetization (revenue from views)
interface MonetizationDTO {
  totalRevenue: number;
  viewCount: number;
  recentSpikes: { id: string, amount: number, createdAt: Date }[];
}

// Aggregation response payload
interface MetricsResponseDTO {
  sales: SalesDTO;
  monetization: MonetizationDTO;
}

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Separate the transactions
    const standardSales = user.sales.filter(s => s.type !== 'PAY_TO_VIEW')
    const webMonetization = user.sales.filter(s => s.type === 'PAY_TO_VIEW')

    const salesDTO: SalesDTO = {
      totalAmount: standardSales.reduce((sum, s) => sum + Number(s.amount), 0),
      transactionCount: standardSales.length,
      recentSales: standardSales.slice(0, 5).map(s => ({
        id: s.id,
        amount: Number(s.amount),
        createdAt: s.createdAt
      }))
    }

    const monetizationDTO: MonetizationDTO = {
      totalRevenue: webMonetization.reduce((sum, s) => sum + Number(s.amount), 0),
      viewCount: webMonetization.length,
      recentSpikes: webMonetization.slice(0, 10).map(s => ({
        id: s.id,
        amount: Number(s.amount),
        createdAt: s.createdAt
      }))
    }

    const responsePayload: MetricsResponseDTO = {
      sales: salesDTO,
      monetization: monetizationDTO
    }

    return NextResponse.json(responsePayload)
    
  } catch (error) {
    console.error("Failed to fetch metrics:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
