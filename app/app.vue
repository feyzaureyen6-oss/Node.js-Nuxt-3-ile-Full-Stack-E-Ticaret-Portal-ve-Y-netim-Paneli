<script setup>
import { computed, onMounted, watch } from 'vue' // HATA: computed buraya eklenmeliydi

// app.vue içindeki script setup kısmı
const user = useState('user')
const { favoriteIds, fetchFavoriteIds } = useFavorites() // Composable'ı çağırdık

// Sayfa ilk yüklendiğinde kullanıcı varsa favorileri getir
onMounted(() => {
  if (user.value?.id) {
    fetchFavoriteIds()
  }
})

// Kullanıcı login/logout olduğunda listeyi güncelle
watch(user, (newUser) => {
  if (newUser?.id) {
    fetchFavoriteIds()
  } else {
    favoriteIds.value = [] // Çıkış yapınca temizle
  }
}, { deep: true })

const handleLogout = async () => {
  // 1. Kullanıcı verisini sıfırla
  user.value = null
  
  // 2. Sepeti de temizlemek isteyebilirsin (Opsiyonel)
  // const cart = useState('cart')
  // cart.value = []

  // 3. Ana sayfaya yönlendir ve sayfayı yenileyerek state'leri tamamen temizle
  await navigateTo('/', { replace: true })
  
  // Opsiyonel: Eğer yönlendirme sonrası hala düzelmiyorsa sert yenileme yap:
  // window.location.href = '/'
  
  alert("Başarıyla çıkış yapıldı.")
}

/**
 * 1. GLOBAL STATE (MERKEZİ VERİ) TANIMLAMALARI
 */
// Arama kutusuna yazılan metni saklar.
const searchQuery = useState('searchQuery', () => '')

// Sepetteki ürün listesini saklar.
const cart = useState('cart', () => [])

/**
 * 2. HESAPLANMIŞ ÖZELLİKLER (Computed)
 */
const cartCount = computed(() => {
  // cart.value olup olmadığını kontrol etmek güvenlidir
  return cart.value ? cart.value.reduce((total, item) => total + (item.quantity || 0), 0) : 0
})

/**
 * 3. SEPETE EKLEME FONKSİYONU
 */
const addToCart = (product) => {
  const existingItem = cart.value.find(item => item.id === product.id)

  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({ ...product, quantity: 1 })
  }
}


</script>


<template>
  <v-app>
    <v-app-bar color="white" elevation="2" border>
      <v-app-bar-title 
  @click="navigateTo('/')" 
  style="cursor: pointer; letter-spacing: 2px !important;" 
  class="font-weight-black text-h5 ml-4"
> 
  ROSE<span class="text-deep-purple-accent-4"> STORE</span>
</v-app-bar-title>

<v-spacer></v-spacer>

<v-responsive 
  v-if="$route.path === '/'" 
  max-width="600" 
  class="mx-auto hidden-sm-and-down"
>
  <v-text-field
    v-model="searchQuery"
    density="compact"
    placeholder="Aradığınız ürünü yazın..."
    prepend-inner-icon="mdi-magnify"
    variant="solo"
    flat
    hide-details
    rounded="xl" 
    clearable
    bg-color="grey-lighten-4"
    class="elevation-0"
  ></v-text-field>
</v-responsive>

<v-spacer></v-spacer>
    

      <v-spacer></v-spacer>

      <div class="mr-4 d-flex align-center">
      <v-btn icon @click="navigateTo('/favorites')" class="mr-2">
          <v-badge :content="favoriteIds.length" :model-value="favoriteIds.length > 0" color="error">
            <v-icon icon="mdi-heart-outline"></v-icon>
          </v-badge>
        </v-btn>

        <v-btn icon @click="navigateTo('/cart')" class="mr-2">
          <v-badge :model-value="cartCount > 0" :content="cartCount" color="error">
            <v-icon icon="mdi-cart-outline"></v-icon>
          </v-badge>
        </v-btn>

        <v-btn 
          v-if="!user" 
          prepend-icon="mdi-login" 
          variant="tonal" 
          color="deep-purple-accent-4" 
          rounded="lg"
          @click="navigateTo('/login')"
        >
          Giriş Yap
        </v-btn>

        <v-menu v-else>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              prepend-icon="mdi-account-circle"
              variant="text"
              color="deep-purple-accent-4"
            >
              {{ user.name || 'Profilim' }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-if="user.role === 'ADMIN'" @click="navigateTo('/admin')">
              <template v-slot:prepend><v-icon icon="mdi-view-dashboard"></v-icon></template>
              <v-list-item-title>Admin Paneli</v-list-item-title>
            </v-list-item>

            <v-list-item @click="navigateTo('/orders')" prepend-icon="mdi-package-variant-closed" color="primary">
              <v-list-item-title>Siparişlerim</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>
            
            <v-list-item @click="handleLogout">
              <template v-slot:prepend><v-icon icon="mdi-logout"></v-icon></template>
              <v-list-item-title>Çıkış Yap</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <NuxtPage />
    </v-main>
  </v-app>
</template>