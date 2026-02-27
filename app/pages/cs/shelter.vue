<template>
  <UContainer>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Bus Stop/Shelter Feedback</h2>
      </template>
      <p class="mb-4">Use this form for questions, suggestions, commendations or complaints about stops/shelters.</p>
      <UForm :state="form" :schema="schema" @submit="submit">
        <UFormField label="What kind of issue(s) are you reporting" name="stopIssue" required>
          <USelect v-model="form.stopIssue" :items="stopIssues" class="w-full" />
        </UFormField>
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
        <UFormField label="Date of Observation" name="date" required>
          <UInput v-model="form.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="Time of Observation" name="time" required>
          <UInput v-model="form.time" class="w-full" type="time" />
        </UFormField>
        <UFormField label="Route Number" name="route">
          <USelect v-model="form.route" :items="routes" class="w-full" />
        </UFormField>
        <StopLookup :form="form" />
        <UFormField label="Address/Location" name="location" :required="!form.stop">
          <UInput v-model="form.location" class="w-full" />
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
  stopIssue: v.pipe(v.string(), v.minLength(1, 'Issue type is required')),
  commentType: v.pipe(v.string(), v.minLength(1, 'Type of comment is required')),
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  phone: v.optional(v.string()),
  contactPreference: v.pipe(v.string(), v.minLength(1, 'Contact preference is required')),
  orca: v.optional(v.string()),
  date: v.pipe(v.string(), v.minLength(1, 'Date is required')),
  time: v.pipe(v.string(), v.minLength(1, 'Time is required')),
  route: v.optional(v.string()),
  stop: v.optional(v.string()),
  location: v.string(),
  comments: v.pipe(v.string(), v.minLength(1, 'Comments are required'), v.maxLength(4000))
})


const stopIssues = ref([])
const commentTypes = ref([])
const preferences = ref([])
const routes = ref([])

const form = reactive({
  stopIssue: '',
  commentType: '',
  name: '',
  email: '',
  phone: '',
  contactPreference: 'Email',
  orca: '',
  date: '',
  time: '',
  route: '',
  stop: '',
  stopId: '',
  location: '',
  comments: '',
  caseType: 'Bus Stop/Shelter',
  files: []
})

onMounted(async () => {
  const data = await $nd.lambda('initCase', { caseType: 'Bus Stop/Shelter' })
  if (data.payload) {
    stopIssues.value = data.payload.stopIssues || []
    commentTypes.value = data.payload.commentTypes || []
    preferences.value = data.payload.preferences || []
    routes.value = data.payload.routes || []
  }
})

const submit = async () => {
  const json = await $nd.lambda('submitCase', form)
  await $nd.confirm(json.title, json.message, { color: 'success', actions: [{ label: 'Close', value: true }] })
  window.location.href = 'https://kingcounty.gov/depts/transportation/metro/contact-us.aspx'
}
</script>
