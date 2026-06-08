<script setup>
import { computed, ref } from 'vue'

const cart = useState('cart', () => [])
const user = useState('user')
const loading = ref(false)

// 1. GÜÇLENDİRİLMİŞ FORMATLAYICI (Satır bazlı hataları çözer)
const formatPrice = (value) => {
  if (value === undefined || value === null || value === '') return '0,00 ₺'
  
  let cleanValue = String(value).replace(/[₺TL\s]/g, '');
  
  if (cleanValue.includes('.')) {
    // 36.000 gibi binlik ayırıcıları temizle
    const isDecimal = /\.\d{2}$/.test(cleanValue);
    if (!isDecimal) {
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  
  cleanValue = cleanValue.replace(',', '.');
  const numericValue = parseFloat(cleanValue);

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(isNaN(numericValue) ? 0 : numericValue);
}

// 2. SATIR TOPLAMI HESAPLAYICI (Template içinde çarpım hatasını engeller)
const getItemTotal = (item) => {
  let price = String(item.price).replace(/[₺TL\s]/g, '');
  if (price.includes('.') && !/\.\d{2}$/.test(price)) {
    price = price.replace(/\./g, '');
  }
  price = price.replace(',', '.');
  const numericPrice = parseFloat(price) || 0;
  return numericPrice * (item.quantity || 1);
}

// 3. GENEL TOPLAM HESAPLAYICI
const totalPrice = computed(() => {
  if (!cart.value || cart.value.length === 0) return 0
  
  const total = cart.value.reduce((sum, item) => {
    return sum + getItemTotal(item);
  }, 0)
  
  return Math.round((total + Number.EPSILON) * 100) / 100
})

// ADET İŞLEMLERİ
const increaseQty = (item) => {
  item.quantity++
}

const decreaseQty = (item, index) => {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    removeFromCart(index)
  }
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const checkout = async () => {
  if (cart.value.length === 0) return
  if (!user.value) {
    alert("Sipariş vermek için önce giriş yapmalısınız.")
    return navigateTo('/login')
  }

  loading.value = true
  try {
    const orderPayload = {
      userId: user.value.id,
      totalAmount: totalPrice.value,
      items: cart.value.map(item => ({
        id: item.id,
        quantity: item.quantity || 1,
        price: item.price
      }))
    }

    const response = await $fetch('/api/orders', {
      method: 'POST',
      body: orderPayload
    })

    if (response) {
      alert(`Siparişiniz başarıyla alındı! Sipariş No: #${response.id}`)
      cart.value = []
      navigateTo('/')
    }
  } catch (error) {
    console.error("Sipariş hatası:", error)
    alert("Sipariş oluşturulurken bir hata oluştu.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="py-10">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-black mb-8">Alışveriş Sepetim</h1>
      </v-col>
    </v-row>

    <v-row v-if="cart && cart.length > 0" >
      <v-col cols="12" md="8">
        <v-card v-for="(item, index) in cart" :key="item.id" class="mb-4 pa-4 rounded-xl border" flat>
          <v-row align="center" no-gutters>
            <v-col cols="3" sm="2">
              <v-img :src="item.image" class="rounded-lg border" cover height="90"></v-img>
            </v-col>
            
            <v-col cols="4" sm="5" class="px-4">
              <div class="text-subtitle-1 font-weight-bold">{{ item.name }}</div>
              <div class="text-body-2 text-grey-darken-1">{{ formatPrice(item.price) }} / Adet</div>
            </v-col>

            <v-col cols="3" sm="3" class="d-flex align-center">
              <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click="decreaseQty(item, index)"></v-btn>
              <span class="mx-4 font-weight-bold">{{ item.quantity || 1 }}</span>
              <v-btn icon="mdi-plus" size="x-small" variant="tonal" @click="increaseQty(item)"></v-btn>
            </v-col>

            <v-col cols="2" class="text-right">
              <div class="text-subtitle-1 font-weight-black text-primary mb-2">
                {{ formatPrice(getItemTotal(item)) }}
              </div>
              <v-btn icon="mdi-delete-outline" variant="text" color="error" density="comfortable" @click="removeFromCart(index)"></v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6 rounded-xl border bg-grey-lighten-5" flat>
          <h2 class="text-h5 font-weight-bold mb-6">Sipariş Özeti</h2>
          
          <div class="d-flex justify-space-between mb-3 text-body-1">
            <span>Ara Toplam</span>
            <span class="font-weight-bold">{{ formatPrice(totalPrice) }}</span>
          </div>
          
          <div class="d-flex justify-space-between mb-3 text-body-1">
            <span>Kargo</span>
            <span class="text-success font-weight-bold text-uppercase">Ücretsiz</span>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-space-between text-h5 font-weight-black mb-8">
            <span>Toplam</span>
            <span class="text-primary">{{ formatPrice(totalPrice) }}</span>
          </div>

          <v-btn color="black" block size="x-large" height="64" rounded="xl" class="text-none font-weight-bold" :loading="loading" @click="checkout">
            Siparişi Tamamla
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else justify="center" class="mt-12 text-center">
      <v-col cols="12">
        <v-avatar size="150" color="grey-lighten-4" class="mb-6">
          <v-icon size="80" color="grey-lighten-1">mdi-cart-off</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold text-grey-darken-2">Sepetiniz Boş</h2>
        <v-btn color="primary" class="mt-8 px-12" size="x-large" rounded="xl" @click="navigateTo('/')">
          Alışverişe Başla
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>