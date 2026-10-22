<template>
  <v-container fluid class="reports-statistics pa-4 pa-md-6" :class="{ 'reports-statistics--dark': $vuetify.theme.dark }">
    <v-row dense>
      <v-col cols="12" lg="5">
        <v-card class="stats-card" elevation="4" outlined>
          <div class="card-accent"></div>
          <v-card-title class="stats-title">Distribucion por Estado</v-card-title>
          <v-card-subtitle class="stats-subtitle">{{ subtitle_1 }}</v-card-subtitle>
          <v-divider class="mx-4"></v-divider>
          <v-card-text class="stats-content">
            <pie-chart
              v-if="showPieChart"
              :pie-chart-data-sets="pieChartDataSets"
              :pie-data-sets="pieDataSets"
            />
            <div v-else class="empty-state">
              <v-icon size="62" color="grey">mdi-database-off</v-icon>
              <p class="empty-state-text">No hay datos disponibles</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="stats-card" elevation="4" outlined>
          <div class="card-accent"></div>
          <v-card-title class="stats-title">Tipos de Incidentes  {{ new Date().getFullYear() }}</v-card-title>
          <v-card-subtitle class="stats-subtitle">{{ subtitle_2 }}</v-card-subtitle>
          <v-divider class="mx-4"></v-divider>
          <v-card-text class="stats-content">
            <bar-chart
              v-if="showBarChart"
              :bar-chart-data-sets="barChartDataSets"
              :bar-data-sets="barDataSets"
            />
            <div v-else class="empty-state">
              <v-icon size="62" color="grey">mdi-database-off</v-icon>
              <p class="empty-state-text">No hay datos disponibles</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import router         from "@/router";
  import { mapActions } from "vuex"
  import pieChart       from "@/components/charts/pieChart.vue";
  import barChart       from "@/components/charts/barChart.vue";

  export default {
    name       : "estadisticaPreliminares",
    components : {
      pieChart,
      barChart,
    },
    data       : () => ({
      pieChartDataSets   : { series : [], chartOptions : { labels : [], colors : ['#4caf50', '#ff5252'], } },
      pieDataSets        : [],                                           
      showPieChart       : false, 

      barChartDataSets   : {
        series       : [],
        chartOptions : {
          labels      : {},
          colors      : [],
          plotOptions : {
            bar : { horizontal : true,  }
          },
          xaxis       : { categories : [], },
          yaxis       : { max    : 100, }
        }
      },
      barDataSets        : [],
      showBarChart       : false,                        

      showInformes       : false,
      dataItem           : [],
      totalPreliminares  : 0,                                                                      

      breadcrumItems       : [ { text: 'Inicio', disabled: true, href: `/inicio` }, ],
      isDarkTheme          : false,
      subtitle_1           : '',
      subtitle_2           : '',
    }),
    async mounted() {            
      let   resp
      try {
        resp = await this.getEstadisticasPreliminaresPublicadosNoPublicados();
        if ( resp.status == '403' ) {
          router.push({ name: "UnAuthorized" });
        } else {
          this.dataItem                             = resp.data;               
          this.totalPreliminares                    = this.dataItem.series.reduce((a,b) => a + b, 0)                
          this.pieDataSets                          = this.dataItem.listado ;
          this.pieChartDataSets.chartOptions.labels = this.dataItem.label  ;
          this.pieChartDataSets.series              = this.dataItem.series ;
          this.showPieChart                         = this.totalPreliminares  > 0 ? true : false 
          this.subtitle_1                           = `Actualmente tiene ${this.totalPreliminares} informes preliminares ingresados en su turno.`          
        }
      } catch (error) {
        console.error('Error al obtener estadísticas de distribución:', error);
      }
      try {
        resp = await this.getEstadisticasPreliminaresPorTipoIncidente({ agno : new Date().getFullYear()});                                    
        if ( resp.status == '403' ) {
          router.push({ name: "UnAuthorized" });
        } else {
          const max = Math.max(...resp.data.series)
          this.dataItem                                                 = resp.data;               
          this.totalPreliminares                                        = this.dataItem.series.reduce((a,b) => a + b, 0)
          this.barDataSets                                              = this.dataItem.listado ;
          this.barChartDataSets.series.name                             = 'Cantidad';                                                                  
          this.barChartDataSets.chartOptions.yaxis.max                  =  max < 10 ? 10 : max
          this.barChartDataSets.chartOptions.xaxis.categories           = this.dataItem.label 
          this.barChartDataSets.chartOptions.colors                     = this.dataItem.colorBarra
          this.barChartDataSets.series.data                             = this.dataItem.series
          this.barChartDataSets.chartOptions.plotOptions.bar.horizontal = false;                                                      
          this.showBarChart                                             = this.totalPreliminares > 0 ? true : false 
          this.subtitle_2                                               = `Existen ${this.totalPreliminares} informes preliminares ingresados en el año.`
        }
      } catch (error) {
        console.error('Error al obtener estadísticas por tipo de incidente:', error);
      }
    },
    methods    : {
    ...mapActions("estadisticaPreliminaresStore" , [ "getEstadisticasPreliminaresPublicadosNoPublicados", "getEstadisticasPreliminaresPorTipoIncidente" ] )    , 
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

@media (max-width: 960px) {
  .stats-content {
    min-height: 290px;
  }
}

.reports-statistics--dark {
  background: linear-gradient(180deg, #202426 0%, #292e30 100%);
}

.reports-statistics--dark .stats-card {
  border-color: #45494d;
  background: #242628;
  color: #d4d8dc;
}

.reports-statistics--dark .stats-title {
  color: #e2e7eb;
}

.reports-statistics--dark .stats-subtitle {
  color: #bac3ca;
}

.reports-statistics--dark ::v-deep .v-divider {
  border-color: #45494d;
}

.reports-statistics--dark .empty-state {
  color: #bac3ca;
}

.reports-statistics--dark .empty-state-text {
  color: #bac3ca;
}

.reports-statistics--dark ::v-deep .pie-chart-shell,
.reports-statistics--dark ::v-deep .bar-chart-shell {
  background: #242628;
}

.reports-statistics--dark ::v-deep .stats-content .v-card {
  background: transparent !important;
}

.reports-statistics--dark ::v-deep .chart-frame {
  border-color: #45494d;
  background: #242628;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
</style>