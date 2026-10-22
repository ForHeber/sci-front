import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoInvestigacion'

export default {
    namespaced: true,
    state: {
        tiposInvestigacion: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state)                        { state.loading = true  },
        END_GETTING_DATA(state)                    { state.loading = false },
        ADD_TIPOS_INVESTIGACION(state, data)       { state.tiposInvestigacion = data },
        ADD_PAGINAS(state, pages)                  { state.pages = pages },
        DELETE_TIPOS_INVESTIGACION(state)          { state.tiposInvestigacion = [] },
        ERROR(state, error)                        { state.error = error },
    },
    actions: {
        async getListTipoInvestigacion({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListTipoInvestigacion`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionTipoInvestigacion({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_TIPOS_INVESTIGACION')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionTipoInvestigacion`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_TIPOS_INVESTIGACION', res.data.respuesta)
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

        async postMantencionTipoInvestigacion({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionTipoInvestigacion`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionTipoInvestigacion(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionTipoInvestigacion/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionTipoInvestigacion(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionTipoInvestigacion/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading          : state => state.loading,
        tiposInvestigacion : state => state.tiposInvestigacion,
        pages              : state => state.pages,
        isError            : state => state.error,
    }
}