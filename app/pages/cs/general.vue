<template>
  <UContainer>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Other Topics Feedback</h2>
      </template>
      <p class="mb-4">Use this form for general questions, comments or suggestions. Your feedback is important to us.</p>
      <UForm :state="form" :schema="schema" @submit="submit">
        <UFormField label="Type of comment" name="commentType" required>
          <USelect v-model="form.commentType" :items="commentTypes" class="w-full" />
        </UFormField>
        <UFormField label="Your Name" name="name" required>
          <UInput v-model="form.name" class="w-full" />
        </UFormField>
        <UFormField label="Email" name="email" required>
          <UInput v-model="form.email" type="email" placeholder="name@domain.com" class="w-full" />
        </UFormField>
        <UFormField label="Phone Number" name="phone" help="Please include the area code.">
          <UInput v-model="form.phone" type="tel" class="w-full" />
        </UFormField>
        <UFormField label="How do you want to be contacted?" name="contactPreference" required>
          <USelect v-model="form.contactPreference" :items="preferences" class="w-full" />
        </UFormField>
        <UFormField label="ORCA Card Number" name="orca">
          <UInput v-model="form.orca" class="w-full" />
        </UFormField>
        <UFormField label="Your Comment" name="comments" required help="Please provide any information necessary for us to research your comment or concern.">
          <UTextarea v-model="form.comments" :rows="8" :maxlength="4000" class="w-full" />
        </UFormField>
        <FileUpload ref="fileUploadRef" :form="form" label="Your Uploads" :multiple="true" />
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
const fileUploadRef = ref()

const schema = v.object({
  commentType: v.pipe(v.string(), v.minLength(1, 'Type of comment is required')),
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  phone: v.optional(v.string()),
  contactPreference: v.pipe(v.string(), v.minLength(1, 'Contact preference is required')),
  orca: v.optional(v.string()),
  comments: v.pipe(v.string(), v.minLength(1, 'Comments are required'), v.maxLength(4000))
})


const commentTypes = ref([])
const preferences = ref([])

const form = reactive({
  commentType: '',
  name: '',
  email: '',
  phone: '',
  contactPreference: 'Email',
  orca: '',
  comments: '',
  caseType: 'Comment',
  files: []
})

onMounted(async () => {
  const data = await $nd.lambda('initCase', { caseType: 'Comment' })
  if (data.payload) {
    commentTypes.value = data.payload.commentTypes || []
    preferences.value = data.payload.preferences || []
  }
})

const submit = async () => {
  const json = await $nd.lambda('saveCase', {record: JSON.stringify(form)})
  if (json.success) {
    const uploadResults = fileUploadRef.value?.getResults() || []
    for (const result of uploadResults) {
      await $nd.lambda('finishUpload', {...result, parentId: json.payload.Id})
    }
  }
  await $nd.confirm(json.title, json.message, { color: 'success', actions: [{ label: 'Close', value: true }] })
  window.location.href = 'https://kingcounty.gov/depts/transportation/metro/contact-us.aspx'
}
</script>
