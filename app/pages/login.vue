<template>
  <v-container class="fill-height login-bg" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        
        <v-card class="white-card pa-10" elevation="10" rounded="xl">
          
          <div class="text-center mb-10">
            <v-avatar color="grey-lighten-4" size="80" class="mb-5 elevation-1 border">
              <span class="text-h3 font-weight-black text-grey-darken-3">R</span>
            </v-avatar>
            <h1 class="text-h4 font-weight-black text-grey-darken-4 letter-spacing-tight">
              {{ isLoginMode ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun' }}
            </h1>
            <p class="text-body-2 text-grey-darken-1 mt-3">
              {{ isLoginMode ? 'Devam etmek için bilgilerinizi girin' : 'Hızlıca kayıt olup alışverişe başlayın' }}
            </p>
          </div>

          <v-form @submit.prevent="handleSubmit">
            <v-fade-transition group hide-on-leave>
              <v-text-field
                v-if="!isLoginMode"
                key="name"
                v-model="name"
                label="Ad Soyad"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                rounded="lg"
                color="grey-darken-3"
                class="mb-3 border-input"
                required
              ></v-text-field>

              <v-text-field
                key="email"
                v-model="email"
                label="E-posta Adresi"
                type="email"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                rounded="lg"
                color="grey-darken-3"
                class="mb-3 border-input"
                required
              ></v-text-field>

              <v-text-field
                key="password"
                v-model="password"
                label="Şifre"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click:append-inner="showPassword = !showPassword"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                rounded="lg"
                color="grey-darken-3"
                class="border-input"
                required
              ></v-text-field>
            </v-fade-transition>

            <v-btn
              color="grey-darken-4"
              size="x-large"
              block
              rounded="lg"
              type="submit"
              :loading="loading"
              class="mt-8 font-weight-bold elevation-1 action-btn text-none"
            >
              {{ isLoginMode ? 'Giriş Yap' : 'Kayıt Ol' }}
            </v-btn>
          </v-form>

          <div class="text-center mt-10">
            <span class="text-body-2 text-grey-darken-1">
              {{ isLoginMode ? 'Henüz hesabınız yok mu?' : 'Zaten üye misiniz?' }}
            </span>
            <v-btn
              variant="text"
              color="grey-darken-4"
              class="text-none font-weight-black ml-1 px-1"
              @click="toggleMode"
            >
              {{ isLoginMode ? 'Kayıt Ol' : 'Giriş Yap' }}
            </v-btn>
          </div>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const isLoginMode = ref(true)
const loading = ref(false)
const showPassword = ref(false)
const user = useState('user')

// Form Alanları
const email = ref('')
const password = ref('')
const name = ref('')

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  // Mod değişince alanları temizle
  email.value = ''
  password.value = ''
  name.value = ''
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const endpoint = isLoginMode.value ? '/api/auth/login' : '/api/auth/register'
    const payload = isLoginMode.value 
      ? { email: email.value, password: password.value }
      : { email: email.value, password: password.value, name: name.value }

    const data = await $fetch(endpoint, {
      method: 'POST',
      body: payload
    })

    if (data) {
      user.value = data
      if (data.role === 'ADMIN') navigateTo('/admin')
      else navigateTo('/')
    }
  } catch (error) {
    alert("Hata: " + (error.statusMessage || "İşlem başarısız"))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Arka Plan Tasarımı: Çok Hafif Gri */
.login-bg {
  background-color: #fcfcfc;
  position: relative;
}

/* Minimalist Beyaz Kart */
.white-card {
  background: #ffffff !important;
  border: 1px solid #eeeeee;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05) !important;
}

/* Giriş Alanları: Solo tarzı, ince kenarlıklı */
.border-input {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.border-input:focus-within {
  border-color: #424242;
  box-shadow: 0 0 0 3px rgba(66, 66, 66, 0.05);
}

/* Siyah Buton Efekti */
.action-btn {
  transition: all 0.2s ease;
  letter-spacing: -0.5px;
}

.action-btn:hover {
  background-color: #000000 !important;
  transform: translateY(-1px);
}

/* Tipografi Detayları */
.letter-spacing-tight {
  letter-spacing: -1.5px !important;
}
</style>