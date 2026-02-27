import {isObject} from 'lodash';
import {generateClient} from 'aws-amplify/data'
import type {Schema} from '../amplify/data/resource'

interface LambdaOptions {
    name: string;
    input?: object;
    skipBusy?: boolean;
    skipError?: boolean;
    busyText?: string;
}

interface AppSync {
    lambda(options: LambdaOptions | string, input?: object, mutate?: boolean): Promise<any>;

    upload(file: File, option: object): Promise<any>

}


export default function (): AppSync {
    const client = generateClient<Schema>()
    return {
        async lambda(nameOrOptions: LambdaOptions | string, input: object = {}): Promise<any> {
            // Initialize default values
            const options: LambdaOptions = isObject(nameOrOptions) ? nameOrOptions as LambdaOptions : {name: nameOrOptions as string, input, skipBusy: false};
            const $nd = useND()
            if (!options.skipBusy) {
                $nd.showBusy(options.busyText);
            }
            try {
                const authMode = 'iam';
                const jsonInput = JSON.stringify({name: options.name, variables: {...options.input}});
                let rs = await client.queries.query({input: jsonInput}, {authMode: authMode})
                if (rs.errors && rs.errors.length > 0) {
                    const message = rs.errors.map((c: any) => c.message).join('\n');
                    if (!options.skipError) {
                        await $nd.alert('System Error', message)
                    }
                    return Promise.reject({success: false, message: message})
                } else {
                    const json = JSON.parse(rs.data || '{}');
                    if (json.success) {
                        return json
                    } else {
                        if (!options.skipError) {
                            await $nd.alert(json.title || 'System Error', json.message)
                        }
                        return Promise.reject(json)
                    }

                }
            } catch (error) {
                console.error(error, 'failed to call appsync')
                const message = JSON.stringify(error)
                if (!options.skipError) {
                    await $nd.alert('System Error', 'An error occurred while calling server')
                }
                return Promise.reject(error)
            } finally {
                if (!options.skipBusy) {
                    $nd.hideBusy()
                }
            }
        },
        async upload(file: File, option: object) {
            //limit default to 25M
            const $nd = useND()
            let appConfig: Record<string, any> = useAppConfig().nd || {}
            let config = Object.assign(appConfig.upload || {limit: 25000000}, option)
            let max = config.limit
            if (file) {
                if (file.size > max) {
                    await $nd.alert('File too Large', `Maximum allowed size is ${$nd.fileSize(max)} but your file is ${$nd.fileSize(file.size)}`)
                    throw new Error('File too large')
                } else {
                    $nd.showBusy(`Uploading ${file.name}...`)
                    try {
                        let fileInput = Object.assign({name: file.name, type: file.type, size: file.size}, option || {})
                        let json = await this.lambda({name: `requestUpload`, skipBusy: true, input: fileInput})
                        await $fetch(json.payload.url, {method: 'PUT', body: file, headers: {'Content-Type': file.type}})
                        return await this.lambda({name: `finishUpload`, skipBusy: true, input: json.payload})
                    } catch (e) {
                        throw e
                    } finally {
                        $nd.hideBusy()
                    }
                }
            }
        }

    } as AppSync
}
