<template>
  <bar-chart
    v-if="showBarChart"
    :bar-chart-data-sets="barChartDataSets"
    :bar-data-sets="barDataSets"
  />
  <div v-else class="empty-state">
    <v-icon size="62" color="grey">mdi-database-off</v-icon>
    <p class="empty-state-text">No hay datos disponibles</p>
  </div>
</template>
<script>
  import { mapActions } from "vuex"
  import barChart       from "@/components/charts/barChart.vue";

  export default {
    name       : "incidentesPorGrupoDeTipoIncidente",
    components : {
      barChart
    },
    props      : {
      agno     : { type: Number, required: true },
      idUnidad : { type: String, required: true }
    },     
    data       : () => ({
      barChartDataSets : { series : [], chartOptions : { labels : {},	colors : [],	plotOptions : {	bar : { horizontal : true, } },	xaxis : { categories : [], },	yaxis : { max : 100, } } },
      barDataSets      : [],
      showBarChart     : false,  
      subtitle         : '',
    }),
    watch      : {
      subtitle(newSubtitle) {
        this.$emit('update-subtitle', newSubtitle || '');
      },
      idUnidad(newIdUnidad) {
        this.getData(this.agno,newIdUnidad);
      },
      agno(newAgno) {
        this.getData(newAgno, this.idUnidad);
      }
    },
    async mounted() {
      this.$emit('update-subtitle', this.subtitle || '');
      this.getData(this.agno, this.idUnidad);

    },
    methods: {

      async getData(agno, idUnidad) {
      let   resp
      try {
        resp = await this.getEstadisticasIncidentesPorGrupoDeTipoIncidente({ agno, idUnidad }); 
        if ( resp.status == '403' ) {
          router.push({ name: "UnAuthorized" });
        } else {
          const max = Math.max(...resp.data.series)
          this.dataItem                                                 = resp.data;               
          this.totalIncidentes                                          = this.dataItem.series.reduce((a,b) => a + b, 0)
          this.barDataSets                                              = this.dataItem.listado ;
          this.barChartDataSets.series.name                             = 'Cantidad';                                                                  
          this.barChartDataSets.chartOptions.yaxis.max                  =  max < 10 ? 10 : max
          this.barChartDataSets.chartOptions.xaxis.categories           = this.dataItem.label 
          this.barChartDataSets.chartOptions.colors                     = this.dataItem.colorBarra
          this.barChartDataSets.series.data                             = this.dataItem.series
          this.barChartDataSets.chartOptions.plotOptions.bar.horizontal = false;                                                      
          this.showBarChart                                             = this.totalIncidentes > 0 ? true : false 
          this.subtitle                                                 = `Existen ${this.totalIncidentes} incidentes en el año ${agno}.`
        }
      } catch (error) {
        console.error('Error al obtener estadísticas de distribución:', error);
      }
      },
      ...mapActions("estadisticaIncidentesStore" , [	"getEstadisticasIncidentesPorGrupoDeTipoIncidente", ]),
    },                   
  };
</script>
