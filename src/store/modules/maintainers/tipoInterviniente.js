import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoInterviniente'

export default {
    namespaced: true,
    state: {
        tiposIntervinientes: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state)                          { state.loading = true  },
        END_GETTING_DATA(state)                      { state.loading = false },
        ADD_TIPOS_INTERVINIENTES(state, data)        { state.tiposIntervinientes = data },
        ADD_PAGINAS(state, pages)                    { state.pages = pages },
        DELETE_TIPOS_INTERVINIENTES(state)           { state.tiposIntervinientes = [] },
        ERROR(state, error)                          { state.error = error },
    },
    actions: {
        async getListTipoInterviniente({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListTipoInterviniente`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionTipoInterviniente({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_TIPOS_INTERVINIENTES')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionTipoInterviniente`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_TIPOS_INTERVINIENTES', res.data.respuesta)
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

        async postMantencionTipoInterviniente({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionTipoInterviniente`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionTipoInterviniente(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionTipoInterviniente/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionTipoInterviniente(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionTipoInterviniente/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading           : state => state.loading,
        tiposIntervinientes : state => state.tiposIntervinientes,
        pages               : state => state.pages,
        isError             : state => state.error,
    }
}