<template>
  <v-container v-if="product" class="py-10">
    <v-row class="mb-12">
      <v-col cols="12" md="6">
        <v-card elevation="0" class="rounded-xl border">
          <v-img :src="product.image" aspect-ratio="1" cover></v-img>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="pl-md-10">
        <h1 class="text-h3 font-weight-black mb-4">{{ product.name }}</h1>
        <div class="text-h4 text-primary mb-8 font-weight-bold">₺ {{ product.price }}</div>
        <p class="text-body-1 text-grey-darken-1 mb-10">{{ product.description }}</p>
        
        <div class="d-flex align-center mt-8" style="gap: 12px;">
  <v-btn 
    color="deep-purple-accent-4" 
    size="x-large" 
    height="56"
    class="flex-grow-1 rounded-xl font-weight-bold text-none" 
    elevation="4"
    prepend-icon="mdi-cart-arrow-down"
    @click="addToCart(product)"
  >
    Sepete Ekle
  </v-btn>

  <v-btn 
    variant="outlined" 
    :color="favoriteIds.includes(product.id) ? 'red' : 'grey-lighten-1'" 
    height="56"
    width="56"
    class="rounded-xl border-sm"
    @click="toggleFavorite(product.id)"
  >
    <v-icon size="28">
      {{ favoriteIds.includes(product.id) ? 'mdi-heart' : 'mdi-heart-outline' }}
    </v-icon>
  </v-btn>
</div>
         
      </v-col>
    </v-row>

    <v-card variant="flat" class="rounded-xl border overflow-hidden">
      <v-tabs v-model="activeTab" bg-color="grey-lighten-4" color="primary" grow>
        <v-tab value="questions" class="text-none">
          <v-icon start>mdi-help-circle-outline</v-icon> Soru & Cevap ({{ product.questions?.length || 0 }})
        </v-tab>
        <v-tab value="reviews" class="text-none">
          <v-icon start>mdi-star-outline</v-icon> Değerlendirmeler ({{ product.reviews?.length || 0 }})
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="pa-6">
        <v-window-item value="questions">
          <div class="d-flex align-center mb-6">
            <h3 class="text-h5 font-weight-bold">Ürün Hakkında Sorular</h3>
            <v-spacer></v-spacer>
            <v-btn v-if="user" color="primary" prepend-icon="mdi-plus" rounded="lg" @click="questionDialog = true">
              Soru Sor
            </v-btn>
          </div>

          <v-row v-if="product.questions?.length > 0">
            <v-col v-for="q in product.questions" :key="q.id" cols="12">
              <v-card variant="outlined" class="pa-5 rounded-lg border-opacity-25">
                <div class="d-flex align-center mb-3">
                  <v-avatar color="grey-lighten-3" size="32" class="mr-3">
                    <v-icon size="20">mdi-account</v-icon>
                  </v-avatar>
                  <span class="font-weight-bold text-subtitle-1">{{ q.user?.name }}</span>
                  <v-spacer></v-spacer>
                  <span class="text-caption text-grey">{{ new Date(q.createdAt).toLocaleDateString('tr-TR') }}</span>
                </div>
                <p class="text-body-1 mb-4 ml-11">{{ q.text }}</p>

                <div v-if="q.answer" class="ml-11 pa-4 bg-blue-grey-lighten-5 rounded-lg border-s-lg border-primary">
                  <div class="text-subtitle-2 font-weight-bold text-primary mb-1">Mağaza Cevabı:</div>
                  <p class="text-body-2">{{ q.answer }}</p>
                </div>
                <div v-else class="ml-11 text-caption text-italic text-grey">Bu soru henüz cevaplanmamış.</div>
              </v-card>
            </v-col>
          </v-row>
          <v-alert v-else variant="tonal" color="info" class="mt-4">
            Henüz soru sorulmamış. İlk soruyu siz sorun!
          </v-alert>
        </v-window-item>

        <v-window-item value="reviews">
          <div v-if="product.canReview && user" class="mb-10 pa-6 bg-grey-lighten-5 rounded-xl border">
            <h3 class="text-h6 font-weight-bold mb-2">Ürünü Değerlendirin</h3>
            <v-rating v-model="newReview.rating" color="amber" density="compact" size="x-large" class="mb-4"></v-rating>
            <v-textarea
              v-model="newReview.comment"
              label="Ürün hakkındaki görüşleriniz..."
              variant="outlined"
              rows="3"
              rounded="lg"
              class="mb-4 bg-white"
            ></v-textarea>
            <v-btn color="primary" rounded="lg" :loading="reviewLoading" @click="submitReview">Gönder</v-btn>
          </div>

          <v-alert v-else-if="user && !product.canReview" type="info" variant="tonal" class="mb-6">
            Yorum yapabilmek için ürünü satın almış olmanız gerekir.
          </v-alert>

          <div v-if="product.reviews?.length > 0">
            <v-card v-for="r in product.reviews" :key="r.id" variant="outlined" class="mb-4 pa-4 rounded-lg border-opacity-25">
              <div class="d-flex align-center mb-2">
                <v-rating :model-value="r.rating" readonly color="amber" density="compact" size="small"></v-rating>
                <span class="ml-3 font-weight-bold">{{ r.user?.name }}</span>
                <v-spacer></v-spacer>
                <span class="text-caption text-grey">{{ new Date(r.createdAt).toLocaleDateString('tr-TR') }}</span>
              </div>
              <p class="text-body-2 text-grey-darken-3">{{ r.comment }}</p>
            </v-card>
          </div>
          <div v-else class="text-center py-10 text-grey">Henüz değerlendirme yapılmamış.</div>
        </v-window-item>
      </v-window>
    </v-card>

    <v-dialog v-model="questionDialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold">Yeni Soru Sor</v-card-title>
        <v-card-text>
          <v-textarea v-model="questionText" label="Sorunuzu buraya yazın..." variant="outlined" rows="4" counter="200"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="questionDialog = false">Vazgeç</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" @click="submitQuestion" :loading="questionLoading">Gönder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
