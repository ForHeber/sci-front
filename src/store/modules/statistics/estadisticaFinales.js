import { sciApi } from '@/services/http'

const recurso = '/EstadisticasFinales'

// Helper: ejecuta un GET y opcionalmente actualiza el estado del módulo
async function fetchEstadisticas({ commit }, endpoint, store) {
  if (store) {
    commit('ERROR', false)
    commit('DELETE_ESTADISTICAS')
    commit('GETTING_DATA')
  }
  try {
    const res = await sciApi.get(endpoint)
    if (store) {
      commit('ADD_ESTADISTICAS', res.data)
      commit('ADD_PAGINAS', 1)
    }
    return res
  } catch (error) {
    if (store) commit('ERROR', true)
    return error.response
  } finally {
    if (store) commit('END_GETTING_DATA')
  }
}

export default {
  namespaced : true,
  state      : {
    estadisticas : [],
    pages        : 1,
    loading      : false,
    error   : false,
  },
  mutations  : {
    GETTING_DATA(state)             { state.loading      = true  },
    END_GETTING_DATA(state)         { state.loading      = false },
    ADD_ESTADISTICAS(state, data)   { state.estadisticas = data },
    ADD_PAGINAS(state, pages)       { state.pages        = pages },
    DELETE_ESTADISTICAS(state)      { state.estadisticas = [] },
    ERROR(state, error)             { state.error        = error },
  },
  actions    : {
    getListEstadisticasFinalesPorEstados(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetListEstadisticasFinalesPorEstados/${agno},${idUnidad}`, store)
    },
    getEstadisticasFinalesPorTipoIncidente(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasFinalesPorTipoIncidente/${agno},${idUnidad}`, store)
    },
    getEstadisticasFinalesPorEstados(context, { idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasFinalesPorEstados/${idUnidad}`, store)
    },
    getEstadisticasFinalesPorFecha(context, { idUnidad, agno, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasFinalesPorFecha/${idUnidad},${agno}`, store)
    },
    getEstadisticasFinalesPorGrupoDeTipoIncidente(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasFinalesPorGrupoDeTipoIncidente/${agno},${idUnidad}`, store)
    }, 
    getEstadisticasFinalesPorGrupoDeTipoIncidenteMensual(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasFinalesPorGrupoDeTipoIncidenteMensual/${agno},${idUnidad}`, store)
    },
    getListAgnosInformesFinales(context, { store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetListAgnosInformesFinales`, store)
    }, 

  },
  getters    : {
    isLoading    : state => state.loading,
    estadisticas : state => state.estadisticas,
    pages        : state => state.pages,
    isError      : state => state.error,
  }
}