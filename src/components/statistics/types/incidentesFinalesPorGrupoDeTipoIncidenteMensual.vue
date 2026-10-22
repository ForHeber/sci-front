<template>
  <heatmap-chart
    v-if="showHeatmapChart"
    :heatmap-chart-data-sets="heatmapChartDataSets"
    :heatmap-data-sets="heatmapDataSets"
  />
  <div v-else class="empty-state">
    <v-icon size="62" color="grey">mdi-database-off</v-icon>
    <p class="empty-state-text">No hay datos disponibles</p>
  </div>
</template>
<script>
  import { mapActions, mapGetters } from "vuex"
  import heatmapChart               from "@/components/charts/heatmapChart.vue";
  export default {
    name       : "incidentesFinalesPorGrupoDeTipoIncidenteMensual",
    components : {
      heatmapChart,
    },
    props   : {
      agno     : { type: Number, required: true },
      idUnidad : { type: String, required: true }
    },      
    data       : () => ({
      showHeatmapChart     : false,
      heatmapChartDataSets : {
        matchLabelColumnWidth : true,
        series       : [],
        height       : 350,
        chartOptions : {
          colors : [],
          xaxis  : {
            position   : 'top',
            categories : [],
            labels     : {
              rotate       : 0,
              rotateAlways : false,
              trim         : false,
              minHeight    : 100,
              maxHeight    : 180,
              offsetY      : 20,
              formatter(value) {
                return String(value == null ? '' : value).split(/\s+/).reduce((lines, word) => {
                  const lastLine = lines[lines.length - 1];
                  if (lastLine && `${lastLine} ${word}`.length <= 18) {
                    lines[lines.length - 1] = `${lastLine} ${word}`;
                  } else {
                    lines.push(word);
                  }
                  return lines;
                }, []);
              },
            },
          },
        },
      },
      heatmapDataSets      : [],
      subtitle             : '',      
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
        this.$emit('update-subtitle', this.subtitle || '');
        let resp
        try {
          resp = await this.getEstadisticasFinalesPorGrupoDeTipoIncidenteMensual({ agno, idUnidad });
          if ( resp.status == '403' ) {
            router.push({ name: "UnAuthorized" });
          } else {

            const grupos = resp.data.map(item => item.descripcioN_GRUPO);
            const colors = resp.data.map(item => item.coloR_GRUPO);

            const indicesSignificativos = grupos
              .map((_, idx) => {
                const sum = resp.data[idx].totaL_GRUPO.reduce((acc, mes) => {
                  const v = Number(mes.cantidaD_MES) || 0;
                  return acc + v;
                }, 0);
                return sum > 0 ? idx : null;
              })
              .filter(idx => idx !== null);
              
            // Columnas del heatmap + columna TOTAL
            const categoriesBase = indicesSignificativos.map(idx => grupos[idx]);
            const categories     = [...categoriesBase, 'TOTAL'];

            // Filas base con total por fila
            const meses = resp.data.length > 0 ? resp.data[0].totaL_GRUPO : [];
            const seriesBase = meses.map((mes, mesIdx) => {
              const rowData  = indicesSignificativos.map(idx => Number(resp.data[idx].totaL_GRUPO[mesIdx].cantidaD_MES) || 0);
              const rowTotal = rowData.reduce((a, b) => a + b, 0);
              return {
                name: mes.descripcioN_MES,
                data: [...rowData, rowTotal]
              };
            }).reverse();
            // Totales por columna (incluye total general al final)
            const columnTotals = indicesSignificativos.map((_, colPos) => {
              return seriesBase.reduce((acc, row) => acc + (Number(row.data[colPos]) || 0), 0);
            });
            const grandTotal = columnTotals.reduce((a, b) => a + b, 0);
            // Fila TOTAL
            const totalRow = {
              name: 'TOTAL',
              data: [...columnTotals, grandTotal]
            };
            const series = [totalRow,...seriesBase ];

            // Colores por columna: agrega color para columna TOTAL
            const selectedColors = colors.filter((_, idx) => indicesSignificativos.includes(idx));
            const heatmapColors = [...selectedColors,'#000' ]; // color TOTAL

            // Mapa de colores para leyenda: asigna grupos a colores
            this.colorMap = indicesSignificativos.reduce((acc, idx) => {
              const color = colors[idx];
              if (!acc[color]) {
                acc[color] = [];
              }
              acc[color].push(grupos[idx]); 
              return acc;
            }, {});
            this.heatmapChartDataSets.chartOptions.xaxis.categories = categories;
            this.heatmapChartDataSets.chartOptions.xaxis.position   = 'top'
            this.heatmapChartDataSets.series                        = series
            this.heatmapChartDataSets.chartOptions.colors           = heatmapColors;
            this.heatmapChartDataSets.height                        = Math.max(350, series.length * 35);
            this.showHeatmapChart                                   = indicesSignificativos.length > 0;  
            this.title                                              = `Hay ${grandTotal} Incidentes Finales por Grupo de Tipo de Incidente Mensual`;
          
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          this.showHeatmapChart = false;
        }
      },
      ...mapActions("estadisticaFinalesStore", ["getEstadisticasFinalesPorGrupoDeTipoIncidenteMensual"]),      
    },
  }

</script>