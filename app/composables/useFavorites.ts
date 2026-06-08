// composables/useFavorites.ts
export const useFavorites = () => {
  // Global favori ID listesi - Nuxt bunu tüm sayfalarda ortak tutar
  const favoriteIds = useState<number[]>('favoriteIds', () => [])
  
  // App.vue içindeki 'user' state'ine güvenli erişim
  const user = useState<any>('user')

  // Favori ID'lerini getiren fonksiyon
  const fetchFavoriteIds = async () => {
    // Kullanıcı yoksa veya id'si yoksa dur
    if (!user.value?.id) {
      favoriteIds.value = []
      return
    }

    try {
      // ids.get.ts API'sine istek atıyoruz
      // query yerine params kullanmak bazen daha stabildir
      const data = await $fetch<number[]>('/api/favorites/ids', {
        params: { userId: user.value.id }
      })
      
      if (data) {
        favoriteIds.value = data
      }
    } catch (e) {
      console.error("Favori listesi çekilemedi:", e)
    }
  }

  // Kalbe basınca çalışan ana fonksiyon
  const toggleFavorite = async (productId: number) => {
    if (!user.value?.id) {
      alert("Favorilere eklemek için giriş yapmalısınız.")
      return
    }

    try {
      const res = await $fetch<{ action: string }>('/api/favorites/toggle', {
        method: 'POST',
        body: { 
          userId: user.value.id, 
          productId: Number(productId) 
        }
      })

      if (res.action === 'added') {
        if (!favoriteIds.value.includes(productId)) {
          // Reaktiviteyi tetiklemek için yeni dizi referansı oluştur
          favoriteIds.value = [...favoriteIds.value, productId]
        }
      } else {
        favoriteIds.value = favoriteIds.value.filter(id => id !== productId)
      }
    } catch (e) {
      console.error("Toggle işlemi sırasında hata:", e)
    }
  }

  return { favoriteIds, toggleFavorite, fetchFavoriteIds }
}