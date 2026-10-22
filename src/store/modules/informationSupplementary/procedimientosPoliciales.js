import { sciApi } from '@/services/http'

const recurso = '/ProcedimientosPoliciales'

export default {
  namespaced : true,
  state      : {
    procedimientosPoliciales : [],
    pages                    : 1,
    loading                  : false,
    error                    : false,
  },
  mutations  : {
    GETTING_DATA(state)                        { state.loading                  = true  },
    END_GETTING_DATA(state)                    { state.loading                  = false },
    ADD_PROCEDIMIENTOS_POLICIALES(state, data) { state.procedimientosPoliciales = data  },
    ADD_PAGINAS(state, pages)                  { state.pages                    = pages },
    DELETE_PROCEDIMIENTOS_POLICIALES(state)    { state.procedimientosPoliciales = []    },
    ERROR(state, error)                        { state.error                    = error },
  },
  actions    : {
/*
  👉
      • getListProcedimientosPolicialesPreliminares :	Obtiene la lista de procedimientos policiales preliminares desde el endpoint
                                                      /ProcedimientosPoliciales/GetListProcedimientosPolicialesPre/{informesId} y 
                                                      actualiza el estado del store con los datos obtenidos.
      • postProcedimientosPolicialesPreliminares    :	Envía una solicitud POST al endpoint /ProcedimientosPoliciales/PostProcedimientosPolicialesPre 
                                                      para crear un nuevo procedimiento policial preliminar.
      • putProcedimientosPolicialesPreliminares     :	Envía una solicitud PUT al endpoint /ProcedimientosPoliciales/PutProcedimientosPolicialesPre/{informesId},{id} 
                                                      para actualizar un procedimiento policial preliminar existente.
      • deleteProcedimientosPolicialesPreliminares  :	Envía una solicitud DELETE al endpoint /ProcedimientosPoliciales/DeleteProcedimientosPolicialesPre/{informesId},{id} 
                                                      para eliminar un procedimiento policial preliminar existente.
      • getListProcedimientosPolicialesIncidentes   :	Obtiene la lista de procedimientos policiales incidentes desde el endpoint
                                                      /ProcedimientosPoliciales/GetListProcedimientosPolicialesInc/{informesId} y
                                                      actualiza el estado del store con los datos obtenidos.
      • postProcedimientosPolicialesIncidentes      :	Envía una solicitud POST al endpoint /ProcedimientosPoliciales/PostProcedimientosPolicialesInc
                                                      para crear un nuevo procedimiento policial incidente.
      • putProcedimientosPolicialesIncidentes       :	Envía una solicitud PUT al endpoint /ProcedimientosPoliciales/PutProcedimientosPolicialesInc/{informesId},{id}
                                                      para actualizar un procedimiento policial incidente existente.
      • deleteProcedimientosPolicialesIncidentes    :	Envía una solicitud DELETE al endpoint /ProcedimientosPoliciales/DeleteProcedimientosPolicialesInc/{informesId},{id}
                                                      para eliminar un procedimiento policial incidente existente.
      • getListProcedimientosPolicialesFinales   		:	Obtiene la lista de procedimientos policiales finales desde el endpoint
                                                      /ProcedimientosPoliciales/GetListProcedimientosPolicialesFin/{informesId} y
                                                      actualiza el estado del store con los datos obtenidos.
      • postProcedimientosPolicialesFinales      		:	Envía una solicitud POST al endpoint /ProcedimientosPoliciales/PostProcedimientosPolicialesFin
                                                      para crear un nuevo procedimiento policial final.
      • putProcedimientosPolicialesFinales       		:	Envía una solicitud PUT al endpoint /ProcedimientosPoliciales/PutProcedimientosPolicialesFin/{informesId},{id}
                                                      para actualizar un procedimiento policial final existente.
      • deleteProcedimientosPolicialesFinales    		:	Envía una solicitud DELETE al endpoint /ProcedimientosPoliciales/DeleteProcedimientosPolicialesFin/{informesId},{id}
                                                      para eliminar un procedimiento policial final existente.

*/    
    async getListProcedimientosPolicialesPreliminares({ commit }, informesId) {
      commit('ERROR', false)
      commit('DELETE_PROCEDIMIENTOS_POLICIALES')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListProcedimientosPolicialesPre/${informesId}`)
        commit('ADD_PROCEDIMIENTOS_POLICIALES', res.data.respuesta)
        commit('ADD_PAGINAS', 1)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async postProcedimientosPolicialesPreliminares({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostProcedimientosPolicialesPre`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putProcedimientosPolicialesPreliminares({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.put(
        `${recurso}/PutProcedimientosPolicialesPre/${payload.PRELIMINARESID},${payload.id}`,
        payload
        )
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async deleteProcedimientosPolicialesPreliminares({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.delete(
          `${recurso}/DeleteProcedimientosPolicialesPre/${payload.preliminaresid},${payload.id}`
        )
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
    async getListProcedimientosPolicialesIncidentes({ commit }, informesId) {
      commit('ERROR', false)
      commit('DELETE_PROCEDIMIENTOS_POLICIALES')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListProcedimientosPolicialesInc/${informesId}`)
        commit('ADD_PROCEDIMIENTOS_POLICIALES', res.data.respuesta)
        commit('ADD_PAGINAS', 1)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async postProcedimientosPolicialesIncidentes({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostProcedimientosPolicialesInc`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putProcedimientosPolicialesIncidentes({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.put(
        `${recurso}/PutProcedimientosPolicialesInc/${payload.incidentesid},${payload.id}`,
        payload
        )
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async deleteProcedimientosPolicialesIncidentes({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.delete(
          `${recurso}/DeleteProcedimientosPolicialesInc/${payload.incidentesid},${payload.id}`
        )
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getListProcedimientosPolicialesFinales({ commit }, finalesId) {
      commit('ERROR', false)
      commit('DELETE_PROCEDIMIENTOS_POLICIALES')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListProcedimientosPolicialesFin/${finalesId}`)
        commit('ADD_PROCEDIMIENTOS_POLICIALES', res.data.respuesta)
        commit('ADD_PAGINAS', 1)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async postProcedimientosPolicialesFinales({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostProcedimientosPolicialesFin`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putProcedimientosPolicialesFinales({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.put(
        `${recurso}/PutProcedimientosPolicialesFin/${payload.finalesid},${payload.id}`,
        payload
        )
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async deleteProcedimientosPolicialesFinales({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.delete(
          `${recurso}/DeleteProcedimientosPolicialesFin/${payload.finalesid},${payload.id}`
        )
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },
  },
  getters    : {
    isLoading                : state => state.loading,
    procedimientosPoliciales : state => state.procedimientosPoliciales,
    pages                    : state => state.pages,
    isError                  : state => state.error,
  }
}