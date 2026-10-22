<template>
	<v-container fluid class="pie-chart-shell pa-0">
		<div class="chart-frame">
			<apexchart type="line" :height="height" :options="computedChartOptions" :series="computedSeries" @dataPointSelection="handleDataPointSelection"></apexchart>
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
		components : {
			apexchart: VueApexCharts,
		},
		props      : {
			timelineChartDataSets : {
				type    : Object,
				required: true,
			},
      height : {
        type    : Number,
        required: false,
        default : 450,
      },
			timelineDataSets      : []
		},
		data() {
			return {
				selectedLabelColor : '#000000', 
				selectedLabelName  : '',
				showInformes       : false,
				informes           : [],
				headers            : [
					{ text: "Id"                , value: "id"                        , groupable: false, sortable: false },
					{ text: "Tipo incidente"    , value: "tipO_INCIDENTE.descripcion", groupable: false, sortable: false },      
					{ text: "Fecha y hora"      , value: "fechA_HECHO"               , groupable: false, sortable: false },
					{ text: "Circunstancias"    , value: "circunstanciA_HECHO"       , groupable: false, sortable: false },
					{ text: "Unidad responsable", value: "u_AFECTADA.sigla"          , groupable: false, sortable: false },
				],
			}
		},
		computed   :{
			computedSeries() {
        return [{ name: this.timelineChartDataSets.series.name, data: this.timelineChartDataSets.series.data}] 
			},
      computedChartOptions() {
        const vm = this;
        const sourceChartOptions = this.timelineChartDataSets?.chartOptions || {};
        const sourceChart = sourceChartOptions.chart || {};
        const sourceXaxis = sourceChartOptions.xaxis || {};
        const es = {
          "name"    : "es",
          "options" : { 
            "months"      : [ "Enero", "Febrero", "Marzo"     , "Abril"  , "Mayo"     , "Junio",
                              "Julio", "Agosto" , "Septiembre", "Octubre", "Noviembre", "Diciembre" ] ,
            "shortMonths" : [ "Ene"  , "Feb"    , "Mar"       , "Abr"    , "May"      , "Jun"  ,
                              "Jul"  , "Ago"    , "Sep"       , "Oct"    , "Nov"      , "Dic" ],
            "days"        : [ "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ],
            "shortDays"   : [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],    
            "toolbar"     : { "exportToSVG" : "Descargar SVG", "exportToPNG"   : "Descargar PNG",
                              "exportToCSV" : "Descargar CSV", "menu"          : "Menu",
                              "selection"   : "Seleccionar"  , "selectionZoom" : "Seleccionar Zoom",
                              "zoomIn"      : "Aumentar"     , "zoomOut"       : "Disminuir",
                              "pan"         : "Navegación"   , "reset"         : "Reiniciar Zoom"
                            }
          }
        }

        return {
					...sourceChartOptions,
          chart       : {
							...sourceChart,
            type                 : 'line',
            locales              : [ es ],
            defaultLocale        : 'es',
            background           : 'transparent',
            foreColor            : '#4b5563',
            height               : 'auto',
            width                : '100%',
            toolbar              : { show: false },
            redrawOnParentResize : true,
            redrawOnWindowResize : false,
            zoom                 : { enabled : false},
						events               : {
              dataPointSelection: function (event, chartContext, config) {
                vm.handleDataPointSelection(event, chartContext, config);
              },
              markerClick: function (event, chartContext, config) {
                vm.handleDataPointSelection(event, chartContext, config);
              },
							dataPointMouseEnter: function (event, chartContext, config) {
								document.querySelectorAll(".apexcharts-series").forEach( e => { e.style.cursor = 'pointer'; } );
							}
						}          
          },
          colors      : ['#0f766e'],
          plotOptions : {
            bar : {
              horizontal   : true,
              borderRadius : 2,
              barHeight    : '80%',
            },
          },
          dataLabels  : {
            offsetX   : 0,
            offsetY   : -6,
            style     : {
              fontSize   : '10px',
              fontFamily : 'Roboto, sans-serif',
              fontWeight : '600',
              colors     : ['#fff'],
            },
            background : {
              enabled      : true,
              foreColor    : '#0f172a',
              borderRadius : 8,
              padding      : 6,
              opacity      : 0.8,
              borderWidth  : 0,
              borderColor  : '#ffffff'
            },
            color          : '#fff',
            formatter : function (value, opt) {
              if ( Array.isArray(value) ) {
                let   rango = ''
                const diff  = Math.floor((value[1] - value[0]) / 86400000);                           
                const data  = opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
                if ( data != undefined ) {
                  const fechaDesde = new Date(opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex].y[0])
                  const fechaHasta = new Date(opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex].y[1])
                  rango = ' '    + new Intl.DateTimeFormat("es-CL",{ day:'numeric', month:'short', year:'numeric'}).format(fechaDesde.setMinutes(fechaDesde.getMinutes() + fechaDesde.getTimezoneOffset())).toUpperCase() + 
                          ' al ' + new Intl.DateTimeFormat("es-CL",{ day:'numeric', month:'short', year:'numeric'}).format(fechaHasta.setMinutes(fechaHasta.getMinutes() + fechaHasta.getTimezoneOffset())).toUpperCase()  
                }             
                const label = diff + (diff > 1 ? ' días' : ' día') + rango
                return label.length > diff ? label.substring(0,15) + '...' : label
              } else {
                return value
              }
            },            
          },
          stroke      : { curve : 'smooth', width : 1} ,
          markers     : {
            size         : 5,
            colors       : ['#0f766e'],
            strokeColors : '#ffffff',
            strokeWidth  : 2,
            hover        : { size: 7 },
          },
          xaxis       : {
            ...sourceXaxis,
            categories : sourceXaxis.categories || [],
            type       : 'datetime',
            axisBorder : { show: false },
            axisTicks  : { show: false },
            labels     : {
              datetimeUTC       : false,
              style             : { colors   : '#6b7280', fontSize : '11px',  },
              datetimeFormatter : {
                year  : 'yyyy',
                month : 'MMM yyyy',
                day   : 'dd MMM'
              },
            }
          },
          yaxis       : {
            labels : {
              style : {
                colors   : '#6b7280',
                fontSize : '11px',
              },
            },
          },
          tooltip     : {
            shared    : false,
            intersect : true,
          },
          fill        : {
            type     : 'gradient',
            gradient : { shade : 'light', type  : 'vertical', },
          },
          grid        : {
            borderColor : '#e5e7eb',
								xaxis : { lines : { show : false } },
            yaxis       : { lines : { show : true } },
            strokeDashArray : 4,
            padding        : { top : 8, right : 12, left : 6, bottom : 4 },
							},
          states      : {
            normal : { filter : { type : 'none' } },
            hover  : { filter : { type : 'darken', value : 0.75 } },
            active : { allowMultipleDataPointsSelection : false, filter : { type : 'none' } },
          },          
          legend      : {
            show                : false,
            showForSingleSeries : true,
            markers             : { shape      : 'circle', }
          }
        };
      },
    },
		methods    : {
			handleDataPointSelection(event, chartContext, config) {
				const index             = config?.dataPointIndex ?? -1;
        if (index < 0) {
          return;
        }
        const selectedPoint      = this.computedSeries?.[0]?.data?.[index];
				this.informes           = Array.isArray(this.timelineDataSets?.[index]) ? this.timelineDataSets[index] : [];
        this.selectedLabelName  = this.getSelectedDateLabel(selectedPoint, index, config);
				this.showInformes       = true;
			},    
      getSelectedDateLabel(point, index, config) {
        if (point && Array.isArray(point.y) && point.y.length >= 2) {
          const from = this.getShortDate(point.y[0]);
          const to = this.getShortDate(point.y[1]);
          return `${from} al ${to}`;
        }

        const configCategories = Array.isArray(config?.w?.config?.xaxis?.categories)
          ? config.w.config.xaxis.categories
          : [];
        const propCategories = Array.isArray(this.timelineChartDataSets?.chartOptions?.xaxis?.categories)
          ? this.timelineChartDataSets.chartOptions.xaxis.categories
          : [];

        const rawDate = point?.x ?? configCategories[index] ?? propCategories[index];
        if (rawDate !== undefined && rawDate !== null && rawDate !== '') {
          return this.getShortDate(rawDate);
        }

        return 'Fecha no disponible';
      },
      getShortDate(value) {
        let normalizedValue = value;
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          const ddmmyyyyMatch = trimmedValue.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);

          if (ddmmyyyyMatch) {
            const day = Number(ddmmyyyyMatch[1]);
            const month = Number(ddmmyyyyMatch[2]) - 1;
            const year = Number(ddmmyyyyMatch[3]);
            normalizedValue = new Date(year, month, day);
          } else if (/^\d+$/.test(trimmedValue)) {
            normalizedValue = Number(trimmedValue);
          }
        }

        const date = new Date(normalizedValue);
        if (Number.isNaN(date.getTime())) {
          return 'Fecha no disponible';
        }
        return new Intl.DateTimeFormat('es-CL', {
          day   : '2-digit',
          month : 'short',
          year  : 'numeric',
        }).format(date).toUpperCase();
      },
			getFormatDateTime(datetime) {
				const date = new Date(datetime)
				const formatedDateTime =	[	(date.getDate()).toString().padStart(2, "0"),
																		(date.getMonth() + 1).toString().padStart(2, "0"),
																		date.getFullYear(),
																	].join('/') + 
																	"\n"        + 
																	[	date.getHours().toString().padStart(2, "0"),
																		date.getMinutes().toString().padStart(2, "0"),
																		date.getSeconds().toString().padStart(2, "0"),
																	].join(":")
				return formatedDateTime
			},        
    }
  };
  </script>
  <style scoped>
.chart-frame {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 12px 12px 8px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.chart-frame :deep(.apexcharts-canvas) {
  margin: 0 auto;
}

.chart-frame :deep(.apexcharts-tooltip) {
  border: 1px solid #dbe3ea;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  border-radius: 10px;
}

.chart-frame :deep(.apexcharts-tooltip-title) {
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
}
</style>
  