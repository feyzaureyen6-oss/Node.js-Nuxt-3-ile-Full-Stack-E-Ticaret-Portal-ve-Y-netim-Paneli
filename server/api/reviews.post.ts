export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { rating, comment, productId, userId } = body

  // Log ekleyelim: Terminalden kontrol et, değerler doğru geliyor mu?
  console.log(`Kontrol ediliyor: User: ${userId}, Product: ${productId}`)

  try {
    // 1. GÜVENLİK KONTROLÜ (Geliştirilmiş Sorgu)
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: Number(userId),
        status: 'DELIVERED', // Admin panelinden bu değerin gittiğine emin ol
        items: {
          some: {
            productId: Number(productId)
          }
        }
      }
    })

    // Debug: Eğer null geliyorsa terminalde görelim
    if (!hasPurchased) {
      console.log("Satın alma kaydı bulunamadı veya status 'DELIVERED' değil.")
      throw createError({
        statusCode: 403,
        statusMessage: 'Yalnızca ürünü teslim alanlar yorum yapabilir.'
      })
    }

    // 2. KAYIT: Yorumu ekle
    return await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: String(comment),
        productId: Number(productId),
        userId: Number(userId)
      }
    })

  } catch (error: any) {
    console.error("Yorum Hatası:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'İşlem başarısız.'
    })
  }
})