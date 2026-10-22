<template>
  <v-container fluid>
    <v-card fill-width  class="elevation-0">
      <v-card-text class="mt-2">
        <apex-timeline-chart
          :timeline-chart-data-sets = "timelineChartDataSets"
          :timeline-data-sets       = "timelineDataSets"
          :height                   = "height"
        />
      </v-card-text>
    </v-card>     
  </v-container>
</template>        

<script>
  import ApexTimelineChart from '@/components/apexCharts/timelineApexChart.vue'

  export default {
    name       : "timelineChart",
    components : {
      ApexTimelineChart,
    },
    props      : [
      "timelineChartDataSets",
      "timelineDataSets",
      "height",
    ],
    data       : () => ({                                
    }),
  };
</script>
