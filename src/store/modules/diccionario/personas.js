import { svcApi } from '@/services/http'

export default {
    namespaced: true,
    state:{
        personas: [],
        pages: 0,
        loading: false,
    },
    mutations:{
        GETTING_DATA(state){
            state.loading = true;
        },
        END_GETTING_DATA(state){
            state.loading = false;
        },
        ADD_PERSONAS(state, personas){
            state.personas = personas;
        },
        ADD_PAGES(state, pages){
            state.pages = pages;
        },
    },
    actions:{
        async getPersonas({ commit }, { page = '', items = '', run = '', unidadCodigo = '', search = '' } = {}) {
            commit('GETTING_DATA');
        try {
                const res = await svcApi.get('/diccionario/getPersonas', {
                    params: { page, items, run, unidadCodigo, search }
                })
                commit('ADD_PERSONAS', res.data.respuesta)
                commit('ADD_PAGES', res.data.pageCount)
                return res
            } catch (error) {
                return error.response
            } finally {
                commit('END_GETTING_DATA')
            }
        },

        },
    getters:{
        isLoading: state => state.loading,
        personas:  state => state.personas,
        pages:     state => state.pages,
    }
}