<template>
  <UContainer>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Lost & Found</h2>
      </template>
      <div class="mb-4">
        <p>The King County Metro Lost & Found office at King Street Center is open weekdays from 8:30am to 4:30pm.</p>
        <p class="mt-2">Found items are held for 30 days from the date of ride, except for bikes (10 days).</p>
        <p class="font-semibold mt-2">You must have a valid email address to submit this form.</p>
      </div>
      <UForm :state="form" :schema="schema" @submit="submit">
        <h3 class="text-lg font-semibold mb-3">Lost Item Details</h3>
        <UFormField label="Item Type" name="lostItemType" required>
          <USelect v-model="form.lostItemType" :items="lostItemTypes" class="w-full" />
        </UFormField>
        <UFormField label="Item Primary Color" name="lostItemColor" required>
          <USelect v-model="form.lostItemColor" :items="lostItemColors" class="w-full" />
        </UFormField>
        <UFormField label="Item Color Style" name="lostItemColorStyle" required>
          <USelect v-model="form.lostItemColorStyle" :items="lostItemColorStyles" class="w-full" />
        </UFormField>
        <UFormField label="Description" name="itemDescription" required>
          <UTextarea v-model="form.itemDescription" :rows="5" class="w-full" :maxlength="4000" />
        </UFormField>
        <FileUpload :form="form" label="Attach Picture (optional)" accept="image/*" :multiple="true" />

        <h3 class="text-lg font-semibold mb-3 mt-6">Your Ride Details</h3>
        <UFormField label="Date of Ride" name="date" required help="What day were you on the bus?">
          <UInput v-model="form.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="Time of Day" name="time" required help="When did you lose the item?">
          <UInput v-model="form.time" class="w-full" type="time" />
        </UFormField>
        <UFormField label="Service Type" name="serviceType" required>
          <USelect v-model="form.serviceType" :items="serviceTypes" class="w-full" @change="onServiceTypeChange" />
        </UFormField>
        <UFormField v-if="useRoute" label="Route Number" name="route" required>
          <USelect v-model="form.route" :items="filteredRoutes" class="w-full" />
        </UFormField>
        <UFormField :label="useBus ? 'Bus Number' : 'Vehicle Number'" name="bus">
          <UInput v-model="form.bus" class="w-full" />
        </UFormField>
        <UFormField label="Location" name="location">
          <UInput v-model="form.location" class="w-full" />
        </UFormField>

        <h3 class="text-lg font-semibold mb-3 mt-6">Your Contact Information</h3>
        <UFormField label="Name" name="name" required help="Enter First & Last name only">
          <UInput v-model="form.name" class="w-full" placeholder="Jane Doe" />
        </UFormField>
        <UFormField label="Email" name="email" required help="Valid email address required for correspondence">
          <UInput v-model="form.email" class="w-full" type="email" placeholder="name@domain.com" />
        </UFormField>
        <UFormField label="Phone Number" name="phone" required help="Please include the area code.">
          <UInput v-model="form.phone" class="w-full" type="tel" />
        </UFormField>

        <div class="flex gap-2 mt-4">
          <UButton type="submit" color="primary">Submit</UButton>
          <UButton @click="navigateTo('/')" color="neutral">Cancel</UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const { $nd } = useNuxtApp()
const { onFileSelect } = useUpload()

const schema = v.object({
  lostItemType: v.pipe(v.string(), v.minLength(1, 'Item type is required')),
  lostItemColor: v.pipe(v.string(), v.minLength(1, 'Item color is required')),
  lostItemColorStyle: v.pipe(v.string(), v.minLength(1, 'Item color style is required')),
  itemDescription: v.pipe(v.string(), v.minLength(1, 'Description is required'), v.maxLength(4000)),
  date: v.pipe(v.string(), v.minLength(1, 'Date is required')),
  time: v.pipe(v.string(), v.minLength(1, 'Time is required')),
  serviceType: v.pipe(v.string(), v.minLength(1, 'Service type is required')),
  route: v.string(),
  bus: v.optional(v.string()),
  location: v.optional(v.string()),
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  phone: v.pipe(v.string(), v.minLength(1, 'Phone is required'))
})


const lostItemTypes = ref([])
const lostItemColors = ref([])
const lostItemColorStyles = ref([])
const serviceTypes = ref([])
const routes = ref([])
const useRoute = ref(false)
const useBus = ref(true)

const form = reactive({
  lostItemType: '',
  lostItemColor: '',
  lostItemColorStyle: '',
  itemDescription: '',
  date: '',
  time: '',
  serviceType: '',
  route: '',
  bus: '',
  location: '',
  name: '',
  email: '',
  phone: '',
  caseType: 'Lost Item',
  files: []
})

const filteredRoutes = computed(() => {
  if (!form.serviceType) return routes.value
  return routes.value.filter((r: any) => r.serviceType === form.serviceType)
})

const onServiceTypeChange = () => {
  form.route = ''
  useRoute.value = form.serviceType !== ''
  useBus.value = form.serviceType === 'Bus' || form.serviceType === ''
}

onMounted(async () => {
  const data = await $nd.lambda('initCase', { caseType: 'Lost Item' })
  if (data.payload) {
    lostItemTypes.value = data.payload.lostItemTypes || []
    lostItemColors.value = data.payload.lostItemColors || []
    lostItemColorStyles.value = data.payload.lostItemColorStyles || []
    serviceTypes.value = data.payload.serviceTypes || []
    routes.value = data.payload.routes || []
  }
})

const submit = async () => {
  const json = await $nd.lambda('submitCase', form)
  await $nd.confirm(json.title, json.message, { color: 'success', actions: [{ label: 'Close', value: true }] })
  window.location.href = 'https://kingcounty.gov/depts/transportation/metro/contact-us.aspx'
}
</script>
