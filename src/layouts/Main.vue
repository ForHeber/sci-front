<template>
  <div>
    <v-app v-if="currentUser"> 
      <v-navigation-drawer v-if="drawerLeft" permanent expand-on-hover clipped app>
        <v-list dense>
          
          <template v-for="(item, itemIndex) in items">
            
            <v-row v-if="item.heading" :key="item.heading">
              <v-col cols="12">
                <v-divider />
              </v-col>           
            </v-row>
            
            <!-- Link con sub menú -->
            <v-list-group
              v-else-if="item.children.length > 0 && item.rol.includes(parseInt(currentUser.Rol))"
              :key="item.text"
              :prepend-icon="item.icon"
              :value="false"
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item v-for="(child, i) in item.children.filter(ch => ch.rol.includes(parseInt(currentUser.Rol)))" :key="i" :to="child.route" class="paddingCustom">
                <v-list-item-action v-if="child.icon">
                  <v-icon small class="pl-1">{{ child.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
            
            <!-- Link Normal -->
            <v-list-item v-else-if="item.rol.includes(parseInt(currentUser.Rol))" :key="`menu-item-${itemIndex}`" :to="item.route">
              <v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar clipped-left short flat color="primaryBanner" dark app>
        <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
        <v-img
          :src="logo"
          max-height="50"
          max-width="50"
          contain
        />
        <v-toolbar-title class="ml-0 pl-4">
          <span class="hidden-md-and-up">{{ siglaSistema }}</span>
          <span class="hidden-sm-and-down">{{ nombreSistema }}</span>
        </v-toolbar-title>
        
        <v-spacer />

        <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn 
              class="hidden-sm-and-down" 
              icon 
              @click="toggleTheme"
              v-on="on"
            >
              <v-icon>
                mdi-theme-light-dark
              </v-icon>
            </v-btn>
                    </template>
                    <span>Cambiar tema Oscuro/Brillante</span>
                </v-tooltip>
      
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn 
              class="hidden-sm-and-down" 
              icon 
              @click="dialogInstructivo=!dialogInstructivo"
              v-on="on"
            >
              <v-icon>
                mdi-help-circle
              </v-icon>
            </v-btn>
          </template>
          <span>Instructivo del Sistema</span>
        </v-tooltip>

        <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn 
              class="hidden-sm-and-down" 
              icon 
              @click="dialogSegundoFactor=!dialogSegundoFactor"
              v-on="on"
            >
              <v-icon>
                mdi-target-account
              </v-icon>
            </v-btn>
                    </template>
                    <span>Segundo Factor de Autenticación</span>
                </v-tooltip>

        <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
            <v-chip 
              class="hidden-sm-and-down"
              @click="logout(null)"
              v-on="on"
            >
              {{ currentUser ? currentUser.Nombres: '' }}
              <v-icon small class="ml-2">
                mdi-logout
              </v-icon>
            </v-chip>
                    </template>
                    <span>Salir del Sistema</span>
                </v-tooltip>
      
        <v-menu bottom origin="center center" transition="scale-transition" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn class="hidden-md-and-up" icon v-on="on">
              <v-icon>
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><b>{{ currentUser ? currentUser.Nombres: '' }}</b></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="toggleTheme">
              Tema
              <v-spacer />
              <v-icon class="mr-2">
                mdi-theme-light-dark
              </v-icon>
            </v-list-item>
            <v-list-item @click="dialogInstructivo=!dialogInstructivo">
              Instructivo
              <v-spacer />
              <v-icon class="mr-2">
                mdi-help-circle
              </v-icon>
            </v-list-item>
            <v-list-item @click="dialogSegundoFactor=!dialogSegundoFactor">
               2FA
               <v-spacer />
               <v-icon class="mr-2">
                 mdi-target-account
               </v-icon>
             </v-list-item>						
            <v-list-item @click="logout(null)">
              Cerrar Sesión
              <v-spacer />
              <v-icon class="mr-2">
                mdi-logout
              </v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-main :class="drawerLeft ? 'v-main' : 'v-main-no-menu'">
        <router-view :key="$route.path" />
      </v-main>

    </v-app>

    <v-layout row justify-center>
      
      <v-dialog 
        v-model="dialogExtendSesion" 
        persistent 
        :max-width="$vuetify.breakpoint.mdAndUp ? '40vw' : '95vw'"
      >
        <v-card>
          <v-card-title class="primary white--text">
            Control de seguridad
          </v-card-title>
          <v-card-text class="text-center">
            <h3 class="my-4">Su sesión está a punto de expirar, desea continuar?</h3>
            <h3>
              <v-icon>
                mdi-alarm
              </v-icon> 
              Tiempo restante: 
              <countdown 
                v-if="dialogExtendSesion" 
                :segundos="10"
                @finish="enviarALogin('Sesión expirada por inactividad.')"
              />
            </h3>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              outlined
              color="secondary" 
              @click.native="enviarALogin('Sesión cerrada por el Usuario.')"
            >
              Cerrar sesión
            </v-btn>
            <v-btn 
              color="primary"
              @click.native="extenderSesion"
            >
              Continuar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <v-dialog v-model="dialogInstructivo" width="90vw" heigt="80vh">
        <v-card>
          <v-card-title class="primary">
            <span class="text-h5 white--text">Instructivo</span>
            <v-spacer />
            <v-btn 
              icon
              dark
              size="x-small"
              class="float-end ma-2"
              @click="dialogInstructivo=!dialogInstructivo"
              >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <embed v-if="instructivo != ''" :src="instructivo" type="" frameborder="0" width="100%" height="1000px">
            <p v-else><br>Nada que mostrar :(</p>
          </v-card-text>
        </v-card>
      </v-dialog>
      <segundo-factor
         v-if="dialogSegundoFactor"
         :show="dialogSegundoFactor" 
         @close="dialogSegundoFactor=false"
       />
    </v-layout>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import countdown                  from "@/components/base/countdown"
import SegundoFactor              from "@/components/base/segundoFactor"

export default {
  props      : {
    source: String,
  },
  components : {
    countdown    ,
    SegundoFactor,
  },
  data       : () => ({
    dialog              : false,
    dialogCarpro        : false,
    dialogInstructivo   : false,
    dialogSegundoFactor : false,		
    drawer              : null,
    isDarkTheme         : false,
/*
  Parámetros del Sistema
*/		
    logo               : '/sci.png', 
    instructivo        : '/Instructivo_SCI_1Fase.pdf',
    nombreSistema      : 'Sistema Control de Incidentes', 
    siglaSistema       : 'SCI',
/*
  Menú lateral
*/	
    items              : [
/*	BINTE */
      {
        icon     :"mdi-home",
        route    : "/inicioBINTE",
        text     : "Inicio",
        rol      : [545, 0],
        children : []
      },	
      {
      
        icon     : 'mdi-file-document-alert-outline',
        route    : '/preliminaresBINTE',
        text     : "Preliminares",
        rol      : [545, 0],
        children : []
      },        
      {
        icon: 'mdi-file-replace-outline',
        route: '/incidentesBINTE',
        text: "Incidentes",
        rol: [545, 0],
        children: []
      },			
      {
        icon     : 'mdi-file-sign',
        route    : '/finalesBINTE',
        text     : "Finales",
        rol      : [545, 0],
        children : []
      },      
      {
        icon     : 'mdi-chart-bar-stacked',
        route    : { name: 'reportesEstadisticas', params: { tipoInforme: 'BINTE' } },
        text     : "Reportes y Estadísticas",
        rol      : [545, 0],
        children : []
      },								
      {
        heading: 'config',
      },
      {
        icon     : 'mdi-account-circle',
        route    : '/usuarios',
        text     : "Usuarios",
        rol      : [545, 0],
        children : []
      },
      {
        icon     : 'mdi-cog',
        route    : '/administracion',
        text     : "Administración",
        rol      : [545],
        children : [
        {
          icon     : 'mdi-folder-alert-outline',
          route    : '/tipoGrupoIncidente',
          text     : "Grupos de Tipos de Incidentes",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-alert-outline',
          route    : '/tipoIncidente',
          text     : "Tipos de Incidentes",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-card-account-details-outline',
          route    : '/tipoIdentificacion',
          text     : "Tipos de Identificación",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-pistol',
          route    : '/tipoArmamento',
          text     : "Tipos de Armamentos",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-text-box-search-outline',
          route    : '/tipoInvestigacion',
          text     : "Tipos de Investigación",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-gavel',
          route    : '/tipoInterviniente',
          text     : "Tipos de Intervinientes",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-cannabis',
          route    : '/tipoConsumo',
          text     : "Tipos de Consumo",
          rol      : [545],
          children : []
        },	
        {
          icon     : 'mdi-liquor',
          route    : '/tipoIngesta',
          text     : "Tipos de Ingesta",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-hospital-box-outline',
          route    : '/estadoSalud',
          text     : "Estados de Salud",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-account-tie-hat',
          route    : '/condicionPolicial',
          text     : "Condiciones Policiales",
          rol      : [545],
          children : []
        },															
        {
          icon     : 'mdi-clock-alert-outline',
          route    : '/indiceAlerta',
          text     : "Índices de Alerta",
          rol      : [545],
          children : []
        },
        {
          icon     : 'mdi-clipboard-check-outline',
          route    : '/medidasAdoptadas',
          text     : "Medidas Adoptadas",
          rol      : [545],
          children : []
        }
        ]
      },				
/*  PME */			
      {
        icon     :"mdi-home",
        route    : "/inicioPME",
        text     : "Inicio PME",
        rol      : [541, 0],
        children : []
      },			
      {
        icon     : 'mdi-file-document-alert-outline',
        route    : '/preliminares',
        text     : "Preliminares",
        rol      : [541, 0],
        children : []
      },	
      {
        icon     : 'mdi-file-clock-outline',
        route    : '/boletin',
        text     : "Boletín",
        rol      : [541, 0],
        children : []
      },		
      {
        icon     : 'mdi-chart-bar-stacked',
        route    : { name: 'reportesEstadisticas', params: { tipoInforme: 'Preliminar' } },
        text     : "Reportes y Estadísticas",
        rol      : [541, 0],
        children : []
      },		
/*	S-2 */			
      {
        icon     :"mdi-home",
        route    : "/inicioS2",
        text     : "Inicio | S-2",
        rol      : [542, 0],
        children : []
      },
      {
        icon     : 'mdi-file-replace-outline',
        route    : '/incidentesS2',
        text     : "Incidentes",
        rol      : [542, 0],
        children : []
      },
      {
        icon: 'mdi-file-sign',
        route: '/finalesS2',
        text: "Finales",
        rol: [542, 0],
        children: []
      },
      {
        icon     : 'mdi-chart-bar-stacked',
        route    : { name: 'reportesEstadisticas', params: { tipoInforme: 'Incidente' } },
        text     : "Reportes y Estadísticas",
        rol      : [542, 0],
        children : []
      },		
/*	Comandante */			
      {
        icon     :"mdi-home",
        route    : "/inicioCDTE",
        text     : "Inicio | Comandate",
        rol      : [543, 0],
        children : []
      },
      {
        icon     : 'mdi-file-replace-outline',
        route    : '/incidentesCDTE',
        text     : "Incidentes",
        rol      : [543, 0],
        children : []
      },			
      {
        icon     : 'mdi-file-sign',
        route    : '/finalesCDTE',
        text     : "Finales",
        rol      : [543, 0],
        children : []
      },
      {
        icon     : 'mdi-chart-bar-stacked',
        route    : { name: 'reportesEstadisticas', params: { tipoInforme: 'Final' } },
        text     : "Reportes y Estadísticas",
        rol      : [543, 0],
        children : []
      },						
              
    ],
    dialogExtendSesion : false,
    countdown          : null,
    sesionTime         : null,
    sesionRefresh      : null,
  }),
  computed   : {
    ...mapGetters(['currentUser','drawerLeft']),    
  },
  mounted() {
    document.addEventListener('mousemove', this.keepLogged);//"escucha" cuando se mueve el puntero del mouse para mantener la sesión activa
    document.addEventListener('keypress', this.keepLogged);//"escucha" cuando se presiona una tecla del teclado para mantener la sesión activa
    
    this.Refresh();//inicializando refresh del token
    this.keepLogged();//inicializando la evaluación de actividad del usuario
  },
  unmounted() {
    document.removeEventListener('mousemove', this.keepLogged);
    document.removeEventListener('keypress', this.keepLogged);
  },
  methods   : {
    ...mapActions(["logout", "refreshToken"]),
    
    enviarALogin(mensaje){
      clearTimeout(this.sesionRefresh);
      clearTimeout(this.sesionTime);
      
      this.dialogExtendSesion = false;
      this.logout(mensaje);
    },
    
    extenderSesion(){
      this.refreshToken().then(() => {
        this.Refresh();
        this.keepLogged();
        
        this.dialogExtendSesion = false;
      });
    },
    
    Refresh() {
      //console.log('Refresh');
      if(this.currentUser) {
        clearTimeout(this.sesionRefresh);
        this.sesionRefresh = setTimeout(() => {
          this.refreshToken();
          this.Refresh();
        }, 1000 * 60 * 3);//en 5 minutos refresca la sesión
      }
    },
    
    keepLogged() {
      //console.log('keepLogged');
      if(this.currentUser) {
        clearTimeout(this.sesionTime);
        this.sesionTime = setTimeout(() => {
          this.dialogExtendSesion = true;
        }, 1000 * 60 * 9); // 1000 * 60 * 9 en 9 minutos levanta modal para controlar la actividad
      }
    },

    toggleTheme() {
            this.isDarkTheme = !this.isDarkTheme
            this.$vuetify.theme.dark = this.isDarkTheme
        }
  }
};
</script>

<style scoped>
  .v-list-group__items .v-list-group__items, .v-list-group__items .v-list-item {
    overflow: hidden;
    padding-left: 40px;
  }
  .paddingCustom {
    padding: 0 16px !important;
  }
  .v-main {
    padding: 56px 0px 0px 70px !important;
  }
  .v-main-no-menu {
    padding: 56px 0px 0px 0px !important;
  }
</style>
