import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoIncidente'

export default {
    namespaced: true,
    state: {
        tiposIncidentes: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state)                      { state.loading = true  },
        END_GETTING_DATA(state)                  { state.loading = false },
        ADD_TIPOS_INCIDENTES(state, data)        { state.tiposIncidentes = data },
        ADD_PAGINAS(state, pages)                { state.pages = pages },
        DELETE_TIPOS_INCIDENTES(state)           { state.tiposIncidentes = [] },
        ERROR(state, error)                      { state.error = error },
    },
    actions: {
        async getListTipoIncidente({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListTipoIncidente`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionTipoIncidente({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_TIPOS_INCIDENTES')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionTipoIncidente`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_TIPOS_INCIDENTES', res.data.respuesta)
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

        async postMantencionTipoIncidente({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionTipoIncidente`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionTipoIncidente(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionTipoIncidente/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionTipoIncidente(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionTipoIncidente/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading       : state => state.loading,
        tiposIncidentes : state => state.tiposIncidentes,
        pages           : state => state.pages,
        isError         : state => state.error,
    }
}