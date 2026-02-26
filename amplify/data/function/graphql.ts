import {env} from '$amplify/env/graphql'
import {Schema} from '../resource'
import axios from 'axios'
import {assign, isFunction} from 'lodash'

interface MethodProps {
    endpoint?: string,
    method?: string,
    uri?: string,
    apiType?: string,
    body?: any,
    uriParams?: any
}

const appUrl = env.APP_URL
const appKey = env.API_KEY
const options = {headers: {Authorization: `ApiKey ${appKey}`}}
const endpoints = new Map<String, MethodProps>()
endpoints.set("viewFile", {endpoint: 'v1/connector/file/download'})
endpoints.set("cacheFiles", {endpoint: 'v1/connector/file/cache'})
endpoints.set("viewCase", {endpoint: 'v1/connector/record/render'})

export const handler: Schema["query"]["functionHandler"] = async (event, context) => {
    console.log(`input: ${JSON.stringify(event)}`)
    let input = JSON.parse(event.arguments.input || '{}')
    let req: MethodProps = {}
    let endpoint = `${appUrl}/v1/connector/execute`
    if (!!input.name) {
        let params: MethodProps = endpoints.get(input.name) || {}
        req.method = params.method || 'POST'
        req.apiType = params.apiType || 'Apex'
        req.body = input.variables || {}
        assign(req.body, params.body || {})
        if (isFunction(params.uri)) {
            req.uri = params.uri(req.body)
        } else {
            req.uri = params.uri || ('services/call/CaseApp/' + (params.method || input.name))
        }
        if (params.endpoint) {
            endpoint = `${appUrl}/${params.endpoint}`
            req = req.body
        }
    }
    try {
        console.log(`sending request ${JSON.stringify(req)} to endpoint ${endpoint}`)
        let res = await axios.post(endpoint, req, options);
        console.log(`response from calling ${endpoint} -> ${JSON.stringify(res.data)}`);
        return JSON.stringify(res.data)
    } catch (e) {
        console.error(e)
        const msg = (e as Error).message
        return JSON.stringify({success: false, message: msg})
    }

}
