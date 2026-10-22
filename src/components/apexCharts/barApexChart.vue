<template>
  <v-container fluid class="bar-chart-shell pa-0">
    <div class="chart-frame">
      <barchart v-if="hasChartData" type="bar" :height="height" :options="computedChartOptions" :series="computedSeries" @dataPointSelection ="handleDataPointSelection"> </barchart>
      <div v-else class="empty-state">
        <v-icon size="56" color="grey">mdi-database-off</v-icon>
        <p class="empty-state-text">No hay datos disponibles</p>
      </div>
    </div>
    <v-dialog scrollable v-model="showInformes" max-width="1500">
      <v-card>
        <v-card-title class="dialog-title" > {{this.selectedLabelName}} </v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-row class="d-flex">
              <v-col cols="12">
                <v-data-table
                  :headers      = "headers"
                  :items        = "this.informes"
                  :footer-props = "{ 'items-per-page-text':'informes por página', 'pageText': '{0}-{1} de {2}' }"
                  class="reports-table"
                >
                  <template v-slot:item.fechA_HECHO = "{ item }">
                    {{ getFormatDateTime(item.fechA_HECHO) }} 
                  </template>              
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="showInformes = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>       
  </v-container>
</template>
    
<script>
  import VueApexCharts from "vue-apexcharts";
  export default {
    name       : "barApexchart",
      components : {
        barchart: VueApexCharts,
      },
      props      :{
        barChartDataSets : {
          type    : Object,
          required: true,
        },
        barDataSets      : [],
      },
      data() {
        return {
          selectedLabelColor : '#000000', 
          selectedLabelName  : '',
          showInformes   : false,
          height         : 450, 
          informes       : [],
          headers        : [
            { text: "Id"                , value: "id"                 , groupable: false, sortable: false },
            { text: "Fecha y hora"      , value: "fechA_HECHO"        , groupable: false, sortable: false },
            { text: "Circunstancias"    , value: "circunstanciA_HECHO", groupable: false, sortable: false },
            { text: "Unidad responsable", value: "u_AFECTADA.sigla"   , groupable: false, sortable: false },
          ],
        }
    },
    computed   :{
      computedSeries() {
        const source = this.barChartDataSets?.series?.data;
        const safeData = Array.isArray(source)
          ? source.map(value => (Number.isFinite(Number(value)) ? Number(value) : 0))
          : [];
        return [
          {
            name : this.barChartDataSets?.series?.name || 'Cantidad',
            data : safeData,
          }
        ];
      },
      safeCategories() {
        const sourceCategories = Array.isArray(this.barChartDataSets?.chartOptions?.xaxis?.categories)
          ? this.barChartDataSets.chartOptions.xaxis.categories
          : [];
        return this.computedSeries[0].data.map((_, index) => sourceCategories[index] || `Item ${index + 1}`);
      },
      safeColors() {
        const sourceColors = Array.isArray(this.barChartDataSets?.chartOptions?.colors)
          ? this.barChartDataSets.chartOptions.colors
          : [];
        if (sourceColors.length === 0) {
          // Allow ApexCharts default palette when no custom colors are provided.
          return undefined;
        }
        return this.computedSeries[0].data.map((_, index) => sourceColors[index]);
      },
      hasChartData() {
        return this.computedSeries[0].data.length > 0;
      },            
      computedChartOptions() {
        const safeHorizontal = Boolean(this.barChartDataSets?.chartOptions?.plotOptions?.bar?.horizontal);
        const safeYMax = Number.isFinite(Number(this.barChartDataSets?.chartOptions?.yaxis?.max))
          ? Number(this.barChartDataSets.chartOptions.yaxis.max)
          : 10;
        return {
          ...(this.barChartDataSets?.chartOptions || {}), 
          chart       : {
            height               : 'auto', 
            width                : '100%',
            offsetX              : 0,
            offsetY              : 0,
            type                 : 'bar',
            fontFamily           : 'Roboto, sans-serif',
            toolbar              : { show: false },
            animations           : {
              enabled       : true,
              easing        : 'easeinout',
              speed         : 700,
              animateGradually : { enabled : true, delay : 60 },
              dynamicAnimation : { enabled : true, speed : 280 }
            },
            redrawOnParentResize : true,
            redrawOnWindowResize : false,
            events               : {
              mounted: function (chartContext, config) {
                document.querySelectorAll(".apexcharts-bar-area").forEach( e => { e.style.cursor = 'pointer'; } );
              }
            }
          },
          colors      : this.safeColors,
          plotOptions : {
            bar : {
              dataLabels               :  { position : 'top', },
              horizontal               : safeHorizontal,
              borderRadius             : 6,
              borderRadiusApplication  : 'end',
              columnWidth              : '42%',
              barHeight                : '30%',
              endingShape              : 'rounded',
              distributed              : true ,
            },
          },
          xaxis       : {
            categories  : this.safeCategories,
            labels      : {
              rotate                : -45,
              rotateAlways          : true,
              hideOverlappingLabels : true,
              trim                  : true,
              style                 : {
                fontSize   : '11px',
                fontWeight : 500,
                colors     : '#455a64',
              },
              maxHeight             : 150
            },
            offsetX       : 0,
            offsetY       : 0,
            axisBorder    : {
              show    : true,
              color   : '#78909c',
              height  : 1,
              width   : '100%',
              offsetX : 0,
              offsetY :0
            },
            axisTicks      : {
              show       : true,
              borderType : 'solid',
              color      : '#78909c',
              height     : 6,
              offsetX    : 0,
              offsetY    :0,
            }
          }, 
          yaxis       : {
            max         : safeYMax,
            labels      : {
              style        : { fontSize : '12px', colors : ['#37474f'], fontWeight : '500', },
              maxWidth     : 400,
              overflow     : 'auto',
              textOverflow : 'clip',
              whiteSpace   : 'nowrap',
            },
            axisBorder  : {
              show : true,
              color: '#78909c',
              offsetX : 0,
              offsetY :0
            },         
            axisTicks   : {
              show       : true,
              borderType : 'solid',
              color      : '#78909c',
              height     : 6,
              offsetX    : 0,
              offsetY    : 0,
            }
          },        
          dataLabels  : {
            enabled   : true,
            offsetX   : 0,        
            offsetY   : -12,
            background: {
              enabled    : true,
              foreColor  : '#263238',
              padding    : 4,
              borderRadius : 3,
              opacity    : 0.86,
              borderWidth: 0,
            },
            style     : { fontSize: '11px', fontWeight : 600, colors: ['#ffffff'],},
            },
          tooltip     : {
            theme  : 'light',
            y      : {
              formatter: function (value) {
                return value + ' incidentes';
              }
            },
            marker : { show : false },
            x      : { show : true },
          },                    
          theme       : {
            mode       : 'light',
            palette    : 'palette1',
            monochrome : { enabled : false, color : '#255aee', shadeTo : 'light', shadeIntensity : 0.65 }
          },
          grid        : {
            show         : true,
            borderColor  : '#e6eaee',
            strokeDashArray: 3,
            row: { colors: ['#ffffff', '#fafcfe'], opacity: 0.7 },
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } },
            padding: { top: 10, right: 20, bottom: 0, left: 12 },
          },
          states      : {
            hover  : { filter : { type : 'none' } },
            active : { filter : { type : 'none' } },
          },
          legend      : {
            show        : false,
          },
          responsive  : [
            {
              breakpoint : 960,
              options    : {
                plotOptions : { bar : { columnWidth : '55%' } },
                xaxis       : { labels : { rotate : -35, maxHeight : 110 } },
                dataLabels  : { offsetY : -8 },
              }
            }
          ],
        };
      },            
    },
    methods    : {
      handleDataPointSelection(event, chartContext, config) {
        const index             = config?.dataPointIndex ?? -1;
        this.informes           = Array.isArray(this.barDataSets?.[index]) ? this.barDataSets[index] : [];
        this.selectedLabelName  = this.safeCategories[index] || '';
        this.showInformes       = true;
      },
      getFormatDateTime(datetime) {
        const date             = new Date(datetime)
        const formatedDateTime = [  (date.getDate()).toString().padStart(2, "0"),
                                    (date.getMonth() + 1).toString().padStart(2, "0"),
                                    date.getFullYear(),
                                    ].join('/') + 
                                    "\n"        + 
                                    [ date.getHours().toString().padStart(2, "0"),
                                    date.getMinutes().toString().padStart(2, "0"),
                                    date.getSeconds().toString().padStart(2, "0"),
                                    ].join(":")
        return formatedDateTime
      },             
    }
  };
</script>
    
    <style scoped>
    .bar-chart-shell {
      background    : linear-gradient(180deg, rgba(245, 248, 252, 0.65) 0%, #ffffff 100%);
      border-radius : 14px;
    }

    .chart-frame {
      background    : #ffffff;
      border        : 1px solid #edf1f5;
      border-radius : 12px;
      padding       : 10px 10px 0;
      box-shadow    : 0 8px 24px rgba(38, 50, 56, 0.06);
    }

    .dialog-title {
      font-weight : 700;
      font-size   : 1rem;
      color       : #263238;
    }

    .reports-table :deep(th) {
      font-weight : 700;
      color       : #37474f;
    }

    .empty-state {
      height          : 400px;
      display         : flex;
      align-items     : center;
      justify-content : center;
      flex-direction  : column;
      gap             : 8px;
      color           : #757575;
    }

    .empty-state-text {
      margin    : 0;
      font-size : 0.82rem;
      color     : #757575;
    }
    </style>
    