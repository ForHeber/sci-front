<template>
  <v-container fluid>
    <v-card fill-width class="elevation-0">
      <v-card-text class="mt-2">
        <apex-bar-chart
          :bar-chart-data-sets = "barChartDataSets"
          :bar-data-sets       = "barDataSets"
        />
      </v-card-text>
    </v-card>     
  </v-container>
</template>        

<script>
  import ApexBarChart from '@/components/apexCharts/barApexChart.vue';
    
  export default {
    name       : "barChart",
    components : {
      ApexBarChart,
    },
    props      : [
      "barChartDataSets",
      "barDataSets",
    ],
    data       : () => ({                                
    }),
  };
</script>
