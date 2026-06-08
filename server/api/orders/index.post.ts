// server/api/orders/index.post.ts
//Kullanıcının sepetindeki ürünleri siparişe dönüştüren dosyadır.
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const newOrder = await prisma.order.create({
      data: {
        // userId bir sayı olmalı
        userId: Number(body.userId),
        totalAmount: parseFloat(body.totalAmount),
        status: "PENDING",
        // Şemandaki 'items' ilişkisini kullanıyoruz
        items: {
          create: body.items.map((item: any) => ({
            productId: Number(item.id),
            quantity: Number(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      }
    })
    return newOrder
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sipariş oluşturulamadı: ' + error.message
    })
  }
})