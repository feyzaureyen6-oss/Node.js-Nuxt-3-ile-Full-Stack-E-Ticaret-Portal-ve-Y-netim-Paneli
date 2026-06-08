//"Kullanıcı sipariş verdiğinde veri POST ile kaydedilir.
//  Admin bu siparişleri görmek istediğinde ise bu GET dosyası çalışır
//  ve veritabanındaki karmaşık tabloları (User + Order + OrderItem + Product) birleştirip Admin paneline anlaşılır bir liste olarak sunar."
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Tüm siparişleri, kullanıcı adı ve içindeki ürünlerle birlikte çekiyoruz
  return await prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      },
      items: {
        include: {
          product: true // Sipariş kaleminin içindeki ürün detaylarını da getir
        }
      }
    },
    orderBy: {
      createdAt: 'desc' // En yeni siparişi en üstte göster
    }
  })
})