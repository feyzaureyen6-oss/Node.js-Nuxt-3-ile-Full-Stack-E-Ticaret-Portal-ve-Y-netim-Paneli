<template>
  <v-container class="py-10 bg-white" min-height="100vh">
    <v-row class="mb-8" align="center">
      <v-col cols="auto">
        <v-btn icon="mdi-arrow-left" variant="tonal" rounded="lg" @click="navigateTo('/')"></v-btn>
      </v-col>
      <v-col>
        <h1 class="text-h4 font-weight-black text-grey-darken-4">Siparişlerim</h1>
        <p class="text-grey-darken-1">Geçmişten günümüze tüm alışverişleriniz.</p>
      </v-col>
    </v-row>

    <div v-if="pending" class="d-flex flex-column align-center py-16">
      <v-progress-circular indeterminate color="black" size="64"></v-progress-circular>
      <div class="mt-4 text-grey">Siparişleriniz yükleniyor...</div>
    </div>

    <div v-else-if="orders && orders.length > 0">
      <v-card 
        v-for="order in orders" 
        :key="order.id" 
        variant="outlined" 
        class="mb-8 rounded-xl border-grey-lighten-3 overflow-hidden shadow-sm"
        elevation="0"
      >
        <v-row class="bg-grey-lighten-4 pa-4 ma-0 align-center border-b">
          <v-col cols="6" sm="3">
            <div class="text-caption text-uppercase text-grey-darken-1 font-weight-bold">Sipariş No</div>
            <div class="font-weight-black text-body-1">#{{ order.id }}</div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-caption text-uppercase text-grey-darken-1 font-weight-bold">Tarih</div>
            <div class="text-body-1">{{ formatDate(order.createdAt) }}</div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-caption text-uppercase text-grey-darken-1 font-weight-bold">Toplam Tutar</div>
            <div class="text-deep-purple-accent-4 font-weight-black text-h6">₺{{ order.totalAmount }}</div>
          </v-col>
          <v-col cols="6" sm="3" class="text-right">
            <v-chip 
              :color="getStatusDetails(order.status).color" 
              variant="flat" 
              rounded="lg" 
              class="font-weight-bold text-white px-4"
            >
              <v-icon start size="small">{{ getStatusDetails(order.status).icon }}</v-icon>
              {{ getStatusDetails(order.status).text }}
            </v-chip>
          </v-col>
        </v-row>

        <v-list class="pa-0">
          <v-list-item 
            v-for="item in order.items" 
            :key="item.id" 
            class="py-6 px-6 border-b-light"
          >
            <template v-slot:prepend>
              <v-avatar size="100" rounded="lg" class="border bg-white mr-6">
                <v-img :src="item.product?.image || 'https://via.placeholder.com/100'" cover></v-img>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6 font-weight-bold mb-1">
              {{ item.product?.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-1">
              <span class="font-weight-medium text-black">{{ item.quantity }} Adet</span> 
              <span class="mx-2 text-grey-lighten-1">|</span>
              <span class="text-grey-darken-1">Birim Fiyat: ₺{{ item.price }}</span>
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn 
                variant="tonal" 
                rounded="lg" 
                size="small" 
                color="primary" 
                class="text-none font-weight-bold"
                :to="`/products/${item.productId}`"
              >
                Ürünü İncele
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <v-row v-else justify="center" align="center" class="py-16 mt-10">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="120" color="grey-lighten-3">mdi-shopping-outline</v-icon>
        <h2 class="text-h4 font-weight-bold text-grey-darken-2 mt-6">Henüz bir siparişiniz yok.</h2>
        <p class="text-grey-darken-1 mb-8 mt-2">Harika ürünlerimizi keşfetmek için hala geç değil!</p>
        <v-btn to="/" color="black" size="x-large" rounded="xl" class="px-10 text-none">Alışverişe Başla</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const user = useState('user')

// SİPARİŞLERİ ÇEKME
const { data: orders, pending, refresh } = await useFetch('/api/orders/user', {
  params: { userId: computed(() => user.value?.id) },
  watch: [user] 
})

/**
 * DURUM YÖNETİMİ (Türkçeleştirme ve Renklendirme)
 * Admin panelindeki değerlerle birebir uyumlu.
 */
const getStatusDetails = (status) => {
  const statusMap = {
    'PENDING': { text: 'Hazırlanıyor', color: 'orange-darken-2', icon: 'mdi-clock-outline' },
    'SHIPPED': { text: 'Kargoya Verildi', color: 'blue-darken-1', icon: 'mdi-truck-delivery' },
    'DELIVERED': { text: 'Teslim Edildi', color: 'green-darken-1', icon: 'mdi-check-circle' },
    'CANCELLED': { text: 'İptal Edildi', color: 'red-darken-1', icon: 'mdi-close-circle' }
  }
  
  // Eğer veritabanından gelen değer listede yoksa varsayılan döndür
  return statusMap[status] || { text: status, color: 'grey-darken-1', icon: 'mdi-help-circle' }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0 !important;
}
.border-b-light {
  border-bottom: 1px solid #f5f5f5 !important;
}
.border-b-light:last-child {
  border-bottom: none !important;
}
.shadow-sm {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.shadow-sm:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
}
</style>