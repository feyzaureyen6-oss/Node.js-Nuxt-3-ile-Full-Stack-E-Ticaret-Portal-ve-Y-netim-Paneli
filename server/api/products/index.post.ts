import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Yeni ürünü veritabanına ekle
  const newProduct = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      category: body.category,
      image: body.image,
      stock: parseInt(body.stock),
    }
  })

  return newProduct
})