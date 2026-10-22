import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoConsumo'

export default {
    namespaced: true,
    state: {
        tiposConsumo: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state)                   { state.loading = true  },
        END_GETTING_DATA(state)               { state.loading = false },
        ADD_TIPOS_CONSUMO(state, data)        { state.tiposConsumo = data },
        ADD_PAGINAS(state, pages)             { state.pages = pages },
        DELETE_TIPOS_CONSUMO(state)           { state.tiposConsumo = [] },
        ERROR(state, error)                   { state.error = error },
    },
    actions: {
        async getListTipoConsumo({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListTipoConsumo`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionTipoConsumo({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_TIPOS_CONSUMO')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionTipoConsumo`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_TIPOS_CONSUMO', res.data.respuesta)
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

        async postMantencionTipoConsumo({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionTipoConsumo`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionTipoConsumo(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionTipoConsumo/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionTipoConsumo(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionTipoConsumo/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading    : state => state.loading,
        tiposConsumo : state => state.tiposConsumo,
        pages        : state => state.pages,
        isError      : state => state.error,
    }
}