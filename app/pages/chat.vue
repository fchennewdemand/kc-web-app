<template>
    <div class="flex flex-col h-screen">
        <UContainer class="flex-1 flex flex-col overflow-hidden">
            <h2 class="py-4">AI Chat</h2>
            <chat-bot class="flex-1 overflow-hidden" @navigate="handleNavigation" :success-message="successMessage || undefined" :initial-question="initialQuestion || undefined"/>
        </UContainer>
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

