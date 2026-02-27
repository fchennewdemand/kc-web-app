import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'

export default defineNuxtPlugin(async () => {
  Amplify.configure(outputs, { ssr: false })

  const nd = useND()
  const appSync = useAppSync()
  const $nd = { ...nd, ...appSync }

  const appConfig = useAppConfig()
  const json = await $nd.lambda({ name: 'init', input: {}, skipBusy: true, skipError: true })
  appConfig.mapKey = json.payload?.mapKey

  return {
    provide: {
      nd: $nd
    }
  }
})
