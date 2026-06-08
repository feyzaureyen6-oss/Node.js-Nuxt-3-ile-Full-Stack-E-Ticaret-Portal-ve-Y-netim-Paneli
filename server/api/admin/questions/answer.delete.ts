import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Güvenlik kontrolü (Siparişlerdeki gibi manuel kontrol)
  const isAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Yetki Hatası' })
  }

  try {
    return await prisma.question.update({
      where: { id: Number(body.questionId) },
      data: { answer: null } // Cevabı siliyoruz
    })
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Cevap silinemedi.' })
  }
})