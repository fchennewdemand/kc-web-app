import {generateClient} from 'aws-amplify/data'
import type {Schema} from '../amplify/data/resource'
import {ref} from 'vue'

export default function () {
    const client = generateClient<Schema>({authMode: 'userPool'})
    const messages = ref<any[]>([])
    const loading = ref(false)
    let chat: any = null
    let currentMessageIndex = -1

    async function start() {
        try {
            const res = await client.conversations.chat.create()
            if (!res.data) {
                throw new Error('Failed to create conversation')
            }
            chat = res.data
            
            chat.onStreamEvent({
                next: (event) => {
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
                    console.error('Stream error:', error)
                    messages.value.push({role: 'assistant', content: [{text: 'Sorry, I encountered an error. Please try again.'}]})
                    loading.value = false
                    currentMessageIndex = -1
                }
            })
        } catch (error) {
            console.error('Failed to create conversation:', error)
            throw error
        }
    }

    async function send(message: string) {
        try {
            if (!chat) {
                await start()
            }
            loading.value = true
            messages.value.push({role: 'user', content: [{text: message}]})
            
            await chat.sendMessage({content: [{text: message}]})
        } catch (error) {
            console.error('Send error:', error)
            messages.value.push({role: 'assistant', content: [{text: `Failed to send message: ${error.message || 'Please try again.'}`}]})
            loading.value = false
        }
    }

    return {messages, send, loading}
}
