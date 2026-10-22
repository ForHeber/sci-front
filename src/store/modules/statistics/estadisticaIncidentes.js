import { sciApi } from '@/services/http'

const recurso = '/EstadisticasIncidentes'

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
    getListEstadisticasIncidentesPorEstados(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetListEstadisticasIncidentesPorEstados/${agno},${idUnidad}`, store)
    },    
    getEstadisticasIncidentesPorTipoIncidente(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasIncidentesPorTipoIncidente/${agno},${idUnidad}`, store)
    },    
    getEstadisticasIncidentesPorEstados(context, { idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasIncidentesPorEstados/${idUnidad}`, store)
    },
    getEstadisticasIncidentesPorFecha(context, { idUnidad, agno, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasIncidentesPorFecha/${idUnidad},${agno}`, store)
    },
    getEstadisticasIncidentesPorGrupoDeTipoIncidente(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasIncidentesPorGrupoDeTipoIncidente/${agno},${idUnidad}`, store)
    },
    getEstadisticasIncidentesPorGrupoDeTipoIncidenteMensual(context, { agno, idUnidad, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasIncidentesPorGrupoDeTipoIncidenteMensual/${agno},${idUnidad}`, store)
    },    
    getListAgnosInformesIncidentes(context, { store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetListAgnosInformesIncidentes`, store)
    },    

  },
  getters    : {
    isLoading    : state => state.loading,
    estadisticas : state => state.estadisticas,
    pages        : state => state.pages,
    isError      : state => state.error,
  }
}