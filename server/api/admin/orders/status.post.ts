import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 1. Gelen isteğin içindeki kullanıcıyı manuel kontrol et
  // (Burada senin admin e-postanı Prisma'dan sorguluyoruz)
  const adminCheck = await prisma.user.findFirst({
    where: { 
      role: 'ADMIN' // Veritabanında ADMIN olan herhangi bir kullanıcıyı bul
    }
  })

  // 2. Eğer veritabanında hiç admin yoksa veya bir sorun varsa hata ver
  if (!adminCheck) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Yetkili kullanıcı bulunamadı!'
    })
  }

  // 3. Güncelleme işlemini yap
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: Number(body.orderId) },
      data: { status: body.newStatus }
    })
    return { success: true, data: updatedOrder }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sipariş güncellenirken veritabanı hatası oluştu.'
    })
  }
})