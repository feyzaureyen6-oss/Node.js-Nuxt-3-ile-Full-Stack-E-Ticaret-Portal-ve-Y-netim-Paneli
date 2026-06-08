import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = Number(query.userId)

  // DEBUG: Terminale bak, userId doğru geliyor mu?
  console.log("Gelen UserId:", userId)

  if (!userId || isNaN(userId)) {
    console.error("Hata: Geçersiz veya eksik UserId")
    return []
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { 
        userId: userId 
      },
      include: {
        // NOT: Prisma modelinizde bu ilişki adı farklıysa (örn: Product) burayı düzeltin
        product: true 
      },
      orderBy: {
        id: 'desc' // createdAt yoksa id'ye göre sıralayabilirsin
      }
    })

    // DEBUG: Kaç tane favori bulundu?
    console.log(`${userId} kullanıcısı için bulunan favori sayısı:`, favorites.length)

    // Eğer veri gelmiyorsa, map fonksiyonu boş dizi döner.
    // Gelen yapıyı temizleyip sadece ürün bilgilerini gönderiyoruz.
    return favorites.map(f => f.product).filter(p => p !== null)

  } catch (error) {
    console.error("Favori listesi çekilirken Prisma hatası:", error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Veritabanı hatası oluştu.'
    })
  }
})