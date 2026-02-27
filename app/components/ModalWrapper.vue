<template>
    <UModal :title="modalTitle" :dismissible="dismissible" :ui="ui" :fullscreen="fullScreen">
        <template #body>
            <div class="flex-1 overflow-y-auto p-4 pt-2">
                <component :is="comp" v-bind="compProps" @title="setTitle" @value="setCloseValue" @close="close"/>
            </div>
        </template>
    </UModal>
</template>
<script setup lang="ts">
const attrs = useAttrs()
const emit = defineEmits(['close'])
const props = defineProps({
    color: {type: String, default: ''},
    persistent: {type: Boolean, default: false},
    fullScreen: {type: Boolean, default: true},
    title: {type: String, default: ''},
    comp: {type: Object, required: true}
})

const modalTitle = ref(props.title)
const closeValue = ref(null)

const compProps = computed(() => {
    const { color, fullscreen, persistent, comp, ...rest } = attrs
    return rest
})

const ui: any = {}
if (props.color) {
    ui.header = `bg-${props.color} rounded-t-lg`
    ui.title = `text-inverted font-semibold`
    ui.close = 'text-inverted'
}

const dismissible = computed(() => {
    return !props.persistent
})

function setTitle(newTitle: string) {
    modalTitle.value = newTitle
}

function setCloseValue(v: any) {
    closeValue.value = v
}

function close(value: any) {
    emit('close', value)
}
</script>
