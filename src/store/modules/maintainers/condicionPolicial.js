import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/CondicionPolicial'

export default {
    namespaced: true,
    state: {
        condicionesPoliciales: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state) {
            state.loading = true
        },
        END_GETTING_DATA(state) {
            state.loading = false
        },
        ADD_CONDICIONES_POLICIALES(state, data) {
            state.condicionesPoliciales = data
        },
        ADD_PAGINAS(state, pages) {
            state.pages = pages
        },
        DELETE_CONDICIONES_POLICIALES(state) {
            state.condicionesPoliciales = []
        },
        ERROR(state, error) {
            state.error = error
        },
    },
    actions: {
        async getListCondicionPolicial({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListCondicionPolicial`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionCondicionPolicial({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_CONDICIONES_POLICIALES')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionCondicionPolicial`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_CONDICIONES_POLICIALES', res.data.respuesta)
                    const totalItems = items === '' ? res.data.totalRegistros : parseInt(items)
                    commit('ADD_PAGINAS', Math.ceil(res.data.totalRegistros / totalItems))
                }
                return res
            } catch (error) {
                if (store) commit('ERROR', true)
                if (error.response && error.response.status === 403) {
                    router.push({ name: 'UnAuthorized' })
                }
                return error.response
            } finally {
                if (store) commit('END_GETTING_DATA')
            }
        },

        async postMantencionCondicionPolicial({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionCondicionPolicial`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionCondicionPolicial(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionCondicionPolicial/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionCondicionPolicial(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionCondicionPolicial/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading             : state => state.loading,
        condicionesPoliciales : state => state.condicionesPoliciales,
        pages                 : state => state.pages,
        isError               : state => state.error,
    }
}