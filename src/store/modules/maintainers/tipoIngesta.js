import { sciApi } from '@/services/http'
import router from '@/router'

const recurso = '/TipoIngesta'

export default {
  namespaced : true,
  state      : {
    tiposIngesta : [],
    pages        : 1,
    loading      : false,
    error        : false,
  },
  mutations  : {
    GETTING_DATA        (state)        { state.loading      = true  },
    END_GETTING_DATA    (state)        { state.loading      = false },
    ADD_TIPOS_INGESTA   (state, data)  { state.tiposIngesta = data },
    ADD_PAGINAS         (state, pages) { state.pages        = pages },
    DELETE_TIPOS_INGESTA(state)        { state.tiposIngesta = [] },
    ERROR               (state, error) { state.error        = error },
  },
  actions    : {
/*
		👉
				• getListTipoIngesta           :	Obtiene la lista de tipos de ingesta desde el endpoint /TipoIngesta/GetListTipoIngesta y 
																					actualiza el estado del store con los datos obtenidos.
				• getListMantencionTipoIngesta :	Obtiene la lista de tipos de ingesta para mantención desde el endpoint 
																					/TipoIngesta/GetListMantencionTipoIngesta y actualiza el estado del store con los datos 
																					obtenidos. Permite paginación y búsqueda.
				• postMantencionTipoIngesta    :	Envía una solicitud POST al endpoint /TipoIngesta/PostMantencionTipoIngesta para crear 
																					un nuevo tipo de ingesta.
				• putMantencionTipoIngesta     :	Envía una solicitud PUT al endpoint /TipoIngesta/PutMantencionTipoIngesta/{id} para 
																					actualizar un tipo de ingesta existente.
				• deleteMantencionTipoIngesta  :	Envía una solicitud DELETE al endpoint /TipoIngesta/DeleteMantencionTipoIngesta/{id} para 
																					eliminar un tipo de ingesta existente.
*/
		async getListTipoIngesta({ commit }) {
      commit('GETTING_DATA')
      try {
        return await sciApi.get(`${recurso}/GetListTipoIngesta`)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async getListMantencionTipoIngesta({ commit }, { page = '', items = '', search = '', store = true } = {}) {
      if (store) {
        commit('ERROR', false)
        commit('DELETE_TIPOS_INGESTA')
        commit('GETTING_DATA')
      }
      try {
        const res = await sciApi.get(`${recurso}/GetListMantencionTipoIngesta`, {
					params: { page, items, search }
        })
        if (store) {
          commit('ADD_TIPOS_INGESTA', res.data.respuesta)
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

    async postMantencionTipoIngesta({ commit }, payload) {
      commit('GETTING_DATA')
      try {
        return await sciApi.post(`${recurso}/PostMantencionTipoIngesta`, payload)
      } catch (error) {
        return error.response
      } finally {
        commit('END_GETTING_DATA')
      }
    },

    async putMantencionTipoIngesta(_ctx, payload) {
      try {
        return await sciApi.put(`${recurso}/PutMantencionTipoIngesta/${payload.id}`, payload)
      } catch (error) {
        return error.response
      }
    },

    async deleteMantencionTipoIngesta(_ctx, payload) {
      try {
        return await sciApi.delete(`${recurso}/DeleteMantencionTipoIngesta/${payload.id}`)
      } catch (error) {
        return error.response
      }
    },
  },
  getters    : {
    isLoading    : state => state.loading,
    tiposIngesta : state => state.tiposIngesta,
    pages        : state => state.pages,
    isError      : state => state.error,
  }
}