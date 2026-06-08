<template>
  <v-container v-if="user?.role === 'ADMIN'" class="py-8">
    <h1 class="text-h4 font-weight-black mb-6 text-grey-darken-4">Yönetim Paneli</h1>

    <v-tabs v-model="activeTab" color="deep-purple-accent-4" class="mb-6">
      <v-tab value="products" prepend-icon="mdi-package-variant-closed">Ürün Yönetimi</v-tab>
      <v-tab value="orders" prepend-icon="mdi-cart-check">Gelen Siparişler</v-tab>
      <v-tab value="questions" prepend-icon="mdi-comment-question">Müşteri Soruları</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="products">
        <v-row>
          <v-col cols="12" md="4">
            <v-card border elevation="4" class="pa-4" rounded="lg">
              <v-card-title class="text-h5 font-weight-bold mb-4">
                {{ isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle' }}
              </v-card-title>
              <v-form @submit.prevent="handleSubmit">
                <v-text-field v-model="newProduct.name" label="Ürün Adı" variant="outlined" density="compact"></v-text-field>
                <v-textarea v-model="newProduct.description" label="Açıklama" variant="outlined" density="compact" rows="2"></v-textarea>
                <v-text-field v-model="newProduct.price" label="Fiyat (TL)" type="number" variant="outlined" density="compact"></v-text-field>
                <v-text-field v-model="newProduct.category" label="Kategori" variant="outlined" density="compact"></v-text-field>
                <v-file-input
                label="Ürün Resimleri (Maks 5)"
                variant="outlined"
                density="compact"
                prepend-icon="mdi-camera"
                multiple
                accept="image/*"
                @change="handleFiles"
                :disabled="uploadedImages.length >= MAX_IMAGES"
                hint="72 DPI Web Optimizasyonu Otomatik Uygulanır"
                persistent-hint
                class="mb-4"></v-file-input>

         <v-row v-if="uploadedImages.length > 0" class="mb-4 px-2" no-gutters>
         <v-col v-for="(img, idx) in uploadedImages" :key="idx" cols="4" class="pa-1 position-relative">
           <v-avatar size="70" rounded="lg" class="border bg-white">
           <v-img :src="img" cover></v-img>
          </v-avatar>
    <v-btn
      icon="mdi-close"
      size="x-small"
      color="red"
      variant="elevated"
      elevation="2"
      style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; z-index: 10;"
      @click="uploadedImages.splice(idx, 1)"
    ></v-btn>
  </v-col>
</v-row>

<v-text-field 
  v-model="newProduct.image" 
  label="Resim URL (Dosya seçerseniz otomatik dolar)" 
  variant="outlined" 
  density="compact"
></v-text-field>
                <v-text-field v-model="newProduct.stock" label="Stok Adedi" type="number" variant="outlined" density="compact"></v-text-field>
                <v-btn :color="isEditing ? 'orange-darken-1' : 'success'" block size="large" type="submit" :prepend-icon="isEditing ? 'mdi-pencil' : 'mdi-plus-circle'" :loading="loading">
                  {{ isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet' }}
                </v-btn>
                <v-btn v-if="isEditing" block variant="text" color="grey" class="mt-2" @click="resetForm">Vazgeç / Yeni Ekle</v-btn>
              </v-form>
            </v-card>
          </v-col>
          <v-col cols="12" md="8">
            <v-card border elevation="4" rounded="lg">
              <v-table>
                <thead>
                  <tr>
                    <th>Resim</th>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in products" :key="p.id">
                    <td><v-img :src="p.image || 'https://via.placeholder.com/40'" width="40" height="40" cover rounded></v-img></td>
                    <td>{{ p.name }}</td>
                    <td><v-chip size="small">{{ p.category }}</v-chip></td>
                    <td>₺{{ p.price }}</td>
                    <td>
                      <v-btn icon="mdi-pencil" color="blue" variant="text" size="small" @click="editProduct(p)"></v-btn>
                      <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="deleteProduct(p.id)"></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="orders">
        <v-card border elevation="4" rounded="lg">
          <v-table>
            <thead>
              <tr class="bg-grey-lighten-4">
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Ürünler</th>
                <th>Toplam Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in allOrders" :key="order.id">
                <td class="font-weight-bold">#{{ order.id }}</td>
                <td>
                  <div class="font-weight-medium">{{ order.user?.name }}</div>
                  <div class="text-caption text-grey">{{ order.user?.email }}</div>
                </td>
                <td>
                  <div v-for="item in order.items" :key="item.id" class="text-body-2">
                    • {{ item.product?.name }} <span class="text-grey">(x{{ item.quantity }})</span>
                  </div>
                </td>
                <td class="font-weight-black text-deep-purple-accent-4">₺{{ order.totalAmount }}</td>
                <td>
                  <v-select
                  v-model="order.status"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  label="Sipariş Durumu"
                  variant="underlined"
                  density="compact"
                  hide-details
                  @update:model-value="changeStatus(order.id, $event)"
                  :color="getStatusColor(order.status)"
                  ></v-select>
                </td>
                <td class="text-caption text-grey">
                  {{ new Date(order.createdAt).toLocaleDateString('tr-TR') }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-window-item>

      <v-window-item value="questions">
        <v-container>
          <v-row v-if="questions && questions.length > 0">
            <v-col v-for="q in questions" :key="q.id" cols="12">
              <v-card variant="outlined" class="rounded-xl overflow-hidden mb-4 shadow-sm">
                <div class="bg-grey-lighten-4 pa-4 d-flex align-center justify-space-between border-b">
                  <div class="d-flex align-center">
                    <v-avatar size="48" rounded="lg" class="mr-3 border bg-white">
                      <v-img :src="q.product?.image || 'https://via.placeholder.com/100'"></v-img>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">{{ q.product?.name }}</div>
                      <div class="text-caption text-grey">{{ q.user?.name }} sordu</div>
                    </div>
                  </div>
                  <v-chip :color="q.answer ? 'green' : 'orange'" size="small" variant="flat" class="font-weight-bold">
                    {{ q.answer ? 'Cevaplandı' : 'Cevap Bekliyor' }}
                  </v-chip>
                </div>

                <div class="pa-4">
                  <p class="text-body-1 mb-4 italic text-grey-darken-3">"{{ q.text }}"</p>
                  <v-divider class="mb-4"></v-divider>
                  
                  <v-textarea
                    v-model="q.tempAnswer"
                    :label="q.answer ? 'Cevabı Düzenle' : 'Yanıt Yazın'"
                    variant="solo-filled"
                    flat rows="2"
                    hide-details class="mb-3 rounded-lg"
                    bg-color="grey-lighten-5"
                  ></v-textarea>

                  <div class="d-flex justify-end gap-2">
                    <v-btn 
                      v-if="q.answer"
                      color="error" 
                      variant="text" 
                      class="text-none mr-2"
                      @click="deleteAnswer(q.id)"
                    >
                      Cevabı Sil
                    </v-btn>

                    <v-btn 
                      color="black" 
                      rounded="lg" 
                      :loading="loadingId === q.id" 
                      @click="submitAnswer(q)"
                      class="px-6 text-none"
                    >
                      {{ q.answer ? 'Cevabı Güncelle' : 'Yanıtı Gönder' }}
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
          <div v-else class="text-center py-16">
            <v-icon size="64" color="grey-lighten-3">mdi-message-off</v-icon>
            <p class="text-grey mt-2">Henüz soru bulunmuyor.</p>
          </div>
        </v-container>
      </v-window-item>
    </v-window>
  </v-container>

  <v-container v-else class="text-center mt-10">
    <v-alert type="error" icon="mdi-lock">Bu sayfaya erişim yetkiniz yok.</v-alert>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'

const user = useState('user')
const loading = ref(false)
const loadingId = ref(null) 
const isEditing = ref(false)
const currentProductId = ref(null)
const activeTab = ref('products')
const uploadedImages = ref([]) 
const MAX_IMAGES = 5
// FORM VERİLERİ
const newProduct = ref({
  name: '', description: '', price: 0, category: '', image: '', stock: 10
})

// VERİ ÇEKME
const { data: products, refresh: refreshProducts } = await useFetch('/api/products')
const { data: allOrders, refresh: refreshOrders } = await useFetch('/api/orders')
const { data: questions, refresh: refreshQuestions } = await useFetch('/api/admin/questions')

// TEXTAREA İÇİN MEVCUT CEVAPLARI İZLE
watch(questions, (newVal) => {
  if (newVal) {
    newVal.forEach(q => {
      if (q.answer && !q.tempAnswer) q.tempAnswer = q.answer
    })
  }
}, { immediate: true })

// CEVAP GÖNDERME / GÜNCELLEME
const submitAnswer = async (question) => {
  if (!question.tempAnswer) return alert("Lütfen bir cevap yazın.")
  loadingId.value = question.id
  try {
    await $fetch('/api/admin/questions/answer', {
      method: 'POST',
      body: { questionId: question.id, answer: question.tempAnswer }
    })
    await refreshQuestions()
    alert("Cevap başarıyla kaydedildi! ✅")
  } catch (err) {
    alert("Hata oluştu.")
  } finally {
    loadingId.value = null
  }
}

// CEVAP SİLME FONKSİYONU
const deleteAnswer = async (questionId) => {
  if (!confirm("Bu cevabı silmek istediğinize emin misiniz?")) return
  
  try {
    await $fetch('/api/admin/questions/answer', {
      method: 'DELETE',
      body: { questionId }
    })
    
    // Soruyu bul ve textarea'sını temizle
    const q = questions.value.find(item => item.id === questionId)
    if (q) q.tempAnswer = ''

    await refreshQuestions()
    alert("Cevap silindi. Soru bekleme durumuna geri döndü. 🗑️")
  } catch (err) {
    alert("Cevap silinirken hata oluştu.")
  }
}

// SİPARİŞ DURUMU GÜNCELLEME
const changeStatus = async (orderId, newStatus) => {
  try {
    await $fetch('/api/admin/orders/status', {
      method: 'POST',
      body: { orderId, newStatus }
    })
    await refreshOrders() 
    alert("Sipariş durumu güncellendi! ✅")
  } catch (err) {
    alert("Hata: " + (err.data?.statusMessage || "İşlem başarısız"))
  }
}

// SİPARİŞ SEÇENEKLERİ
const statusOptions = [
  { title: 'Hazırlanıyor', value: 'PENDING', color: 'orange' },
  { title: 'Kargoya Verildi', value: 'SHIPPED', color: 'blue' },
  { title: 'Teslim Edildi', value: 'DELIVERED', color: 'success' },
  { title: 'İptal Edildi', value: 'CANCELLED', color: 'error' }
]

const getStatusColor = (status) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.color : 'grey'
}

// ÜRÜN İŞLEMLERİ
const resetForm = () => {
  isEditing.value = false
  currentProductId.value = null
  uploadedImages.value = [] // EKLE
  newProduct.value = { name: '', description: '', price: 0, category: '', image: '', stock: 10 }
}

const editProduct = (product) => {
  isEditing.value = true
  currentProductId.value = product.id
  newProduct.value = { ...product }
  // EKLE: Eğer ürünün resmi varsa önizleme listesine al
  if (product.image) uploadedImages.value = [product.image]
}


// 72 DPI ve Boyut Optimizasyon İşlemcisi
const processTo72DPI = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1200 // Web için ideal genişlik
        const scale = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        // Canvas çizimi DPI meta verilerini temizler ve standart web (72-96) DPI yapar
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // 0.7 Kalite Oranı: 72 DPI görsel kalitesi ve düşük dosya boyutu sağlar
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
    }
  })
}

