<template>
  <UContainer>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Access Paratransit Comments</h2>
      </template>
      <p class="mb-4">Use this form to provide any comments including commendations, concerns, inquiries, and complaints regarding your experience with the Access Paratransit program.</p>
      <UForm :state="form" :schema="schema" @submit="submit">
        <UFormField label="Type of comment" name="commentType" required>
          <USelect v-model="form.commentType" :items="commentTypes" class="w-full" />
        </UFormField>
        
        <UFormField label="Please select one of the following contact choices:" name="category" required>
          <URadioGroup v-model="form.category" :items="categories" @change="onCategoryChange" />
        </UFormField>

        <!-- Rider Category -->
        <div v-if="form.category === 'rider'" class="space-y-4 p-4 bg-gray-50 rounded">
          <p class="text-sm">Please provide your name (required) and an additional piece of identification:</p>
          <UFormField label="Access Rider's Name" name="name" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="Access ID" name="accessId">
            <UInput v-model="form.accessId" class="w-full" />
          </UFormField>
          <UFormField label="Home Phone Number" name="phone">
            <UInput v-model="form.phone" class="w-full" type="tel" />
          </UFormField>
          <UFormField label="Email Address" name="email" :required="form.contactPreference === 'Email'">
            <UInput v-model="form.email" class="w-full" type="email" />
          </UFormField>
        </div>

        <!-- Proxy Category -->
        <div v-if="form.category === 'proxy'" class="space-y-4 p-4 bg-gray-50 rounded">
          <UFormField label="Contact Name" name="contactPerson" required>
            <UInput v-model="form.contactPerson" class="w-full" />
          </UFormField>
          <UFormField label="Contact Phone Number" name="contactPhone">
            <UInput v-model="form.contactPhone" class="w-full" type="tel" />
          </UFormField>
          <UFormField label="Contact Email" name="contactEmail" :required="form.contactTarget === 'me' && form.contactPreference === 'Email'">
            <UInput v-model="form.contactEmail" class="w-full" type="email" />
          </UFormField>
          <UFormField label="Relationship to Access Rider" name="relationship">
            <UInput v-model="form.relationship" class="w-full" />
          </UFormField>
          <UFormField name="contactTarget">
            <URadioGroup v-model="form.contactTarget" :items="[{value:'me',label:'Send response to me'},{value:'rider',label:'Send response to the rider'}]" />
          </UFormField>
          <p class="text-sm">Please provide the Access rider's name (required) and an additional piece of identification:</p>
          <UFormField label="Access Rider's Name" name="name" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="Access ID" name="accessId">
            <UInput v-model="form.accessId" class="w-full" />
          </UFormField>
          <UFormField label="Access Rider's Home Phone Number" name="phone">
            <UInput v-model="form.phone" class="w-full" type="tel" />
          </UFormField>
          <UFormField label="Access Rider's Email" name="email" :required="form.contactTarget === 'rider' && form.contactPreference === 'Email'">
            <UInput v-model="form.email" class="w-full" type="email" />
          </UFormField>
        </div>

        <!-- Saw Category -->
        <div v-if="form.category === 'saw'" class="space-y-4 p-4 bg-gray-50 rounded">
          <p class="text-sm">Please provide your name (required) and phone number:</p>
          <UFormField label="Contact Name" name="name" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="Contact Phone Number" name="phone">
            <UInput v-model="form.phone" class="w-full" type="tel" />
          </UFormField>
          <UFormField label="Contact Email" name="email" :required="form.contactPreference === 'Email'">
            <UInput v-model="form.email" class="w-full" type="email" />
          </UFormField>
        </div>

        <div class="mt-4">
          <p class="text-sm mb-2">Email is Metro Customer Services' preferred way of providing responses. If you are unable to use email, please select your preferred method below:</p>
          <UFormField name="contactPreference">
            <URadioGroup v-model="form.contactPreference" :items="preferences" />
          </UFormField>
          <UFormField v-if="form.contactPreference !== 'Email' && form.contactPreference !== 'No Response'" name="contactData" required>
            <UInput v-model="form.contactData" class="w-full" placeholder="Please type your contact information" />
          </UFormField>
        </div>

        <UFormField label="Category of feedback" name="subject" required>
          <USelect v-model="form.subject" :items="subjects" class="w-full" />
        </UFormField>
        <UFormField v-if="form.subject === 'My other issue'" label="My other issue" name="otherSubject" required>
          <UInput v-model="form.otherSubject" class="w-full" />
        </UFormField>
        <UFormField label="Incident Date" name="date" required>
          <UInput v-model="form.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="Time of Day" name="time" required>
          <UInput v-model="form.time" class="w-full" type="time" />
        </UFormField>
        <UFormField label="Where did this happen?" name="location" help="Please be as descriptive as possible">
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

const schema = v.object({
  commentType: v.pipe(v.string(), v.minLength(1, 'Type of comment is required')),
  category: v.pipe(v.string(), v.minLength(1, 'Category is required')),
  name: v.string(),
  accessId: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.string(),
  contactPerson: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  relationship: v.optional(v.string()),
  contactTarget: v.optional(v.string()),
  contactPreference: v.string(),
  contactData: v.optional(v.string()),
  subject: v.pipe(v.string(), v.minLength(1, 'Category of feedback is required')),
  otherSubject: v.optional(v.string()),
  date: v.pipe(v.string(), v.minLength(1, 'Date is required')),
  time: v.pipe(v.string(), v.minLength(1, 'Time is required')),
  location: v.optional(v.string()),
  comments: v.pipe(v.string(), v.minLength(1, 'Comments are required'), v.maxLength(4000))
})


const commentTypes = ref([])
const categories = ref([])
const preferences = ref([])
const subjects = ref([])

const form = reactive({
  commentType: '',
  category: '',
  name: '',
  accessId: '',
  phone: '',
  email: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  relationship: '',
  contactTarget: 'me',
  contactPreference: 'Email',
  contactData: '',
  subject: '',
  otherSubject: '',
  date: '',
  time: '',
  location: '',
  comments: '',
  caseType: 'A3',
  files: []
})

const onCategoryChange = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.accessId = ''
  form.contactPerson = ''
  form.contactPhone = ''
  form.contactEmail = ''
  form.relationship = ''
}

onMounted(async () => {
  const data = await $nd.lambda('initCase', { caseType: 'A3' })
  if (data.payload) {
    commentTypes.value = data.payload.commentTypes || []
    categories.value = data.payload.categories || []
    preferences.value = data.payload.preferences || []
    subjects.value = data.payload.subjects || []
  }
})

const submit = async () => {
  const json = await $nd.lambda('submitCase', form)
  await $nd.confirm(json.title, json.message, { color: 'success', actions: [{ label: 'Close', value: true }] })
  window.location.href = 'https://kingcounty.gov/depts/transportation/metro/contact-us.aspx'
}
</script>
