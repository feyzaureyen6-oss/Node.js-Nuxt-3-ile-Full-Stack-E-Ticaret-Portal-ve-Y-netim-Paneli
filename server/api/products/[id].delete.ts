import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  await prisma.product.delete({
    where: { id: Number(id) }
  })

  return { message: 'Ürün silindi' }
})