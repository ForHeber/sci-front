import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/RegistroEventos'

export default {
  namespaced : true,
  state      : {
    registros : [],
    loading   : false,
    error     : false,
  },
  mutations  : {
    GETTING_DATA     (state)        { state.loading   = true  },
    END_GETTING_DATA (state)        { state.loading   = false },
    ADD_REGISTROS    (state, data)  { state.registros = data  },
    DELETE_REGISTROS (state)        { state.registros = []    },
    ERROR            (state, error) { state.error     = error },
  },
  actions   : {
    async getListRegistrosEventosInformesPreliminares({ commit }, preliminaresId) {
      commit('ERROR', false)
      commit('DELETE_REGISTROS')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListRegistrosEventosInformesPreliminares/${preliminaresId}`)
        commit('ADD_REGISTROS', res.data.respuesta)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    async getListRegistrosEventosInformesIncidentes({ commit }, incidentesId) {
      commit('ERROR', false)
      commit('DELETE_REGISTROS')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListRegistrosEventosInformesIncidentes/${incidentesId}`)
        commit('ADD_REGISTROS', res.data.respuesta)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    async getListRegistrosEventosInformesFinales({ commit }, finalesId) {
      commit('ERROR', false)
      commit('DELETE_REGISTROS')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListRegistrosEventosInformesFinales/${finalesId}`)
        commit('ADD_REGISTROS', res.data.respuesta)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    async getListDetalleRegistrosEventosInformes({ commit }, { tipoInforme, tipoInformeId, tipoAntecedente, concepto }) {
      commit('ERROR', false)
      commit('DELETE_REGISTROS')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListDetalleRegistrosEventosInformes/${tipoInforme},${tipoInformeId},${tipoAntecedente},${concepto}`)
        commit('ADD_REGISTROS', res.data.respuesta)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    
  },
  getters: {
    isLoading : state => state.loading,
    registros : state => state.registros,
    isError   : state => state.error,
  }
}		