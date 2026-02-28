<template>
    <div class="flex flex-col h-full max-h-screen overflow-hidden">
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-for="(msg, index) in messages" :key="index" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[70%] rounded-lg p-3" :class="getMessageClass(msg)">
                    <div class="text-sm whitespace-pre-wrap" v-html="formatMessage(msg.content[0]?.text || msg.content)" @click="handleClick"></div>
                </div>
            </div>
            <div v-if="loading" class="flex justify-start">
                <div class="rounded-lg p-3">
                    <u-icon name="i-lucide-loader" class="w-5 h-5 text-primary animate-spin"></u-icon>
                </div>
            </div>
        </div>
        <div class="border-t p-4 flex-shrink-0">
            <div class="flex gap-2">
                <u-input 
                    v-model="input" 
                    :placeholder="placeholder" 
                    class="flex-1" 
                    ref="textInput" 
                    @keydown.enter="sendMessage"
                />
                <u-button icon="i-lucide-send" @click="sendMessage" :disabled="!input.trim() || loading"/>
                <u-button icon="i-lucide-help-circle" @click="showHelp" variant="outline" title="Show help"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    initialContext: {
        type: Object as PropType<{donorId?: string, householdId?: string, fiscalYear?: string}>,
        default: () => ({})
    },
    placeholder: {
        type: String,
        default: 'Ask me anything about kingcounty bus operation...'
    },
    successMessage: {
        type: String,
        default: null
    },
    initialQuestion: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['action', 'navigate'])

const {messages, send, loading} = useConversation()
const input = ref('')
const messagesContainer = useTemplateRef('messagesContainer')
const textInput = useTemplateRef('textInput')

watch(messages, () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}, {deep: true})

// Watch for success message from parent
watch(() => props.successMessage, async (newMessage) => {
    if (newMessage) {
        // Display the success message in the UI
        messages.value.push({
            role: 'assistant',
            content: [{text: `✅ ${newMessage}`}]
        })
    }
}, {immediate: true})

// Watch for initial question from parent
watch(() => props.initialQuestion, async (question) => {
    if (question && !loading.value) {
        // Send the question to the chatbot
        await nextTick()
        // Small delay to ensure the component is fully mounted
        setTimeout(async () => {
            input.value = question
            await sendMessage()
        }, 500)
    }
}, {immediate: true})

function getMessageClass(msg: any) {
    if (msg.role === 'user') {
        return 'bg-primary text-white'
    }
    return 'bg-gray-100'
}

function formatMessage(text: string) {
    // Convert markdown links to clickable HTML links
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-blue-600 hover:text-blue-800">$1</a>')
}

function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'A') {
        e.preventDefault()
        const href = target.getAttribute('href')
        if (href) {
            // Check if it's an internal route
            if (href.startsWith('/')) {
                navigateToPage(href)
            } else {
                window.open(href, '_blank')
            }
        }
    }
}

function navigateToPage(route: string) {
    // Emit navigation event for parent to handle
    emit('navigate', route)
    // Also navigate directly
    navigateTo(route)
}

async function sendMessage() {
    if (!input.value.trim() || loading.value) return
    const userMessage = input.value.trim()
    input.value = ''
    await send(userMessage)
}

async function showHelp() {
    const helpMessage = `I can help you with:

**Create Case**
- Type "help" anytime to see this message
- I'll guide you through complex operations by taking you to the appropriate forms

What would you like to do?`
    
    messages.value.push({
        role: 'assistant',
        content: [{text: helpMessage}]
    })
}

onMounted(() => {
    textInput.value?.inputRef?.focus()
})

// Expose methods for parent components
defineExpose({
    sendMessage,
    showHelp
})
</script>
