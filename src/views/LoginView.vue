<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Invalid credentials')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
    style="background-image: url('/p-1.png')"
  >
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-lg overflow-hidden shadow-xl">

        <!-- Dark header -->
        <div class="bg-auth-header p-6 text-center">
          <img src="/logo-sm.png" alt="Anthive DMS" class="h-12 mx-auto mb-3" />
          <h4 class="text-white font-semibold text-lg mb-1">Anthive DMS</h4>
          <p class="text-white/60 text-[13px]">Sign in to continue</p>
        </div>

        <!-- Form body -->
        <div class="p-6">
          <form @submit.prevent="submit" class="space-y-4">

            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="you@example.com"
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text placeholder:text-m-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>

            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">Password</label>
              <input
                v-model="password"
                type="password"
                required
                placeholder="Enter password"
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text placeholder:text-m-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full mt-2 py-2.5 bg-brand hover:bg-brand-light text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Signing in…' : 'Log In' }}
            </button>

          </form>
        </div>

      </div>
    </div>
  </div>
</template>
