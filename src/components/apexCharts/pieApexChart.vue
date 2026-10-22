<template>
	<v-container fluid class="pie-chart-shell pa-0">
		<div class="chart-frame">
			<apexchart v-if="hasChartData" type="pie" height="450" :options="computedChartOptions" :series="computedSeries" @dataPointSelection ="handleDataPointSelection"></apexchart>
			<div v-else class="empty-state">
				<v-icon size="56" color="grey">mdi-database-off</v-icon>
				<p class="empty-state-text">No hay datos disponibles</p>
			</div>
		</div>
			<v-dialog scrollable v-model="showInformes" max-width="1500">
				<v-card>
					<v-card-title class="dialog-title" :style="{ borderLeft: `4px solid ${selectedLabelColor}` }"> Informes {{this.selectedLabelName}} </v-card-title>
					<v-card-text>
						<v-container fluid>
							<v-row class="d-flex">
								<v-col cols="12">
									<v-data-table
										:headers      = "headers"
										:items        = "this.informes"
										:footer-props = "{ 'items-per-page-text':'informes por página'}"
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
			pieChartDataSets : {
				type    : Object,
				required: true,
			},
			pieDataSets      : {
				type    : Array,
				required: false,
				default : () => [],
			},
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
				if (!Array.isArray(this.pieChartDataSets?.series)) {
					return [];
				}
				return this.pieChartDataSets.series
					.map(value => (Number.isFinite(Number(value)) ? Number(value) : 0));
			},
			safeLabels() {
				const baseLabels = Array.isArray(this.pieChartDataSets?.chartOptions?.labels) ? this.pieChartDataSets.chartOptions.labels : [];
				return this.computedSeries.map((_, index) => baseLabels[index] || `Item ${index + 1}`);
			},
			safeColors() {
				const baseColors = Array.isArray(this.pieChartDataSets?.chartOptions?.colors) ? this.pieChartDataSets.chartOptions.colors : [];
				return this.computedSeries.map((_, index) => baseColors[index] || '#90a4ae');
			},
			hasChartData() {
				return this.computedSeries.length > 0;
			},
			computedChartOptions() {
				return {
					chart      : {
						type                 : 'pie',
						fontFamily           : 'Roboto, sans-serif',
						redrawOnParentResize : true,
						redrawOnWindowResize : false,
						animations           : {
							enabled          : true,
							easing           : 'easeinout',
							speed            : 750,
							animateGradually : { enabled : true, delay : 80 }
						},
						events               : {
							dataPointMouseEnter: function (event, chartContext, config) {
								document.querySelectorAll(".apexcharts-series").forEach( e => { e.style.cursor = 'pointer'; } );
							}
						}
					},
					labels     : this.safeLabels,
					colors     : this.safeColors,
					stroke     : {
						show   : true,
						colors : ['#ffffff'],
						width  : 2,
					},
					states     : {
						hover  : { filter : { type : 'none' } },
						active : { filter : { type : 'none' } },
					},
					dataLabels : {
						enabled : true,
						style   : { fontSize: '12px', fontWeight: '700', colors : ['#263238'] },
						dropShadow : { enabled : false },
						formatter: (percentage, opts) => {
							const safePercentage = Number.isFinite(Number(percentage)) ? Number(percentage) : 0;
							const safeSeries = Array.isArray(opts?.w?.config?.series) ? opts.w.config.series : [];
							const safeIndex = Number.isInteger(opts?.seriesIndex) ? opts.seriesIndex : -1;
							const quantity = Number.isFinite(Number(safeSeries[safeIndex])) ? Number(safeSeries[safeIndex]) : 0;
							return `${quantity} (${safePercentage.toFixed(1)}%)`;
						},
					},                       
					tooltip    : {
						enabled : true,
						theme   : 'light',
						style   : { fontSize : '12px'},
						y      : {
							formatter: (value, opts) => {
								const indexFromSeries = Number.isInteger(opts?.seriesIndex) ? opts.seriesIndex : -1;
								const indexFromPoint = Number.isInteger(opts?.dataPointIndex) ? opts.dataPointIndex : -1;
								const activeIndex = indexFromSeries >= 0 ? indexFromSeries : indexFromPoint;

								const baseSeries = Array.isArray(this.computedSeries) ? this.computedSeries : [];
								const optionSeries = Array.isArray(opts?.w?.config?.series) ? opts.w.config.series : [];
								const numericValue = Number.isFinite(Number(baseSeries[activeIndex]))
									? Number(baseSeries[activeIndex])
									: (Number.isFinite(Number(optionSeries[activeIndex]))
										? Number(optionSeries[activeIndex])
										: (Number.isFinite(Number(value)) ? Number(value) : 0));

								const total = baseSeries.reduce((sum, item) => sum + (Number.isFinite(Number(item)) ? Number(item) : 0), 0);
								const percentage = total > 0 ? ((numericValue / total) * 100).toFixed(1) : '0.0';
								return `${numericValue} informes (${percentage}%)`;
							},
						},
					},                       
					responsive  : [ {
						breakpoint : 960,
						options    : {
							chart      : { width : '100%' },
							legend     : { position : 'bottom', horizontalAlign : 'center' },
							dataLabels : { style : { fontSize : '11px' } }
						}
					} ],
					plotOptions : {
						pie : {
							expandOnClick : false,
							offsetY       : 4,
							dataLabels : {
								offset : -24,
							},
						},
					},                        
					legend      : {
						show       : true,
						fontSize   : '12px',
						fontFamily : 'Roboto, sans-serif',
						fontWeight : 500,
						position   : 'top',
						horizontalAlign : 'left',
						itemMargin : { horizontal : 10, vertical : 4 },

						},                        
					};        
			},
		},        
		methods    : {
			handleDataPointSelection(event, chartContext, config) {
				const index             = config?.dataPointIndex ?? -1;
				this.informes           = Array.isArray(this.pieDataSets?.[index]) ? this.pieDataSets[index] : [];
				this.selectedLabelName  = this.safeLabels[index] || '';
				this.selectedLabelColor = this.safeColors[index] || '#000000';
				this.showInformes       = true;
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
	}
</script>
		
		<style scoped>
		.pie-chart-shell {
			background    : linear-gradient(180deg, rgba(245, 248, 252, 0.65) 0%, #ffffff 100%);
			border-radius : 14px;
		}

		.chart-frame {
			background    : #ffffff;
			border        : 1px solid #edf1f5;
			border-radius : 12px;
			padding       : 12px 12px 0;
			box-shadow    : 0 8px 24px rgba(38, 50, 56, 0.06);
		}

		.dialog-title {
			font-weight : 700;
			font-size   : 1rem;
			color       : #263238;
			padding-left: 12px;
		}

		.reports-table :deep(th) {
			font-weight : 700;
			color       : #37474f;
		}

		.empty-state {
			height          : 450px;
			display         : flex;
			align-items     : center;
			justify-content : center;
			flex-direction  : column;
			gap             : 8px;
			color           : #757575;
		}

		.empty-state-text {
			margin     : 0;
			font-size  : 0.82rem;
			color      : #757575;
		}
		</style>