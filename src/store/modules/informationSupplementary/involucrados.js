import { sciApi } from '@/services/http'

const recurso = '/Involucrados'

export default {
	namespaced : true,
	state      : {
		involucrados: [],
		pages   : 1,
		loading : false,
		error   : false,
	},
	mutations  : {
		GETTING_DATA(state)           { state.loading      = true  },
		END_GETTING_DATA(state)       { state.loading      = false },
		ADD_INVOLUCRADOS(state, data) { state.involucrados = data  },
		ADD_PAGINAS(state, pages)     { state.pages        = pages },
		DELETE_INVOLUCRADOS(state)    { state.involucrados = []    },
		ERROR(state, error)           { state.error        = error },
	},
	actions    : {
/*
	👉
			• getListInvolucradosPreliminares :	Obtiene la lista de involucrados preliminares desde el endpoint
																					/Involucrados/GetListInvolucradosPre/{informesId} y 
																					actualiza el estado del store con los datos obtenidos.
			• postInvolucradosPreliminares    :	Envía una solicitud POST al endpoint /Involucrados/PostInvolucradosPre 
																					para crear un nuevo involucrado preliminar.
			• deleteInvolucradosPreliminares  :	Envía una solicitud DELETE al endpoint /Involucrados/DeleteInvolucradosPre/{informesId},{id} 
																					para eliminar un involucrado preliminar existente.
			• getListInvolucradosIncidentes   :	Obtiene la lista de involucrados incidentes desde el endpoint
																					/Involucrados/GetListInvolucradosInc/{informesId} y
																					actualiza el estado del store con los datos obtenidos.
			• postInvolucradosIncidentes      :	Envía una solicitud POST al endpoint /Involucrados/PostInvolucradosInc
																					para crear un nuevo involucrado incidente.
			• deleteInvolucradosIncidentes    :	Envía una solicitud DELETE al endpoint /Involucrados/DeleteInvolucradosInc/{informesId},{id} 
																					para eliminar un involucrado incidente existente.	
			• getListInvolucradosFinales		  :	Obtiene la lista de involucrados finales desde el endpoint
																					/Involucrados/GetListInvolucradosFin/{informesId} y
																					actualiza el estado del store con los datos obtenidos.
			• postInvolucradosFinales         :	Envía una solicitud POST al endpoint /Involucrados/PostInvolucradosFin
																					para crear un nuevo involucrado final.
			• deleteInvolucradosFinales       :	Envía una solicitud DELETE al endpoint /Involucrados/DeleteInvolucradosFin/{informesId},{id} 
																					para eliminar un involucrado final existente.

*/		
		async getListInvolucradosPreliminares({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_INVOLUCRADOS')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListInvolucradosPre/${informesId}`)
				commit('ADD_INVOLUCRADOS', res.data.respuesta)
				commit('ADD_PAGINAS', 1)
				return res
			} catch (error) {
				commit('ERROR', true)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async postInvolucradosPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostInvolucradosPre`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async deleteInvolucradosPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(`${recurso}/DeleteInvolucradosPre/${payload.preliminaresid},${payload.id}`)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		
		async getListInvolucradosIncidentes({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_INVOLUCRADOS')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListInvolucradosInc/${informesId}`)
				commit('ADD_INVOLUCRADOS', res.data.respuesta)
				commit('ADD_PAGINAS', 1)
				return res
			} catch (error) {
				commit('ERROR', true)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async postInvolucradosIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostInvolucradosInc`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async deleteInvolucradosIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(`${recurso}/DeleteInvolucradosInc/${payload.incidenteid},${payload.id}`)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},		
	
		async getListInvolucradosFinales({ commit }, finalesId) {
			commit('ERROR', false)
			commit('DELETE_INVOLUCRADOS')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListInvolucradosFin/${finalesId}`)
				commit('ADD_INVOLUCRADOS', res.data.respuesta)
				commit('ADD_PAGINAS', 1)
				return res
			} catch (error) {
				commit('ERROR', true)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async postInvolucradosFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostInvolucradosFin`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async deleteInvolucradosFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(`${recurso}/DeleteInvolucradosFin/${payload.finalesid},${payload.id}`)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},		
	},	
	getters    : {
		isLoading    : state => state.loading,
		involucrados : state => state.involucrados,
		pages        : state => state.pages,
		isError      : state => state.error,
	}
}