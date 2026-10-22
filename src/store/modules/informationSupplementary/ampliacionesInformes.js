import { sciApi } from '@/services/http'

const recurso = '/AmpliacionesInformes'

export default {
	namespaced : true,
	state      : {
		ampliacionesInforme : []   ,
		pages               : 1    ,
		loading             : false,
		error               : false,
	},
	mutations  : {
		GETTING_DATA(state)                  { state.loading              = true;	 },
		END_GETTING_DATA(state)              { state.loading              = false; },
		ADD_AMPLIACIONESINFORME(state, data) { state.ampliacionesInforme = data;	 },
		ADD_PAGINAS(state, pages)            { state.pages                = pages; },
		DELETE_AMPLIACIONESINFORME(state)    { state.ampliacionesInforme = [];		 },
		ERROR(state, error)                  { state.error                = error; }
	},
	actions    : {
/*
		👉
				• getListAmpliacionesInformesIncidentes :	Obtiene la lista de archivos de informes desde el endpoint
																									/AmpliacionesInformes/GetListAmpliacionesInformes/{informesId} y 
																									actualiza el estado del store con los datos obtenidos.
				• postAmpliacionesInformesIncidentes    :	Envía una solicitud POST al endpoint /AmpliacionesInformes/PostAmpliacionesInformes 
																									para crear un nuevo archivo de informe.
				• putAmpliacionesInformesIncidentes     :	Envía una solicitud PUT al endpoint /AmpliacionesInformes/PutAmpliacionesInformes/{informesId},{id} 
																									para actualizar un archivo de informe existente.
				• deleteAmpliacionesInformesIncidentes  :	Envía una solicitud DELETE al endpoint /AmpliacionesInformes/DeleteAmpliacionesInformes/{informesId},{id} 
																									para eliminar un archivo de informe existente.
				• getListAmpliacionesInformesFinales		:	Obtiene la lista de archivos de informes desde el endpoint
																									/AmpliacionesInformes/GetListAmpliacionesInformes/{informesId} y 
																									actualiza el estado del store con los datos obtenidos.
				• postAmpliacionesInformesFinales    		:	Envía una solicitud POST al endpoint /AmpliacionesInformes/PostAmpliacionesInformes 
																									para crear un nuevo archivo de informe.
				• putAmpliacionesInformesFinales     		:	Envía una solicitud PUT al endpoint /AmpliacionesInformes/PutAmpliacionesInformes/{informesId},{id} 
																									para actualizar un archivo de informe existente.
				• deleteAmpliacionesInformesFinales  		:	Envía una solicitud DELETE al endpoint /AmpliacionesInformes/DeleteAmpliacionesInformes/{informesId},{id} 
																									para eliminar un archivo de informe existente.

*/		
		
		async getListAmpliacionesInformesIncidentes({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_AMPLIACIONESINFORME')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListAmpliacionesInformesInc/${informesId}`)
				commit('ADD_AMPLIACIONESINFORME', res.data.respuesta)
				commit('ADD_PAGINAS', 1)
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
								
		async postAmpliacionesInformesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostAmpliacionesInformesInc`, payload)
			} catch (error) {
				console.error('Error en postAmpliacionesInformesIncidentes:', error)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putAmpliacionesInformesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutAmpliacionesInformesInc/${payload.INCIDENTESID},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
				
		async deleteAmpliacionesInformesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteAmpliacionesInformesInc/${payload.incidentesid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},		

		async getListAmpliacionesInformesFinales({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_AMPLIACIONESINFORME')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListAmpliacionesInformesFin/${informesId}`)
				commit('ADD_AMPLIACIONESINFORME', res.data.respuesta)
				commit('ADD_PAGINAS', 1)
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

		async postAmpliacionesInformesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostAmpliacionesInformesFin`, payload)
			} catch (error) {
				console.error('Error en postAmpliacionesInformesFinales:', error)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putAmpliacionesInformesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutAmpliacionesInformesFin/${payload.finalesid},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async deleteAmpliacionesInformesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteAmpliacionesInformesFin/${payload.finalesid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
	},
	getters    : {
		isLoading            : state => state.loading,
		ampliacionesInformes : state => state.ampliacionesInforme,
		pages                : state => state.pages,
		isError              : state => state.error,
	}
}