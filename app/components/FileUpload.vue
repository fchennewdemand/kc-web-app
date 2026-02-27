<template>
  <div>
    <div class="flex items-center gap-2 mb-2">
      <span class="text-sm font-medium">{{ label }}</span>
      <input 
        :id="id" 
        type="file" 
        :accept="accept"
        :multiple="multiple"
        @change="handleChange" 
        class="hidden" 
      />
      <label :for="id" class="cursor-pointer">
        <UButton as="span" color="neutral" size="xs">Upload</UButton>
      </label>
    </div>
    <ul v-if="files.length" class="space-y-1">
      <li v-for="f in files" :key="f.name" class="text-sm">
        <span aria-hidden="true">{{ f.uploading ? '⏳' : '✓' }}</span> {{ f.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  form: any
  label?: string
  accept?: string
  multiple?: boolean
  id?: string
}>(), {
  label: 'Upload File'
})

const { files, onFileSelect } = useUpload()

const id = props.id || 'file-upload'

const handleChange = (e: Event) => {
  onFileSelect(e, props.form)
}
</script>
