<template>
  <timeline-apex-chart
    v-if="showTimelineChart"
    :timeline-chart-data-sets="timelineChartDataSets"
    :timeline-data-sets="timelineDataSets"
  />
  <div v-else class="empty-state">
    <v-icon size="62" color="grey">mdi-database-off</v-icon>
    <p class="empty-state-text">No hay datos disponibles</p>
  </div>
</template>
<script>
  import { mapActions }    from "vuex"
  import timelineApexChart from "@/components/charts/timelineChart.vue";

  export default {
    name       : "incidentesFinalesPorFecha",
    components : {
      timelineApexChart
    },
    props      : {
      agno     : { type: Number, required: true },
      idUnidad : { type: String, required: true }
    },     
    data       : () => ({
      timelineChartDataSets : { series : [ { name : '', data : [] } ], chartOptions : { xaxis : { categories: [] } }, },
      showTimelineChart     : false, 
      subtitle              : '',
      timelineDataSets      : [],
    }),
    watch      : {
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
      this.getData(this.agno, this.idUnidad);

    },
    methods    : {
      async getData(agno, idUnidad) {
        this.$emit('update-subtitle', this.subtitle || '');
        let resp
        try {
          resp = await this.getEstadisticasFinalesPorFecha({ agno , idUnidad });
          if ( resp.status == '403' ) {
            router.push({ name: "UnAuthorized" });
          } else {
          this.dataItem                                            = resp.data;               
          let categories                                           = this.dataItem.label.map((label) => {
            let fechaArray = label.split('-')
            let dia  = Number(fechaArray[0])
            let mes  = Number(fechaArray[1]) - 1
            let agno = Number(fechaArray[2])
            return new Date(agno, mes, dia).getTime()
          })
          this.totalIncidentes                                     = this.dataItem.series.reduce((a,b) => a + b, 0)                
          this.timelineDataSets                                    = this.dataItem.listado;
          this.timelineChartDataSets.series.name                   = 'Cantidad de incidentes';
          this.timelineChartDataSets.series.data                   = this.dataItem.series
          this.timelineChartDataSets.chartOptions.xaxis.categories = categories
          this.showTimelineChart                                   = this.totalIncidentes > 0 ? true : false 
          this.subtitle                                            = `Cantidad de ${this.totalIncidentes} incidentes en el año ${new Date().getFullYear()}.`
          }
      } catch (error) {
        console.error('Error al obtener estadísticas por fecha:', error);
      }			
    },
    ...mapActions("estadisticaFinalesStore" , [	"getEstadisticasFinalesPorFecha", ]),
  },                   
};
</script>
