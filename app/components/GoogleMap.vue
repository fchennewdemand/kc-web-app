<template>
  <GoogleMap :api-key="apiKey" :center="center" :zoom="zoom" class="w-full h-full">
    <Marker v-for="(marker, i) in markers" :key="i" :options="{ position: marker }" />
  </GoogleMap>
</template>

<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map'

withDefaults(defineProps<{
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{ lat: number; lng: number; title?: string }>
}>(), {
  center: () => ({ lat: 0, lng: 0 }),
  zoom: 10
})

const apiKey = useAppConfig().mapKey
</script>
