import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. E-posta adresi zaten var mı kontrol et
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email }
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bu e-posta adresi zaten kullanımda!'
    })
  }

  // 2. Yeni kullanıcıyı oluştur (Role varsayılan olarak "USER" gelir)
  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password, // Gerçek projede hashlenmeli
      name: body.name,
      role: 'USER' 
    }
  })

  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
})