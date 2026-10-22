<template>
  <v-container fluid class="reports-statistics pa-4 pa-md-6" :class="{ 'reports-statistics--dark': $vuetify.theme.dark }">
  <!-- Menú flotante -->    
    <v-btn
      fab
      color = "primary"
      ref   = "menuButton"      
      fixed
      dark
      bottom
      right

      @click="showMenu"
    >
      <v-icon>mdi-chart-box-multiple</v-icon>
    </v-btn>
    <v-menu
      v-model                 = "menu"
      :close-on-content-click = "false"
      :position-x             = "x"      
      :position-y             = "y"
      offset-y
      absolute
      transition              = "slide-y-transition"
    >
    
      <v-card :class="{ 'chart-menu--dark': $vuetify.theme.dark }" style="background-color: #fafafa;">
        <v-card-title style="font-size: 16px; font-weight: 400;">
          <div class="d-flex justify-center align-center mr-2 " style="background-color: #b71c1c ; border-radius: 50%; width:40px; height: 40px;">
            <v-icon color="white">mdi-chart-box-multiple</v-icon> 
          </div> 
          Seleccione los gráficos que desea visualizar
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-0">
          <v-checkbox style="font-size: 12px;"
            v-for="chart in charts"
            :key         = "chart.id"
            :label       = "chart.name"
            :value       = "chart.id"
            :input-value = "selectedCharts.includes(chart.id)"
            v-model      = "selectedCharts"
            color       = "#2196f3"
            hide-details
            dense
          />
        </v-card-text> 
        <v-card-actions>
          <v-btn
            outlined  
            rounded
            text
            color        ="primary"
            ref          ="closeButton"            
            @click="menu = false"

          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>  

<!-- Gráficos -->
    <div v-if="selectedCharts.length > 0">
      <v-row dense>
        <v-col cols="12"
          v-for="(id, idx) in selectedChartsSort" :key ="id" :lg  ="getChartById(id).lg"
        >
        <v-card class="stats-card" elevation="4" outlined>
          <div class="card-accent"></div>						
            <v-card-title class="stats-title">{{ getChartById(id).name }}</v-card-title>
            <v-card-subtitle class="stats-subtitle">{{ getChartById(id).subtitle }}</v-card-subtitle>
            <v-divider class="mx-4"></v-divider>
            <v-card-text class="stats-content"> 
              <component
                :is              = "componentsCharts[id]"
                :checkbox-value  = "selected[id]"
                :tipoInforme     = "tipoInforme"
                :agno            = "agno"
                idUnidad         = "0"
                @update-subtitle = "updateChartSubtitle(id, $event)"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>	 
  </v-container>
</template>

