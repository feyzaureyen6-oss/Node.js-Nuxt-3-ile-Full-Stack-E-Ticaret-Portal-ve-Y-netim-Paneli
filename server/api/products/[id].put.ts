import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      category: body.category,
      image: body.image,
      stock: parseInt(body.stock),
    }
  })

  return updatedProduct
})