import axios from 'axios'

const BASE = process.env.VUE_APP_BASE_URL_API

const API = process.env.VUE_APP_APIGATEWAY_URL

export const sciApi = axios.create({baseURL:  `${BASE}/`})

export const svcApi = axios.create({ baseURL: `${API}/` })

export const authApi = axios.create({ baseURL: `${API}/Autenticacion` })

//configuracion para funcionamiento desde una sola salida
// export const sciApi = axios.create({baseURL:  `${BASE}/sci`})
// export const svcApi = axios.create({ baseURL: `${API}/ext` })
// export const authApi = axios.create({ baseURL: `${API}/ext/Autenticacion` })

const attachToken = (config) => {
    const store = require('@/store').default
    const token = store.state.token
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
}

const handle401 = (error) => {
    if (error.response && error.response.status === 401) {
        const store  = require('@/store').default
        const router = require('@/router').default
        store.dispatch('logout', 'Sesión expirada')
        router.replace({ name: 'login' }).catch(() => {})
    }
    return Promise.reject(error)
}

sciApi.interceptors.request.use(attachToken)
svcApi.interceptors.request.use(attachToken)

sciApi.interceptors.response.use(r => r, handle401)
svcApi.interceptors.response.use(r => r, handle401)
