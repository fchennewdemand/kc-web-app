import {generateClient} from 'aws-amplify/data'
import type {Schema} from '../amplify/data/resource'
import {ref} from 'vue'

export default function () {
    const client = generateClient<Schema>()
    const messages = ref<any[]>([])
    const loading = ref(false)
    let chat: any = null

    async function start() {
        const res = await client.conversations.chat.create()
        chat = res.data
        let currentMessageIndex = -1
        chat.onStreamEvent({
            next: async (event) => {
                if (event.contentBlockIndex !== undefined && event.text) {
                    if (currentMessageIndex === -1 || messages.value[currentMessageIndex]?.role !== 'assistant') {
                        messages.value.push({role: 'assistant', content: [{text: ''}]})
                        currentMessageIndex = messages.value.length - 1
                    }
                    messages.value[currentMessageIndex].content[0].text += event.text
                }
                if (event.stopReason) {
                    loading.value = false
                    currentMessageIndex = -1
                }
            },
            error: (error) => {
                console.error(error)
                messages.value.push({role: 'assistant', content: [{text: 'Sorry, I encountered an error. Please try again.'}]})
                loading.value = false
                currentMessageIndex = -1
            }
        })
    }

    async function send(message: string) {
        if (!chat) {
            await start()
        }
        loading.value = true
        messages.value.push({role: 'user', content: [{text: message}]})
        await chat.sendMessage({content: [{text: message}]})
    }

    return {messages, send, loading}
}
