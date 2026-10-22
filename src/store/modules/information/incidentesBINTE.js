import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/Binte'

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
        • getListInformesBinte       :	Obtiene la lista de informes de incidentes desde el endpoint /Binte/GetListInformesBinte y
                                        actualiza el estado del store con los datos obtenidos. Permite paginación y búsqueda.
                                        actualizar la resolución de un informe de incidente existente.                              
*/  
    async getListInformesBinte({ commit }, { page = '', items = '', search = '', unidadId = '', tipoEstadoIngresado = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_INFORMES')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListInformesBinte`, {
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

  },
  getters: {
    isLoading : state => state.loading,
    informes  : state => state.informes,
    pages     : state => state.pages,
    isError   : state => state.error,
  }
}