import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = Number(query.userId)

  // Eğer kullanıcı giriş yapmamışsa boş dizi dön
  if (!userId) return []

  try {
    // Veritabanından sadece bu kullanıcıya ait favori ürünlerin ID'lerini çekiyoruz
    const favorites = await prisma.favorite.findMany({
      where: { userId: userId },
      select: { 
        productId: true // Sadece ID'yi alarak performansı artırıyoruz
      }
    })

    // Prisma veriyi [{productId: 1}, {productId: 5}] formatında döndürür.
    // Biz bunu frontend'in kolayca kullanabileceği [1, 5] formatına çeviriyoruz.
    return favorites.map(f => f.productId)
    
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Favori ID listesi çekilemedi.'
    })
  }
})