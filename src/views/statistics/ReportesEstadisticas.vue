<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h3>
        <v-icon>mdi-chart-bar-stacked</v-icon>
        Reportes y Estadísticas
      </h3>
        </v-col>
      <estadistica 
      :tipoInforme = "tipoInforme"	/>
  </v-container>
</template>

<script>
  import estadistica from "@/components/statistics/estadistica.vue"

  export default {
    name       : "ReportesEstadisticas",
    components : {
      estadistica
    },
    props      : {
      tipoInforme: {
        type: String,
        default: "Preliminar"
      }
    },
  };
</script>