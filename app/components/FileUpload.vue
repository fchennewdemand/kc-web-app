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
        <ul v-if="files.length" class="space-y-2">
            <li v-for="f in files" :key="f.name" class="text-sm">
                <div class="flex items-center gap-2">
                    <span aria-hidden="true">{{ f.uploading ? '⏳' : '✓' }}</span>
                    <span>{{ f.name }}</span>
                </div>
                <UProgress v-if="f.uploading" :value="f.progress" class="mt-1" />
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    parentId?: string
    objectName?: string
    label?: string
    accept?: string
    multiple?: boolean
    id?: string
}>(), {
    label: 'Upload File', objectName: 'Attachment'
})

const {$nd} = useNuxtApp()
const files = ref<any[]>([])
const results = ref<any[]>([])
const onFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files) {
        for (const file of Array.from(target.files)) {
            const fileObj = {name: file.name, uploading: true, progress: 0}
            files.value.push(fileObj)
            try {
                const xhr = new XMLHttpRequest()
                const fileInput = {name: file.name, type: file.type, size: file.size, objectName: props.objectName, parentId: props.parentId}
                const json = await $nd.lambda({name: 'requestUpload', skipBusy: true, input: fileInput})
                
                await new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            fileObj.progress = (e.loaded / e.total) * 100
                        }
                    })
                    xhr.addEventListener('load', () => resolve(xhr.response))
                    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
                    xhr.open('PUT', json.payload.url)
                    xhr.setRequestHeader('Content-Type', file.type)
                    xhr.send(file)
                })
                
                results.value.push(json.payload)
                fileObj.uploading = false
            } catch (err) {
                files.value = files.value.filter(f => f !== fileObj)
            }
        }
    }
}

const getResults = () => results.value

defineExpose({ getResults })

const id = props.id || 'file-upload'

const handleChange = (e: Event) => {
    onFileSelect(e)
}
</script>
