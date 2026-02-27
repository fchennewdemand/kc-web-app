<template>
  <UContainer>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Bus Driver Feedback</h2>
      </template>
      <p class="mb-4">Use this form for questions, suggestions, commendations or complaints about a driver or operator.</p>
      <UForm :state="form" :schema="schema" @submit="submit">
        <UFormField label="Type of comment" name="commentType" required>
          <USelect v-model="form.commentType" :items="commentTypes" class="w-full" />
        </UFormField>
        <UFormField label="Your Name" name="name" required>
          <UInput v-model="form.name" class="w-full" />
        </UFormField>
        <UFormField label="Email" name="email" required>
          <UInput v-model="form.email" class="w-full" type="email" placeholder="name@domain.com" />
        </UFormField>
        <UFormField label="Phone Number" name="phone" help="Please include the area code.">
          <UInput v-model="form.phone" class="w-full" type="tel" />
        </UFormField>
        <UFormField label="How do you want to be contacted?" name="contactPreference" required>
          <USelect v-model="form.contactPreference" :items="preferences" class="w-full" />
        </UFormField>
        <UFormField label="ORCA Card Number" name="orca">
          <UInput v-model="form.orca" class="w-full" />
        </UFormField>
        <UFormField label="Date of Ride" name="date" required help="What day did this happen?">
          <UInput v-model="form.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="Time of Day" name="time" required help="What time did this happen?">
          <UInput v-model="form.time" class="w-full" type="time" />
        </UFormField>
        <UFormField label="Service Type" name="serviceType" required>
          <USelect v-model="form.serviceType" :items="serviceTypes" class="w-full" @change="onServiceTypeChange" />
        </UFormField>
        <UFormField v-if="useRoute" label="Route Number" name="route">
          <USelect v-model="form.route" :items="filteredRoutes" class="w-full" />
        </UFormField>
        <UFormField :label="useBus ? 'Bus Number' : 'Vehicle Number'" name="bus" :help="useBus ? 'This is the 3- or 4-digit number on the outside of a bus.' : ''">
          <UInput v-model="form.bus" class="w-full" />
        </UFormField>
        <UFormField label="Direction of Travel" name="direction" :required="!form.bus" help="For example, toward or away from downtown Seattle, north, south, east or westbound.">
          <UInput v-model="form.direction" class="w-full" />
        </UFormField>
        <StopLookup :form="form" />
        <UFormField label="Location" name="location" required help="Where did the incident happen? (intersection, landmark, nearest bus stop)">
          <UInput v-model="form.location" class="w-full" />
        </UFormField>
        <UFormField label="Operator Description" name="driver" required help="Include any features that will help us identify the driver/vehicle operator.">
          <UTextarea v-model="form.driver" :rows="5" class="w-full" />
        </UFormField>
        <UFormField label="Your Comment" name="comments" required help="Please provide any information necessary for us to research your comment or concern.">
          <UTextarea v-model="form.comments" :rows="8" class="w-full" :maxlength="4000" />
        </UFormField>
        <FileUpload :form="form" label="Your Uploads" :multiple="true" />
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
  commentType: v.pipe(v.string(), v.minLength(1, 'Type of comment is required')),
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  phone: v.optional(v.string()),
  contactPreference: v.pipe(v.string(), v.minLength(1, 'Contact preference is required')),
  orca: v.optional(v.string()),
  date: v.pipe(v.string(), v.minLength(1, 'Date is required')),
  time: v.pipe(v.string(), v.minLength(1, 'Time is required')),
  serviceType: v.pipe(v.string(), v.minLength(1, 'Service type is required')),
  route: v.optional(v.string()),
  bus: v.optional(v.string()),
  direction: v.string(),
  stop: v.optional(v.string()),
  location: v.pipe(v.string(), v.minLength(1, 'Location is required')),
  driver: v.pipe(v.string(), v.minLength(1, 'Operator description is required')),
  comments: v.pipe(v.string(), v.minLength(1, 'Comments are required'), v.maxLength(4000))
})


const commentTypes = ref([])
const preferences = ref([])
const serviceTypes = ref([])
const routes = ref([])
const useRoute = ref(false)
const useBus = ref(true)

const form = reactive({
  commentType: '',
  name: '',
  email: '',
  phone: '',
  contactPreference: 'Email',
  orca: '',
  date: '',
  time: '',
  serviceType: '',
  route: '',
  bus: '',
  direction: '',
  stop: '',
  stopId: '',
  location: '',
  driver: '',
  comments: '',
  caseType: 'Bus Driver',
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
  const data = await $nd.lambda('initCase', { caseType: 'Bus Driver' })
  if (data.payload) {
    commentTypes.value = data.payload.commentTypes || []
    preferences.value = data.payload.preferences || []
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
