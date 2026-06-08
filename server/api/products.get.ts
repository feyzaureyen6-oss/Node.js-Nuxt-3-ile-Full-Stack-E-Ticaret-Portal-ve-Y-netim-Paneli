//Anasayfa içindir.ürün puanlarını ve yorum sayısını gösterir.Yorumların hepsi gözükmez.
export default defineEventHandler(async (event) => {
  try {
    // 1. Ürünleri çekerken yanına yorumların sadece 'rating' (puan) bilgisini alıyoruz
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    // 2. Her ürün için matematiksel hesaplama yapıyoruz
    const productsWithRatings = products.map(product => {
      const reviewCount = product.reviews.length
      
      // Tüm puanları toplayıp toplam yorum sayısına bölerek ortalamayı buluyoruz
      const totalRating = product.reviews.reduce((acc, curr) => acc + curr.rating, 0)
      const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0

      // Client tarafına (frontend) gereksiz tüm yorum listesini göndermek yerine 
      // sadece ihtiyacımız olan sayıları gönderiyoruz
      return {
        ...product,
        avgRating: parseFloat(avgRating.toFixed(1)), // Örn: 4.5
        reviewCount: reviewCount,
        reviews: undefined // Ham yorum listesini temizleyerek veri trafiğini azaltıyoruz
      }
    })

    return productsWithRatings

  } catch (error) {
    console.error('API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Veritabanına ulaşılamadı.',
    })
  }
})