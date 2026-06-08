// server/api/products/[id].get.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  
  // 1. Kullanıcıyı Tespit Et
  // Öncelik event.context.user'da (Eğer middleware kullanıyorsan)
  // Yoksa query'den gelen userId'yi kullanıyoruz (Frontend'den gönderirsen)
  const userId = event.context.user?.id || (query.userId ? Number(query.userId) : null)

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        // Yorumları ve kullanıcı isimlerini getir
        reviews: {
          include: { 
            user: { select: { name: true } } 
          },
          orderBy: { createdAt: 'desc' }
        },
        // Soruları ve kullanıcı isimlerini getir
        questions: {
          include: { 
            user: { select: { name: true } } 
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Ürün bulunamadı.' })
    }

    // 2. SATIN ALMA KONTROLÜ (canReview)
    let canReview = false
    
    // Eğer kullanıcı ID'sine ulaşabiliyorsak kontrolü yap
    if (userId) {
      const order = await prisma.order.findFirst({
        where: {
          userId: userId,
          status: 'DELIVERED', // Admin panelinden 'DELIVERED' olarak güncellenmiş olmalı
          items: {
            some: {
              productId: Number(id)
            }
          }
        }
      })
      
      // Eğer böyle bir sipariş varsa true yap
      if (order) {
        canReview = true
      }
    }

    // 3. Veriyi birleştirip gönder
    return {
      ...product,
      canReview // Frontend artık bu bilgiye sahip
    }

  } catch (error: any) {
    console.error("Ürün Detay API Hatası:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Sunucu hatası oluştu.',
    })
  }
})