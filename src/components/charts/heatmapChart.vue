<template>
  <v-container fluid>
    <v-card fill-width class="elevation-0">
      <v-card-text class="mt-2">
        <apex-heatmap-chart
          :heatmap-chart-data-sets = "heatmapChartDataSets"
          :heatmap-data-sets       = "heatmapDataSets"
        />
      </v-card-text>
    </v-card>     
  </v-container>
</template>        

<script>
  import ApexHeatmapChart from '@/components/apexCharts/heatmapApexChart.vue';
    
  export default {
    name       : "heatmapChart",
    components : {
      ApexHeatmapChart,
    },
    props      : [
      "heatmapChartDataSets",
      "heatmapDataSets",
    ],
    data       : () => ({                                
    }),
  };
</script>
