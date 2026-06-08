//Ürünü favoriye eklemek veya çıkarmak kullanılırı.


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, productId } = body

  // Veritabanında bu ürün zaten favori mi?
  const existing = await prisma.favorite.findFirst({
    where: { 
      userId: Number(userId), 
      productId: Number(productId) 
    }
  })

  if (existing) {
    // Varsa sil (Favoriden çıkar)
    await prisma.favorite.delete({ where: { id: existing.id } })
    return { action: 'removed' }
  } else {
    // Yoksa ekle (Favoriye al)
    await prisma.favorite.create({
      data: { 
        userId: Number(userId), 
        productId: Number(productId) 
      }
    })
    return { action: 'added' }
  }
})