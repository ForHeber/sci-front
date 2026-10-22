import Vue from 'vue'
import VueRouter from 'vue-router'

import LoginLayout from '@/layouts/Login';
import MainLayout  from '@/layouts/Main.vue'

import store       from "@/store/index";

Vue.use(VueRouter)

const routes = [
	{
		path      : "/",
		name      : "login",
		component : () => import( /*webpackChunkName:"login"*/ "@/views/Login.vue"),
		meta      : {
			guest  : true,
			whoCan : [0],
			layout : LoginLayout
		}
	},
/*
		👉 Inicio	BINTE
*/
	{
		path      : "/inicioBINTE",
		name      : "inicioBINTE",
		component : () => import( /*webpackChunkName:"inicioBINTE"*/ "@/views/home/InicioBINTE.vue"),
		meta      : {
			guest  : true,
			whoCan : [0,545],
			layout       : MainLayout
		}
	},
	{
		path      : "/preliminaresBINTE",
		name      : "preliminaresBINTE",
		component : () => import( /*webpackChunkName:"informes-preliminaresBINTE"*/ "@/views/information/PreliminaresBINTE.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},  
		{
		path      : "/incidentesBINTE",
		name      : "incidentesBINTE",
		component : () => import( /*webpackChunkName:"informes-incidentesBINTE"*/ "@/views/information/IncidentesBINTE.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},	
		{
		path      : "/finalesBINTE",
		name      : "finalesBINTE",
		component : () => import( /*webpackChunkName:"finalesBINTE"*/ "@/views/information/FinalesBINTE.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},  
	{
		path      : "/usuarios",
		name      : "usuarios",
		component : () => import( /*webpackChunkName:"usuarios"*/ "@/views/base/Usuarios.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
		{
		path      : "/tipoGrupoIncidente",
		name      : "tipoGrupoIncidente",
		component : () => import( /*webpackChunkName:"tipoGrupoIncidente"*/ "@/views/maintainers/TipoGrupoIncidente.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/tipoIncidente",
		name      : "tipoIncidente",
		component : () => import( /*webpackChunkName:"tipoIncidente"*/ "@/views/maintainers/TipoIncidente.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},	
	{
		path      : "/tipoIdentificacion",
		name      : "tipoIdentificacion",
		component : () => import( /*webpackChunkName:"tipoIdentificacion"*/ "@/views/maintainers/TipoIdentificacion.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},	
	{
		path      : "/tipoArmamento",
		name      : "tipoArmamento",
		component : () => import( /*webpackChunkName:"tipoArmamento"*/ "@/views/maintainers/TipoArmamento.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/tipoInvestigacion",
		name      : "tipoInvestigacion",
		component : () => import( /*webpackChunkName:"tipoInvestigacion"*/ "@/views/maintainers/TipoInvestigacion.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/tipoInterviniente",
		name      : "tipoInterviniente",
		component : () => import( /*webpackChunkName:"tipoInterviniente"*/ "@/views/maintainers/TipoInterviniente.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/tipoConsumo",
		name      : "tipoConsumo",
		component : () => import( /*webpackChunkName:"tipoConsumo"*/ "@/views/maintainers/TipoConsumo.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/tipoIngesta",
		name      : "tipoIngesta",
		component : () => import( /*webpackChunkName:"tipoIngesta"*/ "@/views/maintainers/TipoIngesta.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},	
	{
		path      : "/estadoSalud",
		name      : "estadoSalud",
		component : () => import( /*webpackChunkName:"estadoSalud"*/ "@/views/maintainers/EstadoSalud.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},	
	{
		path      : "/condicionPolicial",
		name      : "condicionPolicial",
		component : () => import( /*webpackChunkName:"condicionPolicial"*/ "@/views/maintainers/CondicionPolicial.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/indiceAlerta",
		name      : "indiceAlerta",
		component : () => import( /*webpackChunkName:"indiceAlerta"*/ "@/views/maintainers/IndiceAlerta.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},
	{
		path      : "/medidasAdoptadas",
		name      : "medidasAdoptadas",
		component : () => import( /*webpackChunkName:"medidasAdoptadas"*/ "@/views/maintainers/MedidasAdoptadas.vue"),
		meta	  : {
			requiresAuth : true,
			whoCan       : [545],
			layout       : MainLayout
		}
	},					
	/*
		👉 Inicio PME
	*/
	{
		path      : "/inicioPME",
		name      : "inicioPME",
		component : () => import( /*webpackChunkName:"inicio-PME"*/ "@/views/home/InicioPME.vue"),
		meta      : {
			guest  : true,
			whoCan : [0],
			layout       : MainLayout
		}
	},	
	{
		path      : "/preliminares",
		name      : "preliminares",
		component : () => import( /*webpackChunkName:"informes-preliminares"*/ "@/views/information/Preliminares.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [541],
			layout       : MainLayout
		}
	},
	{
		path      : "/boletin",
		name      : "boletin",
		component : () => import( /*webpackChunkName:"boletin"*/ "@/views/information/Boletin.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [541],
			layout       : MainLayout
		}
	},
/*
		👉 Inicio S2
*/
	{
		path      : "/inicioS2",
		name      : "inicioS2",
		component : () => import( /*webpackChunkName:"inicioS2"*/ "@/views/home/InicioS2.vue"),
		meta      : {
			guest  : true,
			whoCan : [0],
			layout       : MainLayout
		}
	},
	{
		path      : "/incidentesS2",
		name      : "incidentesS2",
		component : () => import( /*webpackChunkName:"incidentesS2"*/ "@/views/information/IncidentesS2.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [542],
			layout       : MainLayout
		}
	},
		{
		path      : "/finalesS2",
		name      : "finalesS2",
		component : () => import( /*webpackChunkName:"finalesS2"*/ "@/views/information/FinalesS2.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [542],
			layout       : MainLayout
		}
	},
	/*
		👉 Inicio Comandante
	*/
	{
		path      : "/inicioCDTE",
		name      : "inicioCDTE",
		component : () => import( /*webpackChunkName:"inicioCDTE"*/ "@/views/home/InicioCDTE.vue"),
		meta      : {
			guest  : true,
			whoCan : [0],
			layout       : MainLayout
		}
	},
	{
		path      : "/incidentesCDTE",
		name      : "incidentesCDTE",
		component : () => import( /*webpackChunkName:"incidentesCDTE"*/ "@/views/information/IncidentesCDTE.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [543],
			layout       : MainLayout
		}
	},	
	{
		path      : "/finalesCDTE",
		name      : "finalesCDTE",
		component : () => import( /*webpackChunkName:"finalesCDTE"*/ "@/views/information/FinalesCDTE.vue"),
		meta      : {
			requiresAuth : true,
			whoCan       : [543],
			layout       : MainLayout
		}
	},

/*
		👉 Reportes y Estadísticas
*/
	{
		path			: "/reportesEstadisticas",
		name			: "reportesEstadisticas",
		component : () => import( /*webpackChunkName:"reportesEstadisticas"*/ "@/views/statistics/ReportesEstadisticas.vue"),
		props     : (route) => ({
			tipoInforme: route.params.tipoInforme || "Preliminar"
		}),
		meta      : {
			requiresAuth : true,
			whoCan       : [541,542,543,545],
			layout       : MainLayout
		}
	},

/*
		👉 No autorizado
*/	
	{
		path      : "/",
		name      : "UnAuthorized",
				component : () => import( /*webpackChunkName:"login"*/ "@/views/UnAuthorized.vue"),
		meta      : {
			guest  : true,
			whoCan : [0],
			layout : MainLayout
		}
	},

	{
			// cualquier ruta que no esté registrada te devuelve al login.
		path: '/:pathMatch(.*)*',
		redirect: () => ({ name: 'login' }) 
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

router.beforeEach((to, from, next) => {
	const whoCan      = to.meta.whoCan;
	const currentUser = store.state.currentUser;
	if (to.meta.requiresAuth){
		if (currentUser) {
			if(whoCan.includes(parseInt(currentUser.Rol))) {
//Tiene acceso a la vista
				return next()
			}	else {
//No tiene acceso
				return next({ name: 'login' })
			}
		} else {
//Si no está logeado, expulsa al login.
			return next({ name: 'login' })
		}
	} else {
		//Si no requiere autenticación, continúa.
		return next()
	}
})

export default router