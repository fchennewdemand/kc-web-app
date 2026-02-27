export default function () {
    const {$nd} = useNuxtApp()
    const files = ref<any[]>([])

    const onFileSelect = async (e: Event, form: any) => {
        const target = e.target as HTMLInputElement
        if (target.files) {
            for (const file of Array.from(target.files)) {
                const fileObj = {name: file.name, uploading: true}
                files.value.push(fileObj)
                try {
                    const result = await $nd.upload(file, {})
                    if (!form.files) form.files = []
                    form.files.push(result.payload)
                    fileObj.uploading = false
                } catch (err) {
                    files.value = files.value.filter(f => f !== fileObj)
                }
            }
        }
    }

    return {files, onFileSelect}
}
