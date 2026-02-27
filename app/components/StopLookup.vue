<template>
  <div>
    <UFormField label="Stop ID (if known)" name="stop" help="This is the 3- to 5-digit number painted on the top, left-hand corner of the shelter.">
      <USelectMenu 
        v-model="selectedStop" 
        v-model:searchTerm="searchTerm"
        :items="stops"
        placeholder="Search for stop..."
        class="w-64"
      />
    </UFormField>
    <div v-if="selectedStop" class="mt-4">
      <div id="map" class="h-[300px] w-full rounded-md"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  form: any
}>()

const { $nd } = useNuxtApp()
const searchTerm = ref('')
const stops = ref<any[]>([])
const selectedStop = ref<any>(null)
let map: any = null
let marker: any = null

watch(searchTerm, async (query) => {
  if (query.length < 2) {
    stops.value = []
    return
  }
  const json = await $nd.lambda('searchStops', { query })
  stops.value = json.payload?.stops || []
})

watch(selectedStop, (stop) => {
  if (stop) {
    props.form.stop = stop.label
    props.form.stopId = stop.id
    props.form.location = stop.label
    
    nextTick(() => {
      initMap(stop)
    })
  }
})

const initMap = (stop: any) => {
  if (!window.google) return
  
  const mapEl = document.getElementById('map')
  if (!mapEl) return
  
  if (!map) {
    map = new google.maps.Map(mapEl, {
      center: { lat: stop.lat, lng: stop.lng },
      zoom: 16
    })
  } else {
    map.setCenter({ lat: stop.lat, lng: stop.lng })
  }
  
  if (marker) {
    marker.setMap(null)
  }
  
  marker = new google.maps.Marker({
    position: { lat: stop.lat, lng: stop.lng },
    map: map,
    title: stop.label
  })
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${useRuntimeConfig().public.googleMapsKey}`
  script.async = true
  document.head.appendChild(script)
})
</script>