// 1. Eksik olan ref ve diğer Vue araçlarını import ediyoruz
import { ref } from 'vue'

const activeTab = ref('questions')
const questionDialog = ref(false)
const questionText = ref('')
const questionLoading = ref(false)
const newReview = ref({ rating: 5, comment: '' })
const reviewLoading = ref(false)

const route = useRoute()
const user = useState('user')
const cart = useState('cart', () => [])

// 2. Favori Composable'ını bağlıyoruz
const { favoriteIds, toggleFavorite } = useFavorites()

// VERİ ÇEKME
const { data: product, refresh } = await useFetch(`/api/products/${route.params.id}`, {
  query: { userId: user.value?.id }
})

// SORU GÖNDERME
const submitQuestion = async () => {
  if (!user.value) return alert("Soru sormak için giriş yapmalısınız.")
  if (!questionText.value || questionText.value.length < 5) return alert("Lütfen daha uzun bir soru yazın.")
  
  questionLoading.value = true
  try {
    await $fetch('/api/questions', {
      method: 'POST',
      body: { text: questionText.value, productId: product.value.id, userId: user.value.id }
    })
    alert("Sorunuz iletildi!")
    questionText.value = ""
    questionDialog.value = false
    await refresh()
  } catch (err) { 
    alert("Hata oluştu.") 
  } finally { 
    questionLoading.value = false 
  }
}

// YORUM GÖNDERME
const submitReview = async () => {
  if (!newReview.value.comment) return alert("Lütfen yorum yazın.")
  reviewLoading.value = true
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: { ...newReview.value, productId: product.value.id, userId: user.value.id }
    })
    alert("Yorumunuz eklendi!")
    newReview.value = { rating: 5, comment: '' }
    await refresh()
  } catch (err) { 
    alert("Hata oluştu.") 
  } finally { 
    reviewLoading.value = false 
  }
}

const addToCart = (p) => {
  const existing = cart.value.find(i => i.id === p.id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({ ...p, quantity: 1 })
  }
}
</script>