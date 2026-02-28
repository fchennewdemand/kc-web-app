<template>
    <div class="flex flex-col h-screen">
        <u-header :title="title" icon="i-lucide-message-circle" :actions="actions"/>
        <chat-bot class="flex-1" @navigate="handleNavigation" :success-message="successMessage || undefined" :initial-question="initialQuestion || undefined"/>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const actions = [{label: 'Close', to: '/'}]
const successMessage = ref<string | null>(null)
const initialQuestion = ref<string | null>(null)
const runtime = useRuntimeConfig()
const title = computed(() => {
    return `AI Chat`
})

function handleNavigation(route: string) {
    // Handle navigation from chat
    navigateTo(route)
}

// Handle success message and question from query params
onMounted(() => {
    if (route.query.message) {
        successMessage.value = route.query.message as string
    }

    if (route.query.question) {
        initialQuestion.value = route.query.question as string
    }

    // Clear the query params
    if (route.query.message || route.query.question) {
        navigateTo({path: '/chat', replace: true})
    }
})
</script>

