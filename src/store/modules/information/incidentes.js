import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/Incidentes'

export default {
  namespaced : true,
  state      : {
    informes : [],
    pages    : 1,
    loading  : false,
    error    : false,
  },
  mutations  : {
    GETTING_DATA    (state)        { state.loading  = true  },
    END_GETTING_DATA(state)        { state.loading  = false },
    ADD_INFORMES    (state, data)  { state.informes = data },
    ADD_PAGINAS     (state, pages) { state.pages    = pages },
    DELETE_INFORMES (state)        { state.informes = [] },
    ERROR           (state, error) { state.error    = error },
  },
  actions   : {
/*
    👉
        • getListInformesIncidentes       :	Obtiene la lista de informes de incidentes desde el endpoint /Incidentes/GetListInformesIncidentes y
                                            actualiza el estado del store con los datos obtenidos. Permite paginación y búsqueda.
        • getListInformesIncidentesCdte   :	Obtiene la lista de informes de incidentes desde el endpoint /Incidentes/GetListInformesIncidentesCdte y
                                            actualiza el estado del store con los datos obtenidos. Permite paginación y búsqueda.

        • putInformesIncidentes           :	Envía una solicitud PUT al endpoint /Incidentes/PutInformesIncidentes/{preliminaresid}/{informesid} para    
                                            actualizar un informe de incidente existente.
        • deleteInformesIncidentes        :	Envía una solicitud DELETE al endpoint /Incidentes/DeleteInformesIncidentes/{preliminaresid}/{informesid} para 
                                            eliminar un informe de incidente existente.
        • putResolucionInformesIncidentes : Envía una solicitud PUT al endpoint /Incidentes/PutResolucionInformesIncidentes/{preliminaresid}/{informesid} para
                                            actualizar la resolución de un informe de incidente existente.                              
*/  
    async getListInformesIncidentes({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesIncidentes`, {
          params: { page, items, search, unidadId, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES', res.data.respuesta)
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
    async getListInformesIncidentesBINTE({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesIncidentesBINTE/${unidadId}`, {
          params: { page, items, search, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES', res.data.respuesta)
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
    async getListInformesIncidentesCdte({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesIncidentesCdte`, {
          params: { page, items, search, unidadId, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES', res.data.respuesta)
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

    async putInformesIncidentes(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutInformesIncidentes/${payload.preliminaresId },${payload.incidentesId}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteInformesIncidentes({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.delete(`${recurso}/DeleteInformesIncidentes/${payload.preliminaresid },${payload.id}`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    async putTramiteInformesIncidentes(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutTramiteInformesIncidentes/${payload.preliminaresId },${payload.incidentesId}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putMedidasDisciplinariasInformesIncidentes(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMedidasDisciplinariasInformesIncidentes/${payload.preliminaresId },${payload.incidentesId}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putDevolucionInformesIncidentes(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutDevolucionInformesIncidentes/${payload.preliminaresId },${payload.incidentesId}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putCreaInformeFinal(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutCreaInformeFinal/${payload.preliminaresId },${payload.incidentesId}`, payload)
      } catch (error) {
        return error.response
      }
    },
  },
  getters: {
    isLoading : state => state.loading,
    informes  : state => state.informes,
    pages     : state => state.pages,
    isError   : state => state.error,
  }
}