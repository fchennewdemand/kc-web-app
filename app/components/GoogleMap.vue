<template>
  <div ref="mapRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{ lat: number; lng: number; title?: string }>
}>(), {
  center: () => ({ lat: 0, lng: 0 }),
  zoom: 10
})

const mapRef = ref<HTMLElement>()
const map = ref<google.maps.Map>()

onMounted(() => {
  if (!mapRef.value) return

  map.value = new google.maps.Map(mapRef.value, {
    center: props.center,
    zoom: props.zoom
  })

  props.markers?.forEach(marker => {
    new google.maps.Marker({
      position: { lat: marker.lat, lng: marker.lng },
      map: map.value,
      title: marker.title
    })
  })
})

watch(() => props.center, (newCenter) => {
  map.value?.setCenter(newCenter)
})

defineExpose({ map })
</script>
