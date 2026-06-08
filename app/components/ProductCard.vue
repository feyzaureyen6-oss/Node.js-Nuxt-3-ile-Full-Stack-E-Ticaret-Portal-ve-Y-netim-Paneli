<template>
  <v-card 
    class="rounded-xl border position-relative mx-auto my-4 cursor-pointer pb-2" 
    elevation="6" 
    max-width="374"
    @click="navigateTo(`/products/${product.id}`)"
  >
    <v-btn
      icon
      position="absolute"
      style="top: 12px; right: 12px; z-index: 10; backdrop-filter: blur(4px); background: rgba(255, 255, 255, 0.8) !important;"
      size="small"
      variant="flat"
      class="elevation-3"
      @click.stop.prevent="toggleFavorite(product.id)"
    >
      <v-icon
        size="22"
        :color="favoriteIds.includes(product.id) ? 'red-accent-3' : 'grey-darken-1'"
      >
        {{ favoriteIds.includes(product.id) ? 'mdi-heart' : 'mdi-heart-outline' }}
      </v-icon>
    </v-btn>

    <v-img 
      height="200" 
      :src="product.image || 'https://cdn.vuetifyjs.com/images/cards/cooking.png'" 
      cover
    ></v-img>

    <v-card-item class="pb-0">
      <v-card-title class="text-subtitle-1 font-weight-bold">{{ product.name }}</v-card-title>
      <v-card-subtitle>
        <v-chip size="x-small" color="success" variant="flat" class="mt-1">
          {{ product.category || 'Genel' }}
        </v-chip>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="pt-2">
      <div class="text-h6 font-weight-black text-primary">
        {{ formatPrice(product.price) }}
      </div>
      
      <div class="text-caption text-truncate text-grey-darken-1">
        {{ product.description }}
      </div>
    </v-card-text>

    <v-divider class="mx-4 mb-2"></v-divider>

    <v-card-actions>
      <v-btn 
        color="deep-purple-accent-4" 
        variant="tonal" 
        block 
        rounded="lg"
        prepend-icon="mdi-cart-plus"
        @click.stop="addToCart(product)"
      >
        Sepete Ekle
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
const props = defineProps(['product'])
const { favoriteIds, toggleFavorite } = useFavorites()
const cart = useState('cart', () => [])

// GÜNCELLENEN AKILLI FORMATLAYICI
const formatPrice = (value) => {
  if (value === undefined || value === null || value === '') return '0,00 ₺'
  
  // 1. Gelen veriyi metne çevir ve temizle
  let cleanValue = String(value).replace(/[₺TL\s]/g, '');
  
  // 2. Binlik ayırıcı (nokta) kontrolü: 36.000 -> 36000
  if (cleanValue.includes('.')) {
    // Eğer noktadan sonra tam 2 basamak yoksa (örn: .000), o nokta binliktir, sil.
    const isDecimal = /\.\d{2}$/.test(cleanValue);
    if (!isDecimal) {
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  
  // 3. Virgülü noktaya çevir: 35,99 -> 35.99
  cleanValue = cleanValue.replace(',', '.');

  const numericValue = parseFloat(cleanValue);

  // 4. Profesyonel Formatlama
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(isNaN(numericValue) ? 0 : numericValue);
}

const addToCart = (p) => {
  const existing = cart.value.find(item => item.id === p.id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({ ...p, quantity: 1 })
  }
}
</script>