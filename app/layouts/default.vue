<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <nav class="bg-white border-b">
      <div class="container mx-auto px-4 py-3">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img src="~/assets/logo.png" alt="King County Metro" class="h-12" />
          <span class="text-lg font-semibold">{{ bannerTitle }}</span>
        </NuxtLink>
      </div>
    </nav>
    <main class="flex-1 container mx-auto px-4 py-6">
      <slot />
    </main>
    <footer class="text-center py-4 text-sm text-gray-600">
      King County Metro copyright {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>

<script setup lang="ts">
const bannerTitle = useState('bannerTitle', () => 'Customer Community')
</script>
