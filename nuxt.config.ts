export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    css: ['~/assets/app.css'],
    modules: ['@nuxt/ui'],
    ssr: false,
    runtimeConfig: {
        public: {
            googleMapsKey: 'AIzaSyCwyvse6Ef9oLAIN4m6g3hJAqmMlsIiZRg'
        }
    }
})
