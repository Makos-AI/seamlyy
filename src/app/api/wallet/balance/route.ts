import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        sales: {
          where: { status: "COMPLETED" }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate real settled balances from DB
    const totalSales = user.sales
      .filter(s => s.type !== "PAY_TO_VIEW")
      .reduce((acc, sale) => acc + Number(sale.amount), 0)

    const revenueFromViews = user.sales
      .filter(s => s.type === "PAY_TO_VIEW")
      .reduce((acc, sale) => acc + Number(sale.amount), 0)

    const baseBalance = totalSales + revenueFromViews

    return NextResponse.json({
      success: true,
      walletPointer: user.walletPointer || null,
      preferredCurrency: user.preferredCurrency || "USD",
      totalSales,
      revenueFromViews,
      balance: baseBalance
    })
  } catch (error: any) {
    console.error("Wallet balance API error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch balance" }, { status: 500 })
  }
}
