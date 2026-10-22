import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/Preliminares'

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
        • getListInformesPreliminares         : Obtiene la lista de informes preliminares desde el endpoint /Preliminares/GetListInformesPreliminares
                                                y actualiza el estado del store con los datos obtenidos.
        • getListInformesPreliminaresBINTE    : Obtiene la lista de informes preliminares desde el endpoint /Preliminares/GetListInformesPreliminaresBINTE
                                                y actualiza el estado del store con los datos obtenidos.
        • postInformesPreliminares            : Envía una solicitud POST al endpoint /Preliminares/PostInformesPreliminares para crear un nuevo 
                                                informe preliminar. 
        • putInformesPreliminares             : Envía una solicitud PUT al endpoint /Preliminares/PutInformesPreliminares/{informesId} para 
                                                actualizar un informe preliminar existente.
        • putPublicarInformesPreliminares     : Envía una solicitud PUT al endpoint /Preliminares/PutPublicarInformesPreliminares/{informesId} 
                                                para publicar un informe preliminar existente.
        • deleteInformesPreliminares          : Envía una solicitud DELETE al endpoint /Preliminares/DeleteInformesPreliminares/{informesId} 
                                                para eliminar un informe preliminar existente.
        • getGeneracionDeBoletinInstitucional : Obtiene la información para la generación del boletín institucional desde el endpoint 
                                                /Preliminares/GetGeneracionDeBoletinInstitucional y actualiza el estado del store con los datos obtenidos.
        • putEntregaDeTurnoPME                : Envía una solicitud PUT al endpoint /Preliminares/PutEntregaDeTurnoPME para realizar la entrega de turno 
                                                del PME.
*/
    async getListInformesPreliminares({ commit }, { page = '', items = '', search = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesPreliminares`, {
          params: { page, items, search }
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
    async getListInformesPreliminaresBINTE({ commit }, { page = '', items = '', search = '', unidadId = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesPreliminaresBINTE/${unidadId}`, {
          params: { page, items, search}
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
    async postInformesPreliminares({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostInformesPreliminares`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putInformesPreliminares(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutInformesPreliminares/${payload.informesid}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async putPublicarInformesPreliminares(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutPublicarInformesPreliminares/${payload.informesid}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteInformesPreliminares({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.delete(`${recurso}/DeleteInformesPreliminares/${payload.id}`)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getGeneracionDeBoletinInstitucional({ commit }) {
      commit('ERROR', false)
      commit('DELETE_INFORMES')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetGeneracionDeBoletinInstitucional`)
        commit('ADD_INFORMES', res.data)
        commit('ADD_PAGINAS', 1)
        return res
      } catch (error) {
        commit('ERROR', true)
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },    

    async putEntregaDeTurnoPME() {
      try {
        return await sciApi.put(`${recurso}/PutEntregaDeTurnoPME`, null)
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