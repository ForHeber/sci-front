import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/IndicesAlertas'

export default {
  namespaced: true,
  state: {
    indicesAlertas : [],
    pages          : 1,
    loading        : false,
    error          : false,
  },
  mutations: {
    GETTING_DATA(state)              { state.loading        = true  },
    END_GETTING_DATA(state)          { state.loading        = false },
    ADD_INDICES_ALERTAS(state, data) { state.indicesAlertas = data },
    ADD_PAGINAS(state, pages)        { state.pages          = pages },
    DELETE_INDICES_ALERTAS(state)    { state.indicesAlertas = [] },
    ERROR(state, error)              { state.error          = error },
  },
  actions: {

    async getListMantencionIndicesAlertas({ commit }) {
      commit('ERROR', false)
      commit('DELETE_INDICES_ALERTAS')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListMantencionIndicesAlertas`)
        commit('ADD_INDICES_ALERTAS', res.data.indicesAlerta)
        return res
      } catch (error) {
        commit('ERROR', true)
        if (error.response && error.response.status === 403) {
          router.push({ name: 'UnAuthorized' })
        }
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putMantencionIndiceAlerta(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMantencionIndiceAlerta/${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async getListPreliminaresConAlertas( {commit} ) {
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListPreliminaresConAlertas`)
        return res
      } catch (error) {
        commit('ERROR', true)
        if (error.response && error.response.status === 403) {
          router.push({ name: 'UnAuthorized' })
        }
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getListIncidentesConAlertas( {commit} ) {
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListIncidentesConAlertas`)
        return res
      } catch (error) {
        commit('ERROR', true)
        if (error.response && error.response.status === 403) {
          router.push({ name: 'UnAuthorized' })
        }
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    async getListFinalesConAlertas( {commit} ) {
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListFinalesConAlertas`)
        return res
      } catch (error) {
        commit('ERROR', true)
        if (error.response && error.response.status === 403) {
          router.push({ name: 'UnAuthorized' })
        }
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    }
    
  },
  getters: {
    isLoading      : state => state.loading,
    indicesAlertas : state => state.indicesAlertas,
    pages          : state => state.pages,
    isError        : state => state.error,
  }
}