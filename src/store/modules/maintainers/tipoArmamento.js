import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoArmamento'

export default {
    namespaced: true,
    state: {
        tiposArmamentos: [],
        pages   : 1,
        loading : false,
        error   : false,
    },
    mutations: {
        GETTING_DATA(state)                      { state.loading = true  },
        END_GETTING_DATA(state)                  { state.loading = false },
        ADD_TIPOS_ARMAMENTOS(state, data)        { state.tiposArmamentos = data },
        ADD_PAGINAS(state, pages)                { state.pages = pages },
        DELETE_TIPOS_ARMAMENTOS(state)           { state.tiposArmamentos = [] },
        ERROR(state, error)                      { state.error = error },
    },
    actions: {
        async getListTipoArmamento({ commit }) {
            commit('GETTING_DATA')
            try {
                return await sciApi.get(`${recurso}/GetListTipoArmamento`)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async getListMantencionTipoArmamento({ commit }, { page = '', items = '', search = '', store = true } = {}) {
            if (store) {
                commit('ERROR', false)
                commit('DELETE_TIPOS_ARMAMENTOS')
                commit('GETTING_DATA')
            }
            try {
                const res = await sciApi.get(`${recurso}/GetListMantencionTipoArmamento`, {
                    params: { page, items, search }
                })
                if (store) {
                    commit('ADD_TIPOS_ARMAMENTOS', res.data.respuesta)
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

        async postMantencionTipoArmamento({ commit }, payload) {
            commit('GETTING_DATA')
            try {
                return await sciApi.post(`${recurso}/PostMantencionTipoArmamento`, payload)
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        async putMantencionTipoArmamento(_ctx, payload) {
            try {
                return await sciApi.put(`${recurso}/PutMantencionTipoArmamento/${payload.id}`, payload)
            } catch (error) {
                return error.response
            }
        },

        async deleteMantencionTipoArmamento(_ctx, payload) {
            try {
                return await sciApi.delete(`${recurso}/DeleteMantencionTipoArmamento/${payload.id}`)
            } catch (error) {
                return error.response
            }
        },
    },
    getters: {
        isLoading       : state => state.loading,
        tiposArmamentos : state => state.tiposArmamentos,
        pages           : state => state.pages,
        isError         : state => state.error,
    }
}