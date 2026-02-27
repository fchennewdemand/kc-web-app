<template>
    <UModal v-model="showing" :ui="ui" :dismissible="false">
        <template #title></template>
        <template #description></template>
        <template #content>
            <div class="flex-col text-center">
                <UIcon :name="spinner" size="40" class="text-primary-700"/>
                <div class="mt-1 text-sm text-center text-ellipsis max-w-2xl" v-if="!!text">{{ text }}</div>
            </div>
        </template>
    </UModal>
</template>
<script setup lang="ts">
import {debounce} from "lodash";

const showing = ref(true)
const text = ref('Loading...')
const ui = {
    content: 'sm:rounded-none sm:shadow-none !ring-0 bg-transparent',
}

const props = defineProps({
    spinner: {type: String, default: 'i-svg-spinners:6-dots-rotate'},
    message: {type: String, default: 'Loading...'}
})

function show(params: string) {
    showing.value = true
    if (params) {
        text.value = params
    } else {
        text.value = 'Loading...'
    }
}

const hide = debounce(() => {
    showing.value = false
    text.value = 'Loading...'
}, 100)

watch(() => props.message, (newValue: string) => {
    text.value = newValue
})
onMounted(() => {
    text.value = props.message
})

defineExpose({show, hide})
</script>