<script>
  import { mapGetters }                                  from "vuex"
  import cantidadPorGrupoDeTipoIncidentes                from "@/components/statistics/types/cantidadPorGrupoDeTipoIncidentes.vue";
  import CantidadPorTipoIncidentes                       from "@/components/statistics/types/CantidadPorTipoIncidentes.vue";
  import cantidadIncidenteAccidente                	 		 from "@/components/statistics/types/cantidadIncidenteAccidente.vue";	
  import cantidadPersonaUnidad	                         from "@/components/statistics/types/cantidadPersonaUnidad.vue";
  import incidentesBINTEPorTipoIngesta                   from "@/components/statistics/types/incidentesBINTEPorTipoIngesta.vue";
  import incidentesBINTEPorTipoIdentificacion            from "@/components/statistics/types/incidentesBINTEPorTipoIdentificacion.vue";
  import incidentesBINTEPorTipoArmamento                 from "@/components/statistics/types/incidentesBINTEPorTipoArmamento.vue";  
  import cantidadArmamentoFiscalParticular               from "@/components/statistics/types/cantidadArmamentoFiscalParticular.vue";
  import incidentesPorTipoInvestigacion                  from "@/components/statistics/types/incidentesPorTipoInvestigacion.vue";

  import incidentesPorEstado                             from "@/components/statistics/types/incidentesPorEstado.vue";
  import incidentesPorTipoIncidente                      from "@/components/statistics/types/incidentesPorTipoIncidente.vue";
  import incidentesPorFecha                              from "@/components/statistics/types/incidentesPorFecha.vue";
  import incidentesPorGrupoDeTipoIncidente               from "@/components/statistics/types/incidentesPorGrupoDeTipoIncidente.vue";
  import incidentesPorGrupoDeTipoIncidenteMensual        from "@/components/statistics/types/incidentesPorGrupoDeTipoIncidenteMensual.vue";

  import incidentesFinalesPorEstado                      from "@/components/statistics/types/incidentesFinalesPorEstado.vue";
  import incidentesFinalesPorTipoIncidente               from "@/components/statistics/types/incidentesFinalesPorTipoIncidente.vue";
  import incidentesFinalesPorFecha                       from "@/components/statistics/types/incidentesFinalesPorFecha.vue";
  import incidentesFinalesPorGrupoDeTipoIncidente        from "@/components/statistics/types/incidentesFinalesPorGrupoDeTipoIncidente.vue";
  import incidentesFinalesPorGrupoDeTipoIncidenteMensual from "@/components/statistics/types/incidentesFinalesPorGrupoDeTipoIncidenteMensual.vue";

  export default {
    name       : "estadisticaBINTE",
    components : {
      cantidadPorGrupoDeTipoIncidentes               ,
      CantidadPorTipoIncidentes                      ,
      cantidadIncidenteAccidente                     ,
      cantidadPersonaUnidad                          ,
      incidentesBINTEPorTipoIngesta                  ,
      incidentesBINTEPorTipoIdentificacion           ,
      incidentesBINTEPorTipoArmamento                ,
      cantidadArmamentoFiscalParticular              ,
      incidentesPorTipoInvestigacion                 ,
      incidentesPorEstado                            ,
      incidentesPorTipoIncidente                     ,
      incidentesPorFecha                             ,
      incidentesPorGrupoDeTipoIncidente              ,
      incidentesPorGrupoDeTipoIncidenteMensual       ,
      incidentesFinalesPorEstado                     ,
      incidentesFinalesPorTipoIncidente              ,
      incidentesFinalesPorFecha                      ,
      incidentesFinalesPorGrupoDeTipoIncidente       ,
      incidentesFinalesPorGrupoDeTipoIncidenteMensual,
    },
    props   : {
      tipoInforme : { type: String, required: true },
      agno        : { type: Number, required: true }
    },    
    data() {
      return {
      showInformes    : false,
      dataItem        : [],
      totalIncidentes : 0,
      isDarkTheme     : false,
/*
  - menu: Boolean para controlar la visibilidad del menú flotante.
  - x, y: Posición del menú flotante basado en la posición del botón. 
*/                
      menu            : false,                                
      x               : 0,
      y               : 0,      
/*
  - charts          : Lista de gráficos disponibles con sus propiedades como id, nombre, tamaño (lg) y checkbox opcional.
  - selectedCharts  : Lista de IDs de gráficos que están seleccionados por defecto.
  - componentsCharts: Mapeo de IDs de gráficos a sus componentes Vue correspondientes.
  - selected        : Objeto para manejar el estado de los checkboxes de los gráficos.
*/
      charts          : [ 
        { id:  1 , name: 'Cantidad de Incidentes y Accidentes'               , lg: 4, subtitle: '' },
        { id:  2 , name: 'Incidentes que afecten a la Persona o Unidad'      , lg: 4, subtitle: '' },        
        { id:  3 , name: 'Desgloce por Tipo de Ingesta'                      , lg: 4, subtitle: '' },        
        { id:  4 , name: 'Comparativa por Tipo de Identificación'            , lg: 4, subtitle: '' },
        { id:  5 , name: 'Proporción de incidentes por Tipo de Armamento'    , lg: 4, subtitle: '' },
        { id:  6, name: 'Cantidad de Incidentes con arma Fiscal o Particular', lg: 4, subtitle: '' },
        { id:  7 , name: 'Incidentes por Tipo de Investigación'              , lg: 4, subtitle: '' },        
        { id:  8 , name: 'Distribución por Estado'                           , lg: 4, subtitle: '' },
        { id:  9 , name: 'Incidentes por Tipo de Incidente'                  , lg: 4, subtitle: '' },
        { id: 10 , name: 'Incidentes por Fecha'                              , lg: 4, subtitle: '' },
        { id: 11 , name: 'Incidentes por Grupo de Tipo de Incidente'         , lg: 4, subtitle: '' }, 
        { id: 12 , name: 'Incidentes por Grupo de Tipo de Incidente Mensual' , lg: 8, subtitle: '' },
      ],
      selectedCharts  : [  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12 ], 
      selected        : {},      


      };
    },
    computed   : {
      componentsCharts() {
        return {
        1: 'cantidadIncidenteAccidente'          ,
        2: 'cantidadPersonaUnidad'               ,
        3: 'incidentesBINTEPorTipoIngesta'       ,
        4: 'incidentesBINTEPorTipoIdentificacion',
        5: 'incidentesBINTEPorTipoArmamento'     ,
        6: 'cantidadArmamentoFiscalParticular'   ,        
        7: 'incidentesPorTipoInvestigacion'      ,
        8:  this.tipoInforme === 'I' ? 'incidentesPorEstado'                      : 'incidentesFinalesPorEstado',
        9:  this.tipoInforme === 'I' ? 'incidentesPorTipoIncidente'               : 'incidentesFinalesPorTipoIncidente',
        10: this.tipoInforme === 'I' ? 'incidentesPorFecha'                       : 'incidentesFinalesPorFecha',
        11: this.tipoInforme === 'I' ? 'incidentesPorGrupoDeTipoIncidente'        : 'incidentesFinalesPorGrupoDeTipoIncidente',
        12: this.tipoInforme === 'I' ? 'incidentesPorGrupoDeTipoIncidenteMensual' : 'incidentesFinalesPorGrupoDeTipoIncidenteMensual',
        };
      },
/*
  - selectedChartsSort: Computa los gráficos seleccionados ordenados por su propiedad lg.
*/      
      selectedChartsSort() {
        return [...this.selectedCharts].sort((a, b) => {
          const chartA = this.charts.find(chart => chart.id === a);
          const chartB = this.charts.find(chart => chart.id === b);
          return (chartA && chartB) ? chartA.lg - chartB.lg : 0;
        });
      },				
      ...mapGetters(['currentUser']), 

    },
    async mounted() {  
    },
    methods    : {
      showMenu() {
        this.$nextTick(() => {
        const rect = this.$refs.menuButton.$el.getBoundingClientRect();
        this.x = rect.left + rect.width / 2;
        this.y = rect.top + window.scrollY 
        this.menu = true
        });
      },   
      updateChartSubtitle(id, subtitle) {
        const chart = this.getChartById(id);
        if (chart) {
          this.$set(chart, 'subtitle', subtitle || '');
        }
      },
      getChartById(id) {
        return this.charts.find(chart => chart.id === id) || {};
      },
    },
  }
