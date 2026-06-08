<script setup>
const user = useState('user')
const { favoriteIds } = useFavorites()

// Backend'den gelen veriyi "favoriteProducts" olarak alıyoruz
const { data: favoriteProducts, refresh, pending } = await useFetch('/api/favorites/list', {
  params: { userId: user.value?.id }, // 'query' yerine 'params' daha güvenlidir
  watch: [favoriteIds] 
})

// Manuel Refresh: Sayfa her odaklandığında veya ID'ler değiştiğinde zorla yenile
onMounted(() => {
  refresh()
})

const cart = useState('cart', () => [])
const addAllToCart = () => {
  if (!favoriteProducts.value) return
  favoriteProducts.value.forEach(p => {
    const existing = cart.value.find(item => item.id === p.id)
    if (existing) existing.quantity++
    else cart.value.push({ ...p, quantity: 1 })
  })
  alert("Tüm ürünler sepete eklendi!")
}
</script>

<template>
  <v-container class="py-10">
    <div v-if="pending" class="text-center py-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-4">Favorileriniz yükleniyor...</p>
    </div>

    <div v-else>
      <div v-if="favoriteProducts && favoriteProducts.length >0">
        <div class="d-flex align-center justify-space-between mb-8">
          <h1 class="text-h4 font-weight-black">Favorilerim ({{ favoriteProducts.length }})</h1>
          <v-btn color="primary" rounded="xl" @click="addAllToCart">Hepsini Sepete Ekle</v-btn>
        </div>

        <v-row>
          <v-col v-for="product in favoriteProducts" :key="product.id" cols="12" sm="6" md="3">
            <ProductCard :product="product" />
          </v-col>
        </v-row>
      </div>

      <v-sheet v-else class="text-center py-16">
        <v-icon size="80" color="grey">mdi-heart-outline</v-icon>
        <h3 class="text-h5 mt-4">Henüz favoriniz yok</h3>
        <v-btn to="/" class="mt-6" color="black" rounded="xl">Alışverişe Başla</v-btn>
      </v-sheet>
    </div>
  </v-container>
</template>