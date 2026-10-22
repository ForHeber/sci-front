<template>
  <v-container fluid>
    <div class="heatmap-scroll">
      <apexchart type="heatmap" :width="computedWidth" :height="computedHeight" :options="computedChartOptions" :series="computedSeries"></apexchart>
    </div>
  </v-container>
</template>

<script>
  import VueApexCharts from "vue-apexcharts";
      
  export default {
    name: "heatmapApexchart",
    components: {
      apexchart: VueApexCharts,
    },
    props: {
      heatmapChartDataSets: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      labelSizedWidth: null,
      labelColumnWidth: null,
      labelFont: '12px Helvetica',
    }),
    computed: {
      computedWidth() {
        return this.heatmapChartDataSets.matchLabelColumnWidth && this.labelSizedWidth
          ? this.labelSizedWidth
          : '100%';
      },
      computedSeries() {
        return this.heatmapChartDataSets.series || []; 
      },
      nonTotalColorScaleBounds() {
        const series = this.computedSeries;
        if (!series.length) {
          return { min: null, max: null };
        }

        const totalRowByNameIndex = series.findIndex((row) => String(row?.name || '').trim().toUpperCase() === 'TOTAL');
        const totalRowIndex = totalRowByNameIndex >= 0 ? totalRowByNameIndex : series.length - 1;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        series.forEach((row, rowIndex) => {
          if (rowIndex === totalRowIndex) {
            return;
          }

          const data = Array.isArray(row?.data) ? row.data : [];
          const categories = (((this.heatmapChartDataSets || {}).chartOptions || {}).xaxis || {}).categories || [];
          const totalColByNameIndex = categories.findIndex((category) => String(category || '').trim().toUpperCase() === 'TOTAL');
          const totalColIndex = totalColByNameIndex >= 0 ? totalColByNameIndex : data.length - 1;

          data.forEach((point, colIndex) => {
            if (colIndex === totalColIndex) {
              return;
            }

            const rawValue = typeof point === 'number'
              ? point
              : point?.y ?? point?.value;
            const value = Number(rawValue);

            if (!Number.isFinite(value)) {
              return;
            }

            min = Math.min(min, value);
            max = Math.max(max, value);
          });
        });

        if (!Number.isFinite(min) || !Number.isFinite(max)) {
          return { min: null, max: null };
        }

        return { min, max };
      },
      computedChartOptions() {
        const chartOptions       = this.heatmapChartDataSets.chartOptions || {};
        const basePlotOptions    = chartOptions.plotOptions || {};
        const baseHeatmapOptions = basePlotOptions.heatmap || {};
        const baseColorScale     = baseHeatmapOptions.colorScale || {};
        const hasBounds          = Number.isFinite(this.nonTotalColorScaleBounds.min) && Number.isFinite(this.nonTotalColorScaleBounds.max);
        const axisLabels = (chartOptions.xaxis && chartOptions.xaxis.labels) || { rotate: 0 };

        return {
          ...chartOptions,
          chart       : {
            ...(chartOptions.chart || {}),
            type        : 'heatmap',
            toolbar     : { show: false },
            background  : 'transparent',
            redrawOnParentResize: true,
            redrawOnWindowResize: false,
            events      : {
              mounted: (chartContext) => {
                this.applyTotalStyles(chartContext);
                this.adjustColumnWidth(chartContext);
              },
              updated: (chartContext) => {
                this.applyTotalStyles(chartContext);
                this.adjustColumnWidth(chartContext);
              },
            },
          },
          stroke      : { width: 1, colors: ['#e0e0e0'] },
          plotOptions : { heatmap : {
                              useFillColorAsStroke : false,
                              ...baseHeatmapOptions,
                              colorScale           : {
                                ...baseColorScale,
                                inverse: true,
                                ...(hasBounds ? {
                                  min: this.nonTotalColorScaleBounds.min,
                                  max: this.nonTotalColorScaleBounds.max,
                                } : {}),
                              },
                            },
          },
          colors      : chartOptions.colors || [],
          xaxis       : { 
            categories  : (chartOptions.xaxis && chartOptions.xaxis.categories) || [],
            position    : (chartOptions.xaxis && chartOptions.xaxis.position) || 'bottom',
            labels      : this.heatmapChartDataSets.matchLabelColumnWidth && this.labelColumnWidth
              ? {
                ...axisLabels,
                formatter: (value) => this.wrapLabel(value, axisLabels.formatter),
              }
              : axisLabels,
          },
          yaxis       : { labels : { style : { fontSize: '13px', fontFamily: 'Arial',  } }, }, 
          legend      : { show   : false, },
          grid        : {
            show            : true,
            borderColor     : '#e0e0e0',
            strokeDashArray : 0,
            xaxis           : { lines: { show: true } },
            yaxis           : { lines: { show: true } }
          },
          dataLabels  : {
            enabled : true,
            style   : {
                fontSize   : '11px',
                fontWeight : 'lighter',
                colors     : ['#424242'],
            },
              formatter: function (val) {
                return val > 0 ? val : '';
              },
          },
        };
      },
      computedHeight() {
        return this.heatmapChartDataSets.height || 350;
      },
    },
    methods: {
      wrapLabel(value, formatter) {
        const formatted = formatter ? formatter(value) : String(value == null ? '' : value);
        const sourceLines = Array.isArray(formatted) ? formatted : [formatted];
        const context = document.createElement('canvas').getContext('2d');
        if (!context) { return formatted; }
        context.font = this.labelFont;
        const maxWidth = Math.max(1, this.labelColumnWidth - 8);
        const lines = [];
        sourceLines.forEach((sourceLine) => {
          let line = '';
          String(sourceLine).split(/\s+/).filter(Boolean).forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (context.measureText(candidate).width <= maxWidth) {
              line = candidate;
              return;
            }
            if (line) { lines.push(line); }
            line = '';
            for (const character of word) {
              if (line && context.measureText(line + character).width > maxWidth) {
                lines.push(line);
                line = '';
              }
              line += character;
            }
          });
          if (line) { lines.push(line); }
        });
        return lines;
      },
      adjustColumnWidth(chartContext) {
        if (!this.heatmapChartDataSets.matchLabelColumnWidth) { return; }

        const root = chartContext?.el;
        const globals = chartContext?.w?.globals;
        const columnCount = this.computedSeries[0]?.data?.length || 0;
        if (!root || !columnCount || !(globals?.gridWidth > 0)) { return; }

        const availableWidth = root.parentElement?.clientWidth;
        const label = root.querySelector('.apexcharts-xaxis-texts-g text');
        const context = document.createElement('canvas').getContext('2d');
        if (!availableWidth || !label || !context) { return; }
        this.labelFont = window.getComputedStyle(label).font || this.labelFont;
        context.font = this.labelFont;
        const xaxis = this.heatmapChartDataSets.chartOptions?.xaxis || {};
        let widestLabel = 0;
        (xaxis.categories || []).forEach((category) => {
          const formatted = xaxis.labels?.formatter ? xaxis.labels.formatter(category) : String(category);
          const lines = Array.isArray(formatted) ? formatted : [formatted];
          lines.forEach((line) => {
            widestLabel = Math.max(widestLabel, context.measureText(String(line)).width);
          });
        });
        if (!widestLabel) { return; }

        const columnWidth = Math.ceil(widestLabel) + 8;
        const axisWidth = globals.svgWidth - globals.gridWidth;
        const chartWidth = Math.min(availableWidth, Math.ceil(axisWidth + columnCount * columnWidth));
        const labelColumnWidth = Math.max(1, (chartWidth - axisWidth) / columnCount);
        if (this.labelColumnWidth === null || Math.abs(this.labelColumnWidth - labelColumnWidth) > 1) {
          this.labelColumnWidth = labelColumnWidth;
        }
        if (this.labelSizedWidth === null || Math.abs(this.labelSizedWidth - chartWidth) > 1) {
          this.labelSizedWidth = chartWidth;
        }
      },
