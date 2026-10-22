import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoIdentificacion'

export default {
  namespaced: true,
  state: {
    tiposIdentificacion : [],
    pages               : 1,
    loading             : false,
    error               : false,
  },
  mutations: {
    GETTING_DATA(state)                   { state.loading             = true  },
    END_GETTING_DATA(state)               { state.loading             = false },
    ADD_TIPOS_IDENTIFICACION(state, data) { state.tiposIdentificacion = data },
    ADD_PAGINAS(state, pages)             { state.pages               = pages },
    DELETE_TIPOS_IDENTIFICACION(state)    { state.tiposIdentificacion = [] },
    ERROR(state, error)                   { state.error               = error },
  },
  actions: {
    async getListTipoIdentificacion({ commit }) {
      commit('GETTING_DATA')
      try {
        return await sciApi.get(`${recurso}/GetListTipoIdentificacion`)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getListMantencionTipoIdentificacion({ commit }, { page = '', items = '', search = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_TIPOS_IDENTIFICACION')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListMantencionTipoIdentificacion`, {
        params: { page, items, search }
        })
        if (store) {
          commit('ADD_TIPOS_IDENTIFICACION', res.data.respuesta)
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

    async postMantencionTipoIdentificacion({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostMantencionTipoIdentificacion`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putMantencionTipoIdentificacion(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMantencionTipoIdentificacion/${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteMantencionTipoIdentificacion(_ctx, payload) {
      try {
        return await sciApi.delete(`${recurso}/DeleteMantencionTipoIdentificacion/${payload.id}`)
      } catch (error) {
        return error.response
      }
    },
  },
  getters: {
    isLoading           : state => state.loading,
    tiposIdentificacion : state => state.tiposIdentificacion,
    pages               : state => state.pages,
    isError             : state => state.error,
  }
}