import { PrismaClient } from '@prisma/client'

// Global bir değişken tanımlayarak bağlantı limitini aşmayalım
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. GÜVENLİK: Basit ve hızlı admin kontrolü
  const isAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Yetki Hatası: Admin girişi saptanamadı.'
    })
  }

  // 2. VERİ KONTROLÜ
  const { questionId, answer } = body
  if (!questionId || !answer) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Soru ID veya Cevap metni eksik.'
    })
  }

  // 3. GÜNCELLEME İŞLEMİ
  try {
    const updated = await prisma.question.update({
      where: { id: Number(questionId) },
      data: { answer: String(answer) }
    })
    
    return { success: true, data: updated }
  } catch (error) {
    console.error("Cevap Kaydetme Hatası:", error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Veritabanına kaydedilirken bir hata oluştu.'
    })
  }
})