/*
  - setBoldBlack : aplica estilos de texto en negrita y color negro a un nodo enviado por parametro 
  - Obtiene todos los grupos SVG que representan series del heatmap. 
  - Itera cada serie y su índice. 
  - Dentro de cada serie, selecciona los textos y rectángulos
  - Si el índice es el último, aplica setBoldBlack a los textos y para los rectángulos aplica fondo gris, 
    excepto el último con fondo blanco. (última fila de cada columna)
  - Para las demás series, Solo resalta el último texto de la fila.
  - El último rectángulo de la fila aplica fondo gris (última columna de cada fila)
*/        
      applyTotalStyles(chartContext) {
        const root = chartContext?.el || chartContext?.w?.globals?.dom?.baseEl;
        if (!root) { return; }

        const normalizeHexColor = (hexColor) => {
          if (typeof hexColor !== 'string') {
            return null;
          }

          let hex = hexColor.trim().replace('#', '');
          if (hex.length === 3) {
            hex = hex.split('').map((char) => char + char).join('');
          }

          if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
            return null;
          }

          return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
          };
        };

        const toHexColor = (rgb) => {
          const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
          const part = (value) => clamp(value).toString(16).padStart(2, '0');
          return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`;
        };

        const mixWithWhite = (hexColor, intensity) => {
          const rgb = normalizeHexColor(hexColor);
          if (!rgb) {
            return '#e0e0e0';
          }

          const t = Math.max(0, Math.min(1, Number.isFinite(intensity) ? intensity : 0));
          const minFill = 0.18;
          const ratio = minFill + (1 - minFill) * t;

          return toHexColor({
            r: 255 - (255 - rgb.r) * ratio,
            g: 255 - (255 - rgb.g) * ratio,
            b: 255 - (255 - rgb.b) * ratio,
          });
        };

        const sourceSeries = Array.isArray(this.computedSeries) ? this.computedSeries : [];
        const totalRowByNameIndex = sourceSeries.findIndex((row) => String(row?.name || '').trim().toUpperCase() === 'TOTAL');
        const totalRowIndex = totalRowByNameIndex >= 0 ? totalRowByNameIndex : sourceSeries.length - 1;
        const columnCount = sourceSeries[0]?.data?.length || 0;
        const categories = (((this.heatmapChartDataSets || {}).chartOptions || {}).xaxis || {}).categories || [];
        const totalColByNameIndex = categories.findIndex((category) => String(category || '').trim().toUpperCase() === 'TOTAL');
        const totalColIndex = totalColByNameIndex >= 0 ? totalColByNameIndex : columnCount - 1;

        const baseColors = ((this.heatmapChartDataSets.chartOptions || {}).colors || []).slice();
        const fallbackColor = '#1565c0';
        const normalizeColorKey = (color, colIndex) => String(color || `col-${colIndex}`).trim().toUpperCase();
        const colorStats = {};

        sourceSeries.forEach((row, rowIndex) => {
          if (rowIndex === totalRowIndex) {
            return;
          }

          const rowData = Array.isArray(row?.data) ? row.data : [];
          for (let colIndex = 0; colIndex < columnCount; colIndex += 1) {
            if (colIndex === totalColIndex) {
              continue;
            }

            const rawValue = rowData[colIndex];
            const value = Number(typeof rawValue === 'number' ? rawValue : rawValue?.y ?? rawValue?.value);
            if (!Number.isFinite(value)) {
              continue;
            }

            const colorKey = normalizeColorKey(baseColors[colIndex], colIndex);
            if (!colorStats[colorKey]) {
              colorStats[colorKey] = {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
              };
            }

            colorStats[colorKey].min = Math.min(colorStats[colorKey].min, value);
            colorStats[colorKey].max = Math.max(colorStats[colorKey].max, value);
          }
        });
      
        const setBoldBlack = (node) => {
          if (!node) { return; }
          node.style.fill       = '#424242';
          node.style.fontWeight = '750';
          
        };

        const seriesGroups = root.querySelectorAll('.apexcharts-series.apexcharts-heatmap-series');
        seriesGroups.forEach((seriesGroup, seriesIndex) => {
          const textNodes = seriesGroup.querySelectorAll('text');
          const rectNodes = seriesGroup.querySelectorAll('rect');

          const dataRowIndex = sourceSeries.length - 1 - seriesIndex;
          const isTotalRow = dataRowIndex === totalRowIndex;

          rectNodes.forEach((rectNode, colIndex) => {
            const isTotalCol = colIndex === totalColIndex;
            if (isTotalRow || isTotalCol) {
              rectNode.style.fill = isTotalRow && isTotalCol ? '#eeeeee' : '#ffffff';
              rectNode.style.opacity = '1';
              return;
            }

            const rowData = Array.isArray(sourceSeries[dataRowIndex]?.data) ? sourceSeries[dataRowIndex].data : [];
            const rawValue = rowData[colIndex];
            const value = Number(typeof rawValue === 'number' ? rawValue : rawValue?.y ?? rawValue?.value);
            if (!Number.isFinite(value)) {
              return;
            }

            const colorKey = normalizeColorKey(baseColors[colIndex], colIndex);
            const stats = colorStats[colorKey] || {};
            const min = Number(stats.min);
            const max = Number(stats.max);
            const intensity = Number.isFinite(min) && Number.isFinite(max)
              ? (max > min ? (value - min) / (max - min) : 1)
              : 0;

            const baseColor = baseColors[colIndex] || fallbackColor;
            rectNode.style.fill = mixWithWhite(baseColor, intensity);
            rectNode.style.opacity = '1';
          });

          if (isTotalRow) {
            textNodes.forEach(setBoldBlack);
            return;
          }

          if (totalColIndex >= 0) {
            setBoldBlack(textNodes[totalColIndex]);
          }

          const totalRect = totalColIndex >= 0 ? rectNodes[totalColIndex] : null;
          if (totalRect) {
            totalRect.style.fill = '#fff';
            totalRect.style.opacity = '1';
          }
        });

          root.querySelectorAll('.apexcharts-xaxis text, .apexcharts-yaxis text').forEach((axisNode) => {
            if ((axisNode.textContent || '').trim() === 'TOTAL') {
            setBoldBlack(axisNode);
            }
          });
        },
      },
    }
  </script>

<style scoped>
  .heatmap-scroll {
    width: 100%;
    overflow: visible;
  }
</style>
  