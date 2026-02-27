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
      <GoogleMap :api-key="apiKey" :center="center" :zoom="16" class="h-[300px] w-full rounded-md">
        <Marker :options="{ position: center }" />
      </GoogleMap>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map'

const props = defineProps<{
  form: any
}>()

const { $nd } = useNuxtApp()
const apiKey = useAppConfig().mapKey
const searchTerm = ref('')
const stops = ref<any[]>([])
const selectedStop = ref<any>(null)
const center = computed(() => selectedStop.value ? { lat: selectedStop.value.lat, lng: selectedStop.value.lng } : { lat: 0, lng: 0 })

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
  }
})
</script>
