export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text, productId, userId } = body

  try {
    const newQuestion = await prisma.question.create({
      data: {
        text: text,
        productId: Number(productId),
        userId: Number(userId)
      }
    })

    return { success: true, data: newQuestion }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Soru iletilemedi.'
    })
  }
})