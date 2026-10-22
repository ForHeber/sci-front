import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/Finales'

export default {
  namespaced : true,
  state      : {
    informesFinales       : [],
    informesTemporales    : [],
    informesCerrados      : [],
    medidasDisciplinarias : [],
    pages                 : 1,
    loading               : false,
    error                 : false,
  },
  mutations  : {
    GETTING_DATA                 (state)        { state.loading               = true  },
    END_GETTING_DATA             (state)        { state.loading               = false },
    ADD_INFORMES_CERRADOS        (state, data)  { state.informesCerrados      = data  },
    ADD_INFORMES_TEMPORALES      (state, data)  { state.informesTemporales    = data  },
    ADD_INFORMES_FINALES         (state, data)  { state.informesFinales       = data  },
    ADD_MEDIDAS_DISCIPLINARIAS   (state, data)  { state.medidasDisciplinarias = data  },
    ADD_PAGINAS                  (state, pages) { state.pages                 = pages },
    DELETE_INFORMES_CERRADOS     (state)        { state.informesCerrados      = []    },
    DELETE_INFORMES_TEMPORALES   (state)        { state.informesTemporales    = []    },
    DELETE_INFORMES_FINALES     (state)         { state.informesFinales       = []    },
    DELETE_MEDIDAS_DISCIPLINARIAS(state)        { state.medidasDisciplinarias = []    },
    ERROR                        (state, error) { state.error                 = error },
  },
  actions   : {
    async getListInformesFinales({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES_FINALES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesFinales`, {
          params: { page, items, search, unidadId, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES_FINALES', res.data.respuesta)
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
    async getListInformesFinalesCdte({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES_FINALES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesFinalesCdte`, {
          params: { page, items, search, unidadId, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES_FINALES', res.data.respuesta)
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
    async getListInformesFinalesBINTE({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES_FINALES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesFinalesBINTE/${unidadId}`, {
          params: { page, items, search, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES_FINALES', res.data.respuesta)
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
    async getListInformesTemporales({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES_TEMPORALES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesFinalesCierreTemporal`, {
          params: { page, items, search, unidadId, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES_TEMPORALES', res.data.respuesta)
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
    async getListInformesCerrados({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES_CERRADOS')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesFinalesCerrados`, {
          params: { page, items, search, unidadId, tipoEstadoIngresado }
        })
        if (store) {
          commit('ADD_INFORMES_CERRADOS', res.data.respuesta)
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
    async getListMedidasDisciplinariasInformesFinales({ commit }, finalesId) {
      commit('ERROR', false)
      commit('DELETE_MEDIDAS_DISCIPLINARIAS')
      commit('GETTING_DATA')
      try {
        const res = await sciApi.get(`${recurso}/GetListMedidasDisciplinariasInformesFinales/${finalesId}`)
        commit('ADD_MEDIDAS_DISCIPLINARIAS', res.data.medidasAdoptadasConEstado)
        commit('END_GETTING_DATA')
        return res
      } catch (error) {
        commit('ERROR', true)
        commit('END_GETTING_DATA')
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutInformesFinales/${payload.incidentesId },${payload.finalesId}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteInformesFinales({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.delete(`${recurso}/DeleteInformesFinales/${payload.incidentesId },${payload.id}`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putDevolucionInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutDevolucionInformesFinales/${payload.incidentesid },${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putConclusionInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutConclusionInformesFinales/${payload.incidentesid },${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putCierreTemporalInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutCierreTemporalInformesFinales/${payload.incidentesid },${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putRecuperaInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutRecuperaInformesFinales/${payload.incidentesid },${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putCierreInformesFinales(_ctx, { incidentesId, finalesId, medidas }) {
      try {
        return await sciApi.put(`${recurso}/PutCierreInformesFinales/${incidentesId},${finalesId}`, { medidas })
      } catch (error) {
        return error.response
      }
    },
    async putTramiteInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutTramiteInformesFinales/${payload.incidentesid },${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async putMedidasDisciplinariasInformesFinales(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMedidasDisciplinariasInformesFinales/${payload.incidentesId },${payload.finalesId}`, payload)
      } catch (error) {
        return error.response
      }
    },
    async getListMedidasDisciplinariasInformesFinalesEspecificas(_ctx, finalesId) {
      try {
        return await sciApi.get(`${recurso}/GetListMedidasDisciplinariasInformesFinalesEspecificas/${finalesId}`)
      } catch (error) {
        
        return error.response
      }
    }
  },
  getters: {
    isLoading             : state => state.loading,
    informesCerrados      : state => state.informesCerrados,
    informesTemporales    : state => state.informesTemporales,
    informesFinales       : state => state.informesFinales,
    medidasDisciplinarias : state => state.medidasDisciplinarias,
    pages                 : state => state.pages,
    isError               : state => state.error,
  }
}		