import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/EstadoSalud'

export default {
    namespaced: true,
    state: {
        estadosSalud: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state)                  { state.loading = true  },
        END_GETTING_DATA(state)              { state.loading = false },
        ADD_ESTADOS_SALUD(state, data)       { state.estadosSalud = data },
        ADD_PAGINAS(state, pages)            { state.pages = pages },
        DELETE_ESTADOS_SALUD(state)          { state.estadosSalud = [] },
        ERROR(state, error)                  { state.error = error },
    },
    actions: {
        async getListEstadoSalud({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListEstadoSalud`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionEstadoSalud({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_ESTADOS_SALUD')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionEstadoSalud`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_ESTADOS_SALUD', res.data.respuesta)
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

        async postMantencionEstadoSalud({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionEstadoSalud`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionEstadoSalud(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionEstadoSalud/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionEstadoSalud(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionEstadoSalud/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading    : state => state.loading,
        estadosSalud : state => state.estadosSalud,
        pages        : state => state.pages,
        isError      : state => state.error,
    }
}