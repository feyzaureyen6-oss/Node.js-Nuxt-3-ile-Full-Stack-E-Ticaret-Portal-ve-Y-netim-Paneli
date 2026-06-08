// server/api/orders/user.get.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = Number(query.userId)

  if (!userId) return [] // ID yoksa boş liste dön ki hata vermesin

  return await prisma.order.findMany({
    where: { userId: userId },
    include: {
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
})