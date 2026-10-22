import { sciApi } from '@/services/http'

const recurso = '/ArchivosInformes'

export default {
	namespaced : true,
	state      : {
		archivosInforme : []   ,
		pages           : 1    ,
		loading         : false,
		error           : false,
	},
	mutations  : {
		GETTING_DATA(state)              { state.loading         = true;	 },
		END_GETTING_DATA(state)          { state.loading         = false; },
		ADD_ARCHIVOSINFORME(state, data) { state.archivosInforme = data;	 },
		ADD_PAGINAS(state, pages)        { state.pages           = pages; },
		DELETE_ARCHIVOSINFORME(state)    { state.archivosInforme = [];		 },
		ERROR(state, error)              { state.error           = error; }
	},
	actions    : {
/*
		👉
				• getListArchivosInformesPreliminares :	Obtiene la lista de archivos de informes desde el endpoint
																								/ArchivosInformes/GetListArchivosInformes/{informesId} y 
																								actualiza el estado del store con los datos obtenidos.
				• postArchivosInformesPreliminares    :	Envía una solicitud POST al endpoint /ArchivosInformes/PostArchivosInformes 
																								para crear un nuevo archivo de informe.
				• putArchivosInformesPreliminares     :	Envía una solicitud PUT al endpoint /ArchivosInformes/PutArchivosInformes/{informesId},{id} 
																								para actualizar un archivo de informe existente.
				• deleteArchivosInformesPreliminares  :	Envía una solicitud DELETE al endpoint /ArchivosInformes/DeleteArchivosInformes/{informesId},{id} 
																								para eliminar un archivo de informe existente.
				• getListArchivosInformesIncidentes   :	Obtiene la lista de archivos de informes desde el endpoint
																								/ArchivosInformes/GetListArchivosInformes/{informesId} y	
																								actualiza el estado del store con los datos obtenidos.
				• postArchivosInformesIncidentes      :	Envía una solicitud POST al endpoint /ArchivosInformes/PostArchivosInformes 
																								para crear un nuevo archivo de informe.
				• putArchivosInformesIncidentes       :	Envía una solicitud PUT al endpoint /ArchivosInformes/PutArchivosInformes/{informesId},{id}
				• deleteArchivosInformesIncidentes    :	Envía una solicitud DELETE al endpoint /ArchivosInformes/DeleteArchivosInformes/{informesId},{id} 
																								para eliminar un archivo de informe existente.
				• getListArchivosInformesFinales      :	Obtiene la lista de archivos de informes desde el endpoint
																								/ArchivosInformes/GetListArchivosInformes/{informesId} y	
																								actualiza el estado del store con los datos obtenidos.
				• postArchivosInformesFinales         :	Envía una solicitud POST al endpoint /ArchivosInformes/PostArchivosInformes 
																								para crear un nuevo archivo de informe.
				• putArchivosInformesFinales          :	Envía una solicitud PUT al endpoint /ArchivosInformes/PutArchivosInformes/{informesId},{id}
				• deleteArchivosInformesFinales       :	Envía una solicitud DELETE al endpoint /ArchivosInformes/DeleteArchivosInformes/{informesId},{id} 
																								para eliminar un archivo de informe existente.			
*/		
		async getListArchivosInformesPreliminares({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_ARCHIVOSINFORME')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListArchivosInformesPre/${informesId}`)
				commit('ADD_ARCHIVOSINFORME', res.data.respuesta)
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
								
		async postArchivosInformesPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostArchivosInformesPre`, payload)
			} catch (error) {
				console.error('Error en postArchivosInformesPreliminares:', error)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putArchivosInformesPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutArchivosInformesPre/${payload.PRELIMINARESID},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
				
		async deleteArchivosInformesPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteArchivosInformesPre/${payload.preliminaresid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		async getListArchivosInformesIncidentes({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_ARCHIVOSINFORME')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListArchivosInformesInc/${informesId}`)
				commit('ADD_ARCHIVOSINFORME', res.data.respuesta)
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
								
		async postArchivosInformesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostArchivosInformesInc`, payload)
			} catch (error) {
				console.error('Error en postArchivosInformesIncidentes:', error)
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putArchivosInformesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutArchivosInformesInc/${payload.incidentesid},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
				
		async deleteArchivosInformesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteArchivosInformesInc/${payload.incidentesid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},		

		async getListArchivosInformesFinales({ commit }, finalesId) {
			commit('ERROR', false)
			commit('DELETE_ARCHIVOSINFORME')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListArchivosInformesFin/${finalesId}`)
				commit('ADD_ARCHIVOSINFORME', res.data.respuesta)
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

		async postArchivosInformesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostArchivosInformesFin`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putArchivosInformesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutArchivosInformesFin/${payload.finalesid},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async deleteArchivosInformesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteArchivosInformesFin/${payload.finalesid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
	},
	getters    : {
		isLoading       : state => state.loading,
		archivosInforme : state => state.archivosInforme,
		pages           : state => state.pages,
		isError         : state => state.error,
	}
}