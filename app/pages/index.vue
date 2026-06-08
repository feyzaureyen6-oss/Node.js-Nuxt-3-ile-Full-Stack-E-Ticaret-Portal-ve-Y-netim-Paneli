<script setup>
import { ref, computed, watchEffect } from 'vue' // watchEffect ve computed buraya eklendi

// Arama çubuğuna yazılan metni dinler.
const searchQuery = useState('searchQuery', () => '')

// Sepet listesine ulaşır.
const cart = useState('cart', () => [])
const { favoriteIds, toggleFavorite } = useFavorites()
// KATEGORİ SEÇİMİ
const selectedCategory = ref('Hepsi')

// 1. VERİLERİ ÇEKME
const { data: fetchedProducts } = await useFetch('/api/products', {
  lazy: true,
  server: false
})

const products = ref([])
watchEffect(() => {
  if (fetchedProducts.value) {
    products.value = fetchedProducts.value
  }
})

// 2. DİNAMİK KATEGORİ LİSTESİ OLUŞTURMA
const categories = computed(() => {
  if (!products.value || products.value.length === 0) return ['Hepsi']
  
  const rawCategories = products.value.map(p => p.category).filter(Boolean)
  const uniqueCategories = [...new Set(rawCategories)]
  
  return ['Hepsi', ...uniqueCategories]
})

// 3. GELİŞMİŞ FİLTRELEME MANTIĞI
const filteredProducts = computed(() => {
  let list = products.value || []

  // Kategoriye göre süz
  if (selectedCategory.value !== 'Hepsi') {
    list = list.filter(p => p.category === selectedCategory.value)
  }

  // Arama kelimesine göre süz
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(product => {
      return product.name.toLowerCase().includes(query) || 
             product.description.toLowerCase().includes(query)
    })
  }

  return list
})

// 4. CAROUSEL
const banners = [
  { src: '/images/banner1.jpg', title: 'Yeni Sezon Ürünleri' },
  { src: '/images/banner2.jpg', title: 'Elektronikte %50 İndirim' },
  { src: '/images/banner3.jpg', title: 'Gotix Özel Koleksiyon' }
]

const loading = ref(false)
const selection = ref(1)

// 5. SEPETE EKLEME
const addToCart = (product) => {
  if (product.stock > 0) {
    const existingItem = cart.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++ 
    } else {
      cart.value.push({ ...product, quantity: 1 })
    }
    product.stock-- 
  } else {
    alert("Maalesef bu ürün tükendi!")
  }
}
</script>
<template>
  <div>
    <v-carousel hide-delimiters cycle height="450" show-arrows="hover" interval="6000">
      <v-carousel-item v-for="(banner, i) in banners" :key="i" :src="banner.src" cover></v-carousel-item>
    </v-carousel>
    
    <v-container>
      <v-row justify="center" class="my-8">
        <v-btn-toggle
          v-model="selectedCategory"
          mandatory
          color="deep-purple-accent-4"
          variant="outlined"
          rounded="xl"
        >
          <v-btn v-for="cat in categories" :key="cat" :value="cat" class="px-6">
            {{ cat }}
          </v-btn>
        </v-btn-toggle>
      </v-row>
      
      <v-row>
        <v-col v-for="product in filteredProducts" :key="product.id" cols="12" sm="6" md="4">
          
          <v-card 
            class="rounded-xl border position-relative mx-auto my-6 cursor-pointer" 
            elevation="6" 
            max-width="374"
            @click="navigateTo(`/products/${product.id}`)"
          >
            <v-btn icon position="absolute" style="top: 12px; right: 12px; z-index: 10; backdrop-filter: blur(4px); background: rgba(255, 255, 255, 0.8) !important;"
            size="small" variant="flat" class="elevation-3 transition-swing" @click.stop.prevent="toggleFavorite(product.id)">
           <v-icon size="22" :color="favoriteIds.includes(product.id) ? 'red-accent-3' : 'grey-darken-1'">
             {{ favoriteIds.includes(product.id) ? 'mdi-heart' : 'mdi-heart-outline' }}
           </v-icon>
           </v-btn>

            <v-img 
              height="200" 
              :src="product.image || 'https://cdn.vuetifyjs.com/images/cards/cooking.png'" 
              cover
            ></v-img>

            <v-card-item>
              <v-card-title class="text-h5 font-weight-bold">{{ product.name }}</v-card-title>
              <v-card-subtitle>
                <v-chip size="x-small" color="success" variant="flat">{{ product.category || 'Genel' }}</v-chip>
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <v-row class="align-center mx-0">
                <v-rating :model-value="product.avgRating || 0" color="amber" density="compact" size="small" half-increments readonly></v-rating>
                <div class="text-grey ms-4">{{ product.avgRating ? product.avgRating.toFixed(1) : '0' }} ({{ product.reviewCount || 0 }})</div>
              </v-row>
  
              <div class="my-4 text-body-large">₺ • {{ product.price }} TL</div>
              <div class="text-truncate text-grey-darken-1">{{ product.description }}</div>
            </v-card-text>

            <v-divider class="mx-4 mb-1"></v-divider>

            <v-card-title class="text-subtitle-2">Stok Durumu</v-card-title>
            <div class="px-4 mb-2">
              <v-chip-group>
                <v-chip size="small" variant="outlined" :color="product.stock > 0 ? 'success' : 'error'">
                  Kalan: {{ product.stock }}
                </v-chip>
                <v-chip size="small" variant="outlined" color="blue">Hızlı Teslimat</v-chip>
              </v-chip-group>
            </div>

            <v-card-actions>
              <v-btn 
                color="deep-purple-accent-4" 
                variant="elevated" 
                block 
                rounded="lg"
                @click.stop="addToCart(product)"
              >
                Sepete Ekle
              </v-btn>
            </v-card-actions>
          </v-card>

        </v-col>

        <v-col v-if="filteredProducts.length === 0" cols="12" class="text-center mt-10">
          <v-icon size="64" color="grey">mdi-magnify-close</v-icon>
          <p class="text-h6 text-grey mt-4">Aradığınız kriterlere uygun ürün bulunamadı.</p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>