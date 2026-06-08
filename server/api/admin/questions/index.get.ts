//Admin panelinde tüm soruları listeler

export default defineEventHandler(async (event) => {
  // Daha önce konuştuğumuz yetki kontrolünü buraya da ekleyebilirsin
  return await prisma.question.findMany({
    include: {
      product: { select: { name: true, image: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
})