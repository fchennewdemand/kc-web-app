import {isObject} from 'lodash'
import Emitter, {type Handler} from 'mitt'
import {Busy, Dialog, ModalWrapper} from '#components'

const bus = Emitter()
let acls: any[] = []
let appLoaded = false
const busyInstance = useOverlay().create(Busy, {})
let busyHidden = true

const createBlob = function (encoded: string, fileType: string) {
    const sliceSize = 512
    const decoded = window.atob(encoded)
    let byteArrays = []
    for (let offset = 0; offset < decoded.length; offset += sliceSize) {
        const slice = decoded.slice(offset, offset + sliceSize)
        const byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
        }
        let byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
    }
    return new Blob(byteArrays, {type: fileType || 'text/html'})
}
const createDialog = async function (props: object) {
    const modal = useOverlay()
    const instance = modal.create(Dialog, {defaultOpen: true, props: props, destroyOnClose: true})
    const opened = instance.open()
    return await opened.result
}

export interface ND {

    sandbox: boolean

    home(): void

    blur(): void

    focus(selector: string): void

    scrollTo(x: number, y: number): void

    subscribe(channel: string, handler: Handler, manualDestroy?: boolean): void

    publish(channel: string, data: any): void

    unsubscribe(channle: string, handler: Handler): void

    showBusy(params?: string | object): void

    hideBusy(): void

    alert(title: string, message: string, options?: object): Promise<any>

    confirm(title: string, message: string, options?: object): Promise<any>

    message(title: string, message: string, options?: object): Promise<any>

    notify(title: string, message: string, options?: object): Promise<any>

    modal(component: Component, props?: object): Promise<any>

    id(obj: string | Record<string, any>, idValue?: string): string | undefined

    refresh(): void

    viewFile(encoded: string, fileType: string): void

    fileSize(num: number): string

}

const nd: ND = {
    id(obj: string | Record<string, any>, idVal?: string): string | undefined {
        if (typeof obj === "string") {
            return obj as string
        } else {
            const o = obj as Record<string, any>
            if (!!o) {
                if (!!idVal) {
                    if (o.id) {
                        o.id = idVal
                    } else {
                        o.Id = idVal
                    }
                }
                return o.id || o.Id || obj
            } else {
                return undefined;
            }

        }
    },
    get sandbox() {
        let stage = process.env.stage || ''
        return stage.indexOf('prod') === -1
    },
    home() {
        window.location.replace('/')
    },
    blur() {
        try {
            let el = document.querySelector(':focus');
            if (el && el instanceof HTMLElement && typeof el.blur === 'function') {
                el.blur()
            }
        } catch (e) {
        }
    },
    focus(selector?: string) {
        let el = !!selector ? document.querySelector(selector) : document.activeElement
        if (el && el instanceof HTMLElement && typeof el.focus === 'function') {
            el.focus()
        }
    },
    scrollTo(x, y) {
        window.scrollTo(x, y)
    },
    subscribe(channel, handler: Handler, manualDestroy: boolean = false): void {
        if (manualDestroy) {
            bus.on(channel, handler)
        } else {
            onMounted(() => {
                bus.on(channel, handler);
            })
            onUnmounted(() => {
                bus.off(channel, handler);
            })
        }
    },
    publish(channel, data) {
        bus.emit(channel, data)
    },
    unsubscribe(channel: string, handler: Handler) {
        bus.off(channel, handler)
    },
    showBusy(params) {
        let busyOption = isObject(params) ? params : {message: params}
        busyHidden = false
        busyInstance.open(busyOption)
    },
    hideBusy() {
        busyHidden = true
        setTimeout(() => {
            if (busyHidden) {
                busyInstance.close()
            }
        }, 100)
    },
    async alert(title, message, options = {}) {
        if (appLoaded) {
            let input = {title: title, message: message, color: 'error', persistent: true, actions: [{label: 'Close', color: 'neutral'}], ...options};
            return await createDialog(input)
        } else {
            window.alert(message)
            return Promise.resolve()
        }
    },
    async confirm(title, message, options = {}) {
        const actions = [{label: 'OK', color: 'primary', value: true, cls: 'w-16'}, {label: 'Cancel', color: 'neutral', value: false, cls: 'w-16'}]
        let input = {title: title, message: message, color: 'warning', actions: actions, ...options};
        return await createDialog(input)
    },
    async message(title, message, options = {}) {
        let input = {title: title, message: message, color: 'info', actions: [{label: 'Close', color: 'neutral'}], ...options};
        return await createDialog(input)
    },
    async modal(modalClass, props) {
        const modal = useOverlay()
        const instance = modal.create(ModalWrapper, {defaultOpen: true, props: { ...props, comp: markRaw(modalClass) }, destroyOnClose: true})
        const opened = instance.open()
        return await opened.result
    },
    async notify(title, message, options: Record<string, any> = {}) {
        const toast = useToast()
        const opts = Object.assign({title: title, description: message}, options)
        if (opts.type) {
            opts.color = opts.type
            delete opts.type
        }
        toast.add(opts)
    },
    viewFile(encoded, fileType) {
        const blob = createBlob(encoded, fileType)
        const doc = URL.createObjectURL(blob)
        window.open(doc, '_blank')
    },
    fileSize(num: number) {
        const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
        let result: number = num / Math.pow(1000, exponent)
        const size = result.toFixed(2)
        const unit = units[exponent]
        return `${size} ${unit}`
    },
    refresh() {
        useRouter().go(0)
    }
}
export default function (): ND {
    return nd
}
