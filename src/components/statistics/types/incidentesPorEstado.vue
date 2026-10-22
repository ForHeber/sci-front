<template>
  <pie-chart
    v-if="showPieChart"
    :pie-chart-data-sets="pieChartDataSets"
    :pie-data-sets="pieDataSets"
  />
  <div v-else class="empty-state">
    <v-icon size="62" color="grey">mdi-database-off</v-icon>
    <p class="empty-state-text">No hay datos disponibles</p>
  </div>
</template>
<script>
  import { mapActions, mapGetters } from "vuex"
  import pieChart                   from "@/components/charts/pieChart.vue";

  export default {
    name       : "incidentesPorEstado",
    components : {
      pieChart,
    },
    props   : {
      agno     : { type: Number, required: true },
      idUnidad : { type: String, required: true }
    },        
    data       : () => ({
      pieChartDataSets      : { series : [], chartOptions : { labels : [], colors : ['#2196f3','#4caf50','#ff5252','#e0e0e0','#bdbdbd' ], } },
      pieDataSets           : [],                                           
      showPieChart          : false, 
      subtitle              : '',
    }),
        computed   : {
      ...mapGetters(['currentUser']), 
    },
    watch: {
      subtitle(newSubtitle) {
        this.$emit('update-subtitle', newSubtitle || '');
      },
      agno(newAgno) {
        this.getData(newAgno, this.idUnidad);
      },
      idUnidad(newIdUnidad) {
        this.getData(this.agno, newIdUnidad);
      }
    },   
    async mounted() {
      this.$emit('update-subtitle', this.subtitle || '');
      this.getData(this.agno, this.idUnidad);

    },     
    methods    : {
      async getData(agno, idUnidad) {
        let resp;        
        try {
          resp = await this.getListEstadisticasIncidentesPorEstados({ agno , idUnidad });
          if ( resp.status == '403' ) {
            router.push({ name: "UnAuthorized" });
          } else {
            this.dataItem                             = resp.data;               
            this.totalIncidentes                      = this.dataItem.series.reduce((a,b) => a + b, 0)                
            this.pieDataSets                          = this.dataItem.listado ;
            this.pieChartDataSets.chartOptions.labels = this.dataItem.label  ;
            this.pieChartDataSets.series              = this.dataItem.series ;
            this.showPieChart                         = this.totalIncidentes  > 0 ? true : false 
            this.subtitle                             = `A la fecha se encuentran ${this.totalIncidentes} incidentes en la unidad.`
          }
        } catch (error) {
          console.error('Error al obtener estadísticas de distribución:', error);
        }
      },
      ...mapActions("estadisticaIncidentesStore", [  "getListEstadisticasIncidentesPorEstados",] )    , 
    },
  }
</script>

