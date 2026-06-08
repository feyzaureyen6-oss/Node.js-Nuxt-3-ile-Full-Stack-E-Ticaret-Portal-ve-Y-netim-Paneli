import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { email: body.email }
  })

  // 2. Kontroller (Şifre şimdilik düz metin, ileride hashleyeceğiz)
  if (!user || user.password !== body.password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'E-posta veya şifre hatalı!'
    })
  }

  // 3. Başarılıysa kullanıcıyı döndür (Şifreyi silerek)
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
})