</script>

<style scoped>
.reports-statistics {
  background: linear-gradient(180deg, rgba(243, 246, 250, 0.8) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 12px;
}

.stats-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.card-accent {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.14) 100%);
}

.stats-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.15px;
  padding-top: 14px;
}

.stats-subtitle {
  min-height: 24px;
  font-size: 0.85rem;
}

.stats-content {
  min-height: 330px;
  display: flex;
  align-items: center;
}

.empty-state {
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #757575;
}

.empty-state-text {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.2px;
}

.reports-statistics--dark {
  background: linear-gradient(180deg, #202426 0%, #292e30 100%);
}

.reports-statistics--dark .stats-card {
  border-color: #45494d;
  background: #242628;
  color: #d4d8dc;
}

.reports-statistics--dark .stats-title,
.reports-statistics--dark .empty-state-text {
  color: #e2e7eb;
}

.reports-statistics--dark .stats-subtitle,
.reports-statistics--dark .empty-state {
  color: #bac3ca;
}

.reports-statistics--dark ::v-deep .v-divider {
  border-color: #45494d;
}

.reports-statistics--dark ::v-deep .pie-chart-shell,
.reports-statistics--dark ::v-deep .bar-chart-shell,
.reports-statistics--dark ::v-deep .chart-frame {
  border-color: #45494d;
  background: #242628;
}

.reports-statistics--dark ::v-deep .stats-content .v-card {
  background: transparent !important;
}

.reports-statistics--dark ::v-deep .apexcharts-legend-text,
.reports-statistics--dark ::v-deep .apexcharts-text,
.reports-statistics--dark ::v-deep .apexcharts-xaxis-label,
.reports-statistics--dark ::v-deep .apexcharts-yaxis-label {
  fill: #d4d8dc !important;
  color: #d4d8dc !important;
}

.reports-statistics--dark ::v-deep .apexcharts-gridline,
.reports-statistics--dark ::v-deep .apexcharts-xaxis line,
.reports-statistics--dark ::v-deep .apexcharts-yaxis line {
  stroke: #45494d;
}

.reports-statistics--dark ::v-deep .apexcharts-tooltip {
  border-color: #45494d;
  background: #303438;
  color: #e2e7eb;
}

.reports-statistics--dark ::v-deep .apexcharts-tooltip-title {
  border-bottom-color: #45494d;
  background: #242628;
  color: #e2e7eb;
}

.reports-statistics--dark ::v-deep .kpi-card {
  border-color: #45494d;
  background: linear-gradient(145deg, #303438 0%, #242628 100%);
  color: #e2e7eb;
}

.chart-menu--dark {
  background-color: #242628 !important;
  color: #e2e7eb;
}

.chart-menu--dark ::v-deep .v-card__text,
.chart-menu--dark ::v-deep .v-card__actions,
.chart-menu--dark ::v-deep .v-label {
  color: #d4d8dc;
}

.chart-menu--dark ::v-deep .v-divider {
  border-color: #45494d;
}

</style>