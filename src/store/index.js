import Vue           from 'vue'
import Vuex          from 'vuex'
import router        from '@/router'
import { jwtDecode } from 'jwt-decode'
import { authApi } from '@/services/http'

Vue.use(Vuex)

// Rutas de módulos del store (Carpeta diccionario)
import personasStore   from "@/store/modules/diccionario/personas"
import archivosStore   from "@/store/modules/diccionario/archivos"

// Rutas de módulos del store (SCI)
import ampliacionesInformesStore     from '@/store/modules/informationSupplementary/ampliacionesInformes'     ;
import archivosInformesStore         from '@/store/modules/informationSupplementary/archivosInformes'         ;
import antecedentesJudicialesStore   from '@/store/modules/informationSupplementary/antecedentesJudiciales'   ;
import condicionPolicialStore        from '@/store/modules/maintainers/condicionPolicial'                     ;
import estadisticaBINTEStore         from '@/store/modules/statistics/estadisticaBINTE'                       ;
import estadisticaFinalesStore       from '@/store/modules/statistics/estadisticaFinales'                     ;
import estadisticaIncidentesStore    from '@/store/modules/statistics/estadisticaIncidentes'                  ;
import estadisticaPreliminaresStore  from '@/store/modules/statistics/estadisticaPreliminares'                ;
import estadoSaludStore              from '@/store/modules/maintainers/estadoSalud'                           ;
import finalesStore                  from '@/store/modules/information/finales'                               ; 
import incidentesStore               from '@/store/modules/information/incidentes'                            ;
import incidentesBINTEStore          from '@/store/modules/information/incidentesBINTE'                       ;
import indiceAlertaStore             from '@/store/modules/maintainers/indiceAlerta'                          ;
import informesPreliminaresStore     from '@/store/modules/information/informesPreliminares'                  ;
import involucradosStore             from '@/store/modules/informationSupplementary/involucrados'             ;
import medidasAdoptadasStore         from '@/store/modules/maintainers/medidasAdoptadas'                      ;
import procedimientosPolicialesStore from '@/store/modules/informationSupplementary/procedimientosPoliciales' ;
import registroEventosStore          from '@/store/modules/registroEventos'                                   ;
import tipoArmamentoStore            from '@/store/modules/maintainers/tipoArmamento'                         ;
import tipoConsumoStore              from '@/store/modules/maintainers/tipoConsumo'                           ;
import tipoGrupoIncidenteStore       from '@/store/modules/maintainers/tipoGrupoIncidente'                    ;
import tipoIdentificacionStore       from '@/store/modules/maintainers/tipoIdentificacion'                    ;
import tipoIncidenteStore            from '@/store/modules/maintainers/tipoIncidente'                         ;
import tipoIngestaStore              from '@/store/modules/maintainers/tipoIngesta'                           ;
import tipoIntervinienteStore        from '@/store/modules/maintainers/tipoInterviniente'                     ;
import tipoInvestigacionStore        from '@/store/modules/maintainers/tipoInvestigacion'                     ;
import unidadesStore                 from '@/store/modules/unidades'                                          ;

// Constantes y Funciones globales del Index Store
const sistemaId  = 19
const roles      = [541,542,543,545]
const prefijo    = 'SCI'

function getLocalUser() {
  const user = localStorage.getItem(prefijo + "Token");
  if (!user) {
    return null;
  }
  
  return jwtDecode(user);
}

function getToken() {
    const token = localStorage.getItem(prefijo + "Token")
    if (!token) return false

    try {
        const { exp } = jwtDecode(token)
        if (Date.now() >= exp * 1000) {
            // Token vencido → limpiar todo
            ['Token', 'Nombre', 'Run', 'Avatar', 'Expira']
                .forEach(k => localStorage.removeItem(prefijo + k))
            return false
        }
    } catch {
        return false
    }
    return token
}

function getDrawer() {
  const token = localStorage.getItem(prefijo + "Token");
  if (!token) {
    return false;
  }
  const usuario = jwtDecode(token);
  
  return roles.includes(parseInt(usuario.Rol))
}

function setCookies(token) {
  // Los nombres de las cookies son diferentes para cada proyecto (cambia solo el prefijo)
  localStorage.setItem(prefijo + "Token" , token);
  localStorage.setItem(prefijo + "Nombre", jwtDecode(token).Nombres);
  localStorage.setItem(prefijo + "Run"   , jwtDecode(token).Run);
  localStorage.setItem(prefijo + "Avatar", jwtDecode(token).Foto);
  localStorage.setItem(prefijo + "Expira", formatNumericDate(jwtDecode(token).exp));
}

function formatNumericDate(numericDate) {
    return new Date(numericDate * 1000).toLocaleString()
}

