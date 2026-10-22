import { sciApi } from '@/services/http'

const recurso = '/EstadisticasBinte'

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
    getEstadisticasBinteCantidadIncidenteAccidente(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBinteCantidadIncidenteAccidente/${agno},${tipoInforme}`, store)
    },
    getEstadisticasBinteCantidadPersonaUnidad(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBinteCantidadPersonaUnidad/${agno},${tipoInforme}`, store)
    },
    getEstadisticasBintePorTipoIngesta(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBintePorTipoIngesta/${agno},${tipoInforme}`, store)
    },
    getEstadisticasBintePorTipoIdentificacion(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBintePorTipoIdentificacion/${agno},${tipoInforme}`, store)
    },
    getEstadisticasBintePorTipoArmamento(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBintePorTipoArmamento/${agno},${tipoInforme}`, store)
    },
    getEstadisticasBinteCantidadArmaFiscalParticular(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBinteCantidadArmaFiscalParticular/${agno},${tipoInforme}`, store)
    },
    getEstadisticasBintePorTipoInvestigacion(context, { agno, tipoInforme, store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetEstadisticasBintePorTipoInvestigacion/${agno},${tipoInforme}`, store)
    },
    getListAgnosInformesIncidentesFinales(context, { store = true } = {}) {
      return fetchEstadisticas(context, `${recurso}/GetListAgnosInformesIncidentesFinales`, store)
    }, 
  },
  getters    : {
    isLoading    : state => state.loading,
    estadisticas : state => state.estadisticas,
    pages        : state => state.pages,
    isError      : state => state.error,
  }
}