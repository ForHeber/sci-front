import { sciApi } from '@/services/http'

const recurso = '/AntecedentesJudiciales'

export default {
	namespaced : true,
	state      : {
		antecedentesJudiciales : []   ,
		pages                    : 1    ,
		loading                  : false,
		error                    : false,
	},
	mutations  : {
		GETTING_DATA(state)                      { state.loading                = true;	 },
		END_GETTING_DATA(state)                  { state.loading                = false; },
		ADD_ANTECEDENTES_JUDICIALES(state, data) { state.antecedentesJudiciales = data;	 },
		ADD_PAGINAS(state, pages)                { state.pages                  = pages; },
		DELETE_ANTECEDENTES_JUDICIALES(state)    { state.antecedentesJudiciales = [];		 },
		ERROR(state, error)                      { state.error                  = error; }
	},
	actions    : {
/*
		👉
				• getListAntecedentesJudicialesPreliminares :	Obtiene la lista de antecedentes judiciales preliminares desde el endpoint
																											/AntecedentesJudiciales/GetListAntecedentesJudicialesPre/{informesId} y 
																											actualiza el estado del store con los datos obtenidos.
				• postAntecedentesJudicialesPreliminares    :	Envía una solicitud POST al endpoint /AntecedentesJudiciales/PostAntecedentesJudicialesPre 
																											para crear un nuevo antecedente judicial preliminar.
				• putAntecedentesJudicialesPreliminares     :	Envía una solicitud PUT al endpoint /AntecedentesJudiciales/PutAntecedentesJudicialesPre/{informesId},{id} 
																											para actualizar un antecedente judicial preliminar existente.
				• deleteAntecedentesJudicialesPreliminares  :	Envía una solicitud DELETE al endpoint /AntecedentesJudiciales/DeleteAntecedentesJudicialesPre/{informesId},{id} 
																											para eliminar un antecedente judicial preliminar existente.
				• getListAntecedentesJudicialesIncidentes   :	Obtiene la lista de antecedentes judiciales incidentes desde el endpoint
																											/AntecedentesJudiciales/GetListAntecedentesJudicialesInc/{informesId} y	
																											actualiza el estado del store con los datos obtenidos.
				• postAntecedentesJudicialesIncidentes      :	Envía una solicitud POST al endpoint /AntecedentesJudiciales/PostAntecedentesJudicialesInc
																											para crear un nuevo antecedente judicial incidente.
				• putAntecedentesJudicialesIncidentes       :	Envía una solicitud PUT al endpoint /AntecedentesJudiciales/PutAntecedentesJudicialesInc/{informesId},{id}
																											para actualizar un antecedente judicial incidente existente.							
				• deleteAntecedentesJudicialesIncidentes    :	Envía una solicitud DELETE al endpoint /AntecedentesJudiciales/DeleteAntecedentesJudicialesInc/{informesId},{id}
																											para eliminar un antecedente judicial incidente existente.
				• getListAntecedentesJudicialesFinales      :	Obtiene la lista de antecedentes judiciales finales desde el endpoint
																											/AntecedentesJudiciales/GetListAntecedentesJudicialesFin/{informesId} y	
																											actualiza el estado del store con los datos obtenidos.
				• postAntecedentesJudicialesFinales         :	Envía una solicitud POST al endpoint /AntecedentesJudiciales/PostAntecedentesJudicialesFin
																											para crear un nuevo antecedente judicial final.
				• putAntecedentesJudicialesFinales          :	Envía una solicitud PUT al endpoint /AntecedentesJudiciales/PutAntecedentesJudicialesFin/{informesId},{id}
																											para actualizar un antecedente judicial final existente.							
				• deleteAntecedentesJudicialesFinales       :	Envía una solicitud DELETE al endpoint /AntecedentesJudiciales/DeleteAntecedentesJudicialesFin/{informesId},{id}
																											para eliminar un antecedente judicial final existente.


*/		
		async getListAntecedentesJudicialesPreliminares({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_ANTECEDENTES_JUDICIALES')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListAntecedentesJudicialesPre/${informesId}`)
				commit('ADD_ANTECEDENTES_JUDICIALES', res.data.respuesta)
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
				
		async postAntecedentesJudicialesPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostAntecedentesJudicialesPre`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putAntecedentesJudicialesPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutAntecedentesJudicialesPre/${payload.PRELIMINARESID},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		
		async deleteAntecedentesJudicialesPreliminares({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteAntecedentesJudicialesPre/${payload.preliminaresid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		
		async getListAntecedentesJudicialesIncidentes({ commit }, informesId) {
			commit('ERROR', false)
			commit('DELETE_ANTECEDENTES_JUDICIALES')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListAntecedentesJudicialesInc/${informesId}`)
				commit('ADD_ANTECEDENTES_JUDICIALES', res.data.respuesta)
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
				
		async postAntecedentesJudicialesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostAntecedentesJudicialesInc`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putAntecedentesJudicialesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutAntecedentesJudicialesInc/${payload.incidentesid},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		
		async deleteAntecedentesJudicialesIncidentes({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteAntecedentesJudicialesInc/${payload.incidentesid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		
		async getListAntecedentesJudicialesFinales({ commit }, finalesId) {
			commit('ERROR', false)
			commit('DELETE_ANTECEDENTES_JUDICIALES')
			commit('GETTING_DATA')
			try {
				const res = await sciApi.get(`${recurso}/GetListAntecedentesJudicialesFin/${finalesId}`)
				commit('ADD_ANTECEDENTES_JUDICIALES', res.data.respuesta)
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
				
		async postAntecedentesJudicialesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.post(`${recurso}/PostAntecedentesJudicialesFin`, payload)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async putAntecedentesJudicialesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.put(
					`${recurso}/PutAntecedentesJudicialesFin/${payload.finalesid},${payload.id}`,
					payload
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},

		async deleteAntecedentesJudicialesFinales({ commit }, payload) {
			commit('GETTING_DATA')
			try {
				return await sciApi.delete(
					`${recurso}/DeleteAntecedentesJudicialesFin/${payload.finalesid},${payload.id}`
				)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
	},
	getters    : {
		isLoading              : state => state.loading,
		antecedentesJudiciales : state => state.antecedentesJudiciales,
		pages                  : state => state.pages,
		isError                : state => state.error,
	}
}