// STORE de la aplicación
export default new Vuex.Store({
  state: {
    token       : getToken(),
    currentUser : getLocalUser(),
    isLoggedIn  : !!getLocalUser(),
    loading     : false,
    auth_error  : null,
    layout      : 'principal-layout',
    drawerLeft  : getDrawer(),
    snackbars   : [],
  },
  getters: {
    layout(state)      {	return state.layout;			},
    isLoading(state)   {	return state.loading;			},
    isLoggedIn(state)  {	return state.isLoggedIn;	},
    currentUser(state) {	return state.currentUser;	},
    drawerLeft(state)  {	return state.drawerLeft;	},
    authError(state)   {	return state.auth_error;	},
    getToken(state)    {	return state.token;				},
    getRolId(state)    {
      if (state.currentUser && state.currentUser.Rol) {
        return state.currentUser.Rol;
      }
      return null;
    },
  },
  mutations: {
    LOGIN(state) {
      state.loading    = true;
      state.auth_error = null;
    },

    LOGIN_SUCCESS(state, token) {
      state.auth_error  = null;
      state.isLoggedIn  = true;
      state.loading     = false;
      state.currentUser = jwtDecode(token);
      state.token       = token;

      setCookies(token);//guarda cookies
      state.drawerLeft  = roles.includes(parseInt(jwtDecode(token).Rol))//determina si se muestra el menú lateral
    },

    LOGIN_FAILED(state, mensaje) {
      state.loading    = false;
      state.auth_error = mensaje;
    },

    LOGOUT(state, mensaje) {
      localStorage.removeItem(prefijo + "Token")
      localStorage.removeItem(prefijo + "Nombre")
      localStorage.removeItem(prefijo + "Run")
      localStorage.removeItem(prefijo + "Avatar")
      localStorage.removeItem(prefijo + "Expira")
      state.isLoggedIn  = false
      state.currentUser = null
      state.token       = null
      state.drawerLeft  = false
      state.auth_error  = mensaje
    },

    SET_LAYOUT(state, newLayout) {
      state.layout = newLayout
    },

    ADD_SNACKBAR(state, snackbar) {
      state.snackbars.push(snackbar)
    },
    REMOVE_SNACKBAR(state, id) {
      state.snackbars = state.snackbars.filter(s => s.id !== id)
    },
    CLEAR_SNACKBARS(state) {
      state.snackbars = []
    },
  },
  actions: {
    async login(context, credentials) {
      context.commit('LOGIN');
      return authApi.post(`/PostLogin`, {
        sistemaId,
        run  : credentials.usuario,
        pass : btoa(credentials.password)
      }).then(response => {
        context.commit('LOGIN_SUCCESS', response.data);
        const usuarioConectado = jwtDecode(response.data);

        if (parseInt(usuarioConectado.Rol) === 541) {
          router.push({ name: "inicioPME" });
        } else if (parseInt(usuarioConectado.Rol) === 542) {
          router.push({ name: "inicioS2" });
        } else if (parseInt(usuarioConectado.Rol) === 543) {
          router.push({ name: "inicioCDTE" });
        } else if (parseInt(usuarioConectado.Rol) === 545) {
          router.push({ name: "inicioBINTE" });
        } else {
          context.commit('LOGIN_FAILED', 'Ha sucedido un error, perfil no creado');
        }
      }).catch(error => {
        if (error.response?.status == 409 || error.response?.status == 404) {
          context.commit('LOGIN_FAILED', error.response.data)
        } else {
          context.commit('LOGIN_FAILED', 'Error al tratar de conectar con entorno institucional')
        }
        return error
      })
    },

        logout(context, mensaje) {
            context.commit('LOGOUT', mensaje);
            router.replace({ name: "login" });
        },

        async restablecerCuenta(context, model) {
            return authApi.post(`/PostReestablecerCuenta`, {
                sistemaId,
                run: model.run,
                pass: btoa(model.pass),
                nroDocumento: model.documento,
            })
            .then(response => response)
            .catch(error => error.response)
        },

    async refreshToken({ state, commit }) {
      if (state.token) {
        return authApi.post('/PostRefreshToken', {
          sistemaId,
          token: state.token,
        }).then(response => {
          commit('LOGIN_SUCCESS', response.data)
        }).catch(error => {
          commit('LOGOUT')
          return error
        })
      }
    },
    clearSnackbars({ commit }) {
      commit('CLEAR_SNACKBARS');
    },
    triggerSnackbar({ commit }, payload = {}) {
      const id          = Date.now() + Math.random().toString(36).substring(2, 5);
      const tipoInforme = payload.tipoInforme || '';

      const newSnackbar = {
          id,
          title   : payload.title,
          text    : payload.text,
          color   : payload.color || '#045c3f',
          icon    : payload.icon,
          timeout : 0
      };

      // Las notificaciones deben permanecer visibles hasta que el usuario las cierre manualmente.
      commit('ADD_SNACKBAR', newSnackbar);
    },
  },
    
  modules: {
    personasStore                ,
    archivosStore                ,
        
    ampliacionesInformesStore    ,
    archivosInformesStore        ,
    antecedentesJudicialesStore  ,
    condicionPolicialStore       ,
    estadisticaBINTEStore        ,
    estadisticaFinalesStore      ,
    estadisticaIncidentesStore   ,
    estadisticaPreliminaresStore ,
    estadoSaludStore             ,
    finalesStore                 ,
    incidentesStore              ,
    indiceAlertaStore            ,
    incidentesBINTEStore         ,
    informesPreliminaresStore    ,
    involucradosStore            ,
    medidasAdoptadasStore        ,
    procedimientosPolicialesStore,
    registroEventosStore         ,
    tipoArmamentoStore           ,
    tipoGrupoIncidenteStore      ,
    tipoConsumoStore             ,
    tipoIdentificacionStore      ,
    tipoIncidenteStore           ,
    tipoIngestaStore             ,
    tipoIntervinienteStore       ,
    tipoInvestigacionStore       ,
    unidadesStore                ,
  }
})
