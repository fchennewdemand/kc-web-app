<template>
    <UModal :title="title" :dismissible="dismissible" :close="dismissible" :ui="ui">
        <template #body>
            <slot>
                <div v-html="message" v-if="!!message"></div>
            </slot>
        </template>
        <template #footer>
            <UButton v-for="r in actions" :color="r.color || 'primary'" variant="outline" :class="r.cls" @click="close(r.value)">{{ r.label }}</UButton>
        </template>
        <div class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"/>
    </UModal>
</template>
<script setup>
import {computed} from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
    title: {type: String, default: ''},
    color: {type: String, default: ''},
    message: {type: String, default: ''},
    actions: {type: Array},
    persistent: {type: Boolean, default: false}
})

const ui = {}
if (props.color) {
    ui.header = `bg-${props.color} rounded-t-lg`
    ui.title = `text-inverted font-semibold`
    ui.close = 'text-inverted'
}

const dismissible = computed(() => {
    return !props.persistent
})

function close(value) {
    emit('close', value)
}
</script>
