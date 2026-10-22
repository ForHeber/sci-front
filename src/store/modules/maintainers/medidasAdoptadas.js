import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/MedidasAdoptadas'

export default {
  namespaced: true,
  state: {
    medidasAdoptadas : [],
    pages            : 1,
    loading          : false,
    error            : false,
  },
  mutations: {
    GETTING_DATA(state)                  { state.loading = true  },
    END_GETTING_DATA(state)              { state.loading = false },
    ADD_MEDIDAS_ADOPTADAS(state, data)   { state.medidasAdoptadas = data },
    ADD_PAGINAS(state, pages)            { state.pages = pages },
    DELETE_MEDIDAS_ADOPTADAS(state)      { state.medidasAdoptadas = [] },
    ERROR(state, error)                  { state.error = error },
  },
  actions: {
    async getListMedidasAdoptadas({ commit }) {
      commit('GETTING_DATA')
      try {
        return await sciApi.get(`${recurso}/GetListMedidasAdoptadas`)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getListMantencionMedidasAdoptadas({ commit }, { page = '', items = '', search = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_MEDIDAS_ADOPTADAS')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListMantencionMedidasAdoptadas`, {
          params: { page, items, search }
        })
        if (store) {
          commit('ADD_MEDIDAS_ADOPTADAS', res.data.respuesta)
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

    async postMantencionMedidasAdoptadas({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostMantencionMedidasAdoptadas`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putMantencionMedidasAdoptadas(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMantencionMedidasAdoptadas/${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteMantencionMedidasAdoptadas(_ctx, payload) {
      try {
        return await sciApi.delete(`${recurso}/DeleteMantencionMedidasAdoptadas/${payload.id}`)
      } catch (error) {
        return error.response
      }
    },
  },
  getters: {
    isLoading        : state => state.loading,
    medidasAdoptadas : state => state.medidasAdoptadas,
    pages            : state => state.pages,
    isError          : state => state.error,
  }
}