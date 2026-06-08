#  Node.js & Nuxt 3 ile Geliştirdiğim Full-Stack E-Ticaret Portalı ve Yönetim Paneli

Bu projede; sunucu tarafında **Node.js (Nitro Engine)**, istemci tarafında **Nuxt 3 (Vue 3 Composition API)** ve veritabanı katmanında **Prisma ORM & PostgreSQL** mimarisini kullanarak performans, veri tutarlılığı, kullanıcı deneyimi (UX) ve uçtan uca API güvenliği odaklı modern bir e-ticaret portalı ve yönetim paneli geliştirdim.

Uygulamanın hem frontend hem de backend katmanlarını tamamen **JavaScript / TypeScript** ekosisteminde inşa ettim. Geliştirme sürecinde monolitik mimarinin getirdiği ağ hızı avantajlarından yararlandım, tarayıcı tabanlı görsel optimizasyonları uyguladım ve JavaScript'in veri dönüşüm zaaflarına karşı tamamen kendime ait algoritmik çözümler ürettim.

---

Geliştirdiğim Özellikler ve Modüller

# Kullanıcı ve Alışveriş Deneyimi
- **Dinamik Sepet Yönetimi:** Vue state mimarisi (`useState`) üzerinden yönettiğim; asenkron ürün ekleme, fiyat/adet artırma-azaltma ve anlık sepet senkronizasyonu.
- **Toplu Sepet Senkronizasyonu:** Kullanıcıların beğendikleri ürünleri kaybetmemesi için gelişmiş bir Favori (Wishlist) sistemi kurdum ve tek tıkla tüm favori ürünleri sepete doldurma özelliği ekledim.
- **Şeffaf Soru-Cevap & Yorum Alanı:** Ziyaretçilerin ürünler hakkında bilgi alabilmesi için herkese açık soru sorma ve yorum okuma paneli tasarladım.
- **Responsive Arayüz:** Vuetify 3 bileşen kütüphanesini (`v-card`, `v-carousel`, `v-table`) kullanarak tamamen mobil uyumlu, modern kart ve liste tasarımları oluşturdum.

# Gelişmiş Admin Yönetim Paneli (Rol Bazlı)
- **Ürün Yönetimi (CRUD):** Yeni ürün ekleme, stok adedi belirleme, ürün silme ve mevcut ürünleri anlık olarak form üzerinden düzenleme alanlarını kodladım.
- **Gelen Sipariş Yönetimi:** Siparişlerin durumunu (`PENDING - Hazırlanıyor`, `SHIPPED - Kargoya Verildi`, `DELIVERED - Teslim Edildi`, `CANCELLED - İptal Edildi`) dinamik olarak değiştirebilen ve renk kodlarıyla takip edilen bir yapı kurdum.
- **Müşteri Soruları Modülü:** Ürünlerin altına gelen müşteri sorularını yanıtlama, verilen yanıtları düzenleme veya silerek soruyu tekrar "bekliyor" durumuna geri döndürme mekanizmalarını entegre ettim.

---

Uyguladığım Mühendislik Çözümleri ve Optimizasyonlar

1️⃣ JavaScript Ondalık Sayı ve Formatlama Hatalarının Çözümü (`utils/format.ts`)
**Karşılaştığım Sorun:** JavaScript, yapısı gereği kayan noktalı sayılarda (`0.1 + 0.2 = 0.30000000000000004`) hassasiyet hataları üretiyor. Ayrıca veritabanından veya inputlardan `"36.000"` (String) olarak gelen binlik değerli fiyatlar, doğrudan sayıya çevrildiğinde JavaScript tarafından `36` olarak algılanıyordu ve bu durum sepet hesaplamalarında kritik finansal hatalara yol açıyordu.

**Ürettiğim Çözüm:** - Fiyat verisi işlenmeden önce devreye giren özel bir **Regex kontrolü** (`/\.\d{2}$/`) yazdım. Eğer noktadan sonra tam olarak 2 basamak yoksa, o noktanın kuruş değil binlik ayırıcı olduğunu tespit edip temizlenmesini sağladım (`36.50` kuruş olarak korunurken, `36.000` değerini `36000` saf sayısına dönüştürdüm).
- Arayüzdeki tüm para birimi gösterimlerini tarayıcının yerel **`Intl.NumberFormat`** API'sini kullanarak `tr-TR` ve `TRY` standartlarına göre, kuruş hanelerini de garanti altına alarak biçimlendirdim.

```typescript
export const formatPrice = (value: any): string => {
  if (value === undefined || value === null || value === '') return '0,00 ₺'
  
  let cleanValue = String(value).replace(/[₺TL\s]/g, '');
  
  if (cleanValue.includes('.') && cleanValue.includes(',')) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } 
  else if (cleanValue.includes(',')) {
    cleanValue = cleanValue.replace(',', '.');
  } 
  else if (cleanValue.includes('.')) {
    const isDecimal = /\.\d{2}$/.test(cleanValue);
    if (!isDecimal) {
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }

  const numericValue = parseFloat(cleanValue);

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(isNaN(numericValue) ? 0 : numericValue);
}
```
2️⃣ Web Standartlarında (72 DPI) Resim Optimizasyonu (HTML5 Canvas API)
Karşılaştığım Sorun: Admin panelinden yüklenen yüksek çözünürlüklü fotoğraflar (genellikle 300 DPI ve 5-10 MB boyutlarında) doğrudan sunucuya gönderildiğinde networkü tüketiyor ve sayfa açılış hızını ciddi oranda düşürüyordu.

Ürettiğim Çözüm:

Görselleri sunucuya (backend) göndermeden önce istemci tarafında (Client-side) optimize edecek bir yapı kurdum.

HTML5 Canvas API kullanarak resimleri maksimum 1200px genişliğe sınırladım dan canvas.toDataURL('image/jpeg', 0.7) komutuyla yeniden çizdirdim.

Bu işlem sayesinde, resimdeki tüm ağır kamera meta verilerini (EXIF/DPI) temizleyerek görüntüyü otomatik olarak web standardı olan 72/96 DPI seviyesine çektim ve %90'ın üzerinde dosya boyutu tasarrufu sağladım (~150 KB seviyesine indirdim).

Arayüzde resimlerin kesilmesini önlemek amacıyla contain ölçeklendirme stratejisi kurguladım ve tek seferde en fazla 5 adet resim yüklenebilmesi için limit kontrol mekanizması ekledim.

3️⃣ Güvenli Ürün Değerlendirme & Şeffaf Soru-Cevap İlişkisel Doğrulaması
Karşılaştığım Sorun: E-ticaret platformlarında bot hesaplar veya rakip firmalar tarafından yapılan sahte puanlamaları ve manipülatif yorumları engellemek istedim.

Ürettiğim Çözüm:

Kullanıcı etkileşimlerini ikiye ayırdım: Ürün hakkında soru sorma işlemini herkese açık bırakırken, ürüne puan (yıldız) verme ve değerlendirme yazma yetkisini yalnızca ürünü satın alanlara kısıtladım.

Prisma ORM Doğrulaması: Backend (server/api/products/review.post.ts) üzerinde istek geldiğinde çalışacak ilişkisel bir veritabanı kontrolü yazdım. Kullanıcının ilgili ürün için durumu DELIVERED (Teslim Edildi) olan bir siparişi yoksa işlemi 403 Forbidden ile reddediyorum.

```TypeScript
// Geliştirdiğim Backend Sipariş Kontrol Algoritması
const hasPurchased = await prisma.order.findFirst({
  where: {
    userId: user.id,
    status: 'DELIVERED', // Sipariş teslim edilmiş olmalı
    items: { some: { productId: body.productId } } // Bu ürün siparişte olmalı
  }
})
```
4️⃣ Node.js ve Nitro Engine ile Monolitik Full-Stack API Mimarisi
Karşılaştığım Sorun: Geleneksel mimarilerde frontend ve backend projelerinin ayrı sunucularda barındırılması; CORS hatalarına, çift deployment maliyetlerine ve API isteklerinde ağ gecikmelerine yol açmaktadır.

Ürettiğim Çözüm:

Projeyi, Node.js tabanlı Nuxt 3'ün yerleşik sunucu motoru olan Nitro Engine kullanarak full-stack (monolitik) yapıda kurguladım.

/server/api dizini altında yazdığım tüm backend servislerini, Node.js ortamında asenkron (async/await) mimariyle non-blocking (bloke edilemez) şekilde çalışacak şekilde kodladım. Veritabanı sorguları sırasında Node.js Event Loop mekanizmasının kilitlenmesini önledim.

İlişkisel Veri ve Select Optimizasyonu (Prisma): Admin panelinde müşteri sorularını listelerken, veritabanından gereksiz yük çekilmesini engellemek amacıyla nokta atışı select ve ilişkisel include sorguları hazırladım.

Yazdığım Sunucu Tarafı (Node.js/Prisma) Örnek API Kod Bloğu:
(server/api/admin/questions.get.ts)

```TypeScript
// Admin panelinde tüm müşteri sorularını ilişkisel verileriyle listeler
export default defineEventHandler(async (event) => {
  // Node.js Event Loop'u bloke etmeyen asenkron veritabanı sorgusu
  return await prisma.question.findMany({
    include: {
      // SQL JOIN optimizasyonu: Sadece ihtiyaç duyduğum sütunları seçiyorum
      product: { select: { name: true, image: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' } // Kronolojik olarak en yeni sorular üstte listelenir
  })
})
```
5️⃣ Toplu Veri Manipülasyonu ve Sepet Senkronizasyonu (Favorilerden Sepete Aktarım)
Karşılaştığım Sorun: Kullanıcıların favori listelerine ekledikleri çok sayıda ürünü satın almak istediklerinde, her ürünü tek tek sepetlerine eklemek zorunda kalmaları kullanıcı deneyimini olumsuz etkiliyor ve sepeti terk etme oranlarını artırıyordu.

Ürettiğim Çözüm:

Favoriler sayfasında, state üzerindeki tüm ürünleri tek seferde sepet mimarisine güvenli bir şekilde aktaran asenkron bir toplu işlem fonksiyonu yazdım.

Ürün Kontrolü (Deduplication): Fonksiyon çalışırken, favorilerdeki bir ürünün zaten sepette olup olmadığını kontrol eden bir mantık kurdum. Eğer ürün sepette zaten varsa adedini artırıyor (quantity++), sepette yoksa yeni bir satır olarak (quantity: 1) ekliyorum. Böylece sepet verisinin bozulmasını engelledim.

```TypeScript
// Yazdığım toplu işlem senkronizasyon algoritması
const addAllFavoritesToCart = () => {
  if (favorites.value.length === 0) return

  favorites.value.forEach((favProduct) => {
    const existingItem = cart.value.find(item => item.id === favProduct.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.value.push({
        ...favProduct,
        quantity: 1
      })
    }
  })
  alert('Favorilerinizdeki tüm ürünler başarıyla sepete eklendi!');
}
```
Kullandığım Teknolojiler ve Ekosistem
Projeyi, modern web standartlarına uygun olarak hem istemci (client) hem de sunucu (server) tarafında tek bir dil ekosistemi (JavaScript / TypeScript) kullanarak inşa ettim.

Çalışma Ortamı (Runtime): Node.js (Uygulamanın derlenmesi, paket yönetimi ve sunucu tarafındaki tüm operasyonlar Node.js üzerinde çalışmaktadır).

Programlama Dili: JavaScript (ES6+) / TypeScript (Tip güvenliği ve sürdürülebilir kod mimarisi için aktif olarak kullandım).

Framework: Nuxt 3 (Vue 3 Composition API & Nitro Server Engine)

Arayüz Tasarımı (UI): Vuetify 3 & Material Design Icons (MDI)

Veritabanı Katmanı: PostgreSQL & Prisma ORM

🚀 Kurulum ve Çalıştırma
1. Depoyu Klonlayın
Bash
git clone [https://github.com/kullanici_adin/repo_adin.git](https://github.com/kullanici_adin/repo_adin.git)
cd repo_adin
2. Bağımlılıkları Yükleyin
Bash
npm install

3. Çevre Değişkenlerini Ayarlayın
Kök dizinde bir .env dosyası oluşturun (örneğini .env.example içinde verdiğim şekilde ayarlayabilirsiniz) ve PostgreSQL bağlantı linkinizi ekleyin:

Kod snippet'i
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/db_adi?schema=public"
4. Prisma İstemcisini Oluşturun
Bash
npx prisma generate
5. Projeyi Geliştirici Modunda Başlatın
Bash
npm run dev
Uygulama yerel olarak http://localhost:3000 adresinde çalışmaya başlayacaktır.

🔒 Güvenlik Notu
Projenin veritabanı kimlik bilgileri, API gizli anahtarları ve canlı üretim şifreleri .gitignore kuralları doğrultusunda yerel ortamımda korunmaktadır ve GitHub deposunda kesinlikle yer almamaktadır.
