import {Amplify} from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import {signIn, fetchAuthSession} from 'aws-amplify/auth';

async function initializeGuestSession() {
    try {
        // Check if already signed in
        const session = await fetchAuthSession()
        if (session.tokens) {
            console.log('Already authenticated')
            return
        }
    } catch (error) {
        console.log('Not authenticated, signing in...')
    }

    try {
        const result = await signIn({username: 'fchen@newdemand.com', password: 'KC@chatbot123!!'});
        console.log('Sign in result:', result)
        
        // Verify authentication
        const session = await fetchAuthSession()
        console.log('Auth session:', session.tokens ? 'Valid' : 'Invalid')
    } catch (error) {
        console.error('Sign in failed:', error)
        throw error
    }
}

export default defineNuxtPlugin(async () => {
    Amplify.configure(outputs, {ssr: false})
    
    try {
        await initializeGuestSession()
    } catch (error) {
        console.error('Failed to initialize auth:', error)
    }

    const nd = useND()
    const appSync = useAppSync()
    const $nd = {...nd, ...appSync}

    const appConfig = useAppConfig()
    const json = await $nd.lambda({name: 'init', input: {}, skipBusy: true, skipError: true})
    appConfig.mapKey = json.payload?.mapKey
    
    return {
        provide: {
            nd: $nd
        }
    }
})