const handleFiles = async (event) => {
  const files = Array.from(event.target.files)
  
  if (uploadedImages.value.length + files.length > MAX_IMAGES) {
    alert(`En fazla ${MAX_IMAGES} resim ekleyebilirsiniz!`)
    return
  }

  for (const file of files) {
    const optimized = await processTo72DPI(file)
    uploadedImages.value.push(optimized)
  }
  
  // Backend tek resim beklediği için ilk resmi ana kutuya atıyoruz
  if (uploadedImages.value.length > 0) {
    newProduct.value.image = uploadedImages.value[0]
  }
}



const handleSubmit = async () => {
  loading.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/api/products/${currentProductId.value}` : '/api/products'
    await $fetch(url, { method: method, body: newProduct.value })
    alert(isEditing.value ? "Ürün güncellendi!" : "Ürün eklendi!")
    refreshProducts()
    resetForm()
  } catch (e) {
    alert("Hata oluştu!")
  } finally {
    loading.value = false
  }
}

const deleteProduct = async (id) => {
  if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
    try {
      await $fetch(`/api/products/${id}`, { method: 'DELETE' })
      refreshProducts()
      alert("Ürün silindi.")
    } catch (e) {
      alert("Silme başarısız!")
    }
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.shadow-sm {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}
</style>