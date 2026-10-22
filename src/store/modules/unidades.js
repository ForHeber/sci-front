import { sciApi } from '@/services/http'

const recurso = '/Unidades'

export default {
	namespaced: true,
	state: {
		loading: false,
	},
	mutations: {
		GETTING_DATA(state)     { state.loading = true  },
		END_GETTING_DATA(state) { state.loading = false },
	},
	actions: {
		async getListUnidades({ commit }) {
			commit('GETTING_DATA')
			try {
				return await sciApi.get(`${recurso}/GetListUnidades`)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},
		async getListUnidadesIncidentes({ commit }) {
			commit('GETTING_DATA')
			try {
				return await sciApi.get(`${recurso}/GetListUnidadesIncidentes`)
			} catch (error) {
				return error.response
			} finally {
				commit('END_GETTING_DATA')
			}
		},		
	},
	getters: {
		isLoading: state => state.loading,
	}
}