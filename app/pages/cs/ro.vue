<template>
  <UContainer>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Mobility Services Comments</h2>
      </template>
      <p class="mb-4">Use this form for questions, comments or suggestions about your experience.</p>
      <UForm :state="form" :schema="schema" @submit="submit">
        <h3 class="text-lg font-semibold mb-3">Your Comment</h3>
        <UFormField label="Type of comment" name="commentType" required>
          <USelect v-model="form.commentType" :items="commentTypes" class="w-full" />
        </UFormField>
        <UFormField label="Your Message" name="comments" required>
          <UTextarea v-model="form.comments" :rows="8" class="w-full" :maxlength="4000" />
        </UFormField>
        <FileUpload :form="form" label="Your Uploads" :multiple="true" />
        
        <h3 class="text-lg font-semibold mb-3 mt-6">Comment Details</h3>
        <UFormField label="Date" name="date" required help="What day did this happen?">
          <UInput v-model="form.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="Time" name="time" required help="What time did this happen?">
          <UInput v-model="form.time" class="w-full" type="time" />
        </UFormField>
        <UFormField label="Service Type" name="serviceType">
          <USelect v-model="form.serviceType" :items="serviceTypes" class="w-full" />
        </UFormField>
        <UFormField label="Vehicle Number" name="bus">
          <UInput v-model="form.bus" class="w-full" />
        </UFormField>
        <UFormField label="Direction of Travel" name="direction" help="For example, toward or away from downtown Seattle, north, south, east or westbound.">
          <UInput v-model="form.direction" class="w-full" />
        </UFormField>
        <UFormField label="Location" name="location" required help="Where did the incident happen?">
          <UInput v-model="form.location" class="w-full" />
        </UFormField>
        
        <h3 class="text-lg font-semibold mb-3 mt-6">Your Contact Information</h3>
        <UFormField name="anonymous">
          <UCheckbox v-model="form.anonymous" label="Anonymous" />
        </UFormField>
        <UFormField label="Name" name="name" :required="!form.anonymous">
          <UInput v-model="form.name" class="w-full" :disabled="form.anonymous" />
        </UFormField>
        <UFormField label="Email" name="email" :required="!form.anonymous">
          <UInput v-model="form.email" class="w-full" type="email" placeholder="name@domain.com" :disabled="form.anonymous" />
        </UFormField>
        <UFormField label="Phone Number" name="phone" help="Please include the area code.">
          <UInput v-model="form.phone" class="w-full" type="tel" :disabled="form.anonymous" />
        </UFormField>
        <UFormField label="How do you want to be contacted?" name="contactPreference" required>
          <USelect v-model="form.contactPreference" :items="preferences" class="w-full" />
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

const schema = v.object({
  commentType: v.pipe(v.string(), v.minLength(1, 'Type of comment is required')),
  comments: v.pipe(v.string(), v.minLength(1, 'Comments are required'), v.maxLength(4000)),
  date: v.pipe(v.string(), v.minLength(1, 'Date is required')),
  time: v.pipe(v.string(), v.minLength(1, 'Time is required')),
  serviceType: v.optional(v.string()),
  bus: v.optional(v.string()),
  direction: v.optional(v.string()),
  location: v.pipe(v.string(), v.minLength(1, 'Location is required')),
  anonymous: v.boolean(),
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  contactPreference: v.pipe(v.string(), v.minLength(1, 'Contact preference is required'))
})


const commentTypes = ref([])
const preferences = ref([])
const serviceTypes = ref([])

const form = reactive({
  commentType: '',
  comments: '',
  date: '',
  time: '',
  serviceType: '',
  bus: '',
  direction: '',
  location: '',
  anonymous: false,
  name: '',
  email: '',
  phone: '',
  contactPreference: 'Email',
  caseType: 'Rideshare Operation',
  files: []
})

onMounted(async () => {
  const data = await $nd.lambda('initCase', { caseType: 'Rideshare Operation' })
  if (data.payload) {
    commentTypes.value = data.payload.commentTypes || []
    preferences.value = data.payload.preferences || []
    serviceTypes.value = data.payload.serviceTypes || []
  }
})

const submit = async () => {
  const json = await $nd.lambda('submitCase', form)
  await $nd.confirm(json.title, json.message, { color: 'success', actions: [{ label: 'Close', value: true }] })
  window.location.href = 'https://kingcounty.gov/depts/transportation/metro/contact-us.aspx'
}
</script>
