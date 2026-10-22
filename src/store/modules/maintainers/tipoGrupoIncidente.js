import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoGrupoIncidente'

export default {
  namespaced: true,
  state: {
    tiposGruposIncidentes : [],
    pages                 : 1,
    loading               : false,
    error          : false,
  },
  mutations: {
    GETTING_DATA(state)                      { state.loading               = true  },
    END_GETTING_DATA(state)                  { state.loading               = false },
    ADD_TIPOS_GRUPOS_INCIDENTES(state, data) { state.tiposGruposIncidentes = data },
    ADD_PAGINAS(state, pages)                { state.pages                 = pages },
    DELETE_TIPOS_GRUPOS_INCIDENTES(state)    { state.tiposGruposIncidentes = [] },
    ERROR(state, error)                      { state.error                 = error },
  },
  actions: {
    async getListTipoGrupoIncidente({ commit }) {
      commit('GETTING_DATA')
      try {
        return await sciApi.get(`${recurso}/GetListTipoGrupoIncidente`)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getListMantencionTipoGrupoIncidente({ commit }, { page = '', items = '', search = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_TIPOS_GRUPOS_INCIDENTES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListMantencionTipoGrupoIncidente`, {
          params: { page, items, search }
        })
        if (store) {
          commit('ADD_TIPOS_GRUPOS_INCIDENTES', res.data.respuesta)
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

    async postMantencionTipoGrupoIncidente({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostMantencionTipoGrupoIncidente`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putMantencionTipoGrupoIncidente(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMantencionTipoGrupoIncidente/${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteMantencionTipoGrupoIncidente(_ctx, payload) {
      try {
        return await sciApi.delete(`${recurso}/DeleteMantencionTipoGrupoIncidente/${payload.id}`)
      } catch (error) {
        return error.response
      }
    },
  },
  getters: {
    isLoading             : state => state.loading,
    tiposGruposIncidentes : state => state.tiposGruposIncidentes,
    pages                 : state => state.pages,
    isError               : state => state.error,
  }
}