<template>
  <v-container fluid>
    <v-card fill-width  class="elevation-0">
      <v-card-text class="mt-2">
        <apex-pie-chart
          :pie-chart-data-sets = "pieChartDataSets"
          :pie-data-sets       = "pieDataSets"
        />
      </v-card-text>
    </v-card>     
  </v-container>
</template>        

<script>
  import ApexPieChart from '@/components/apexCharts/pieApexChart.vue'

  export default {
    name       : "pieChart",
    components : {
      ApexPieChart,
    },
    props      : [
      "pieChartDataSets",
      "pieDataSets",
    ],
    data       : () => ({                                
    }),
  };
</script>
