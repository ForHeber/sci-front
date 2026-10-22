<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-replace-outline</v-icon>
        Informes de Incidentes de Seguridad
      </h2>
    </v-col>
    <incidentesS2 />
  </v-container>
</template>

<script>
  import incidentesS2 from "@/components/information/incidentesS2.vue" 
  export default {
    name       : "IncidentesS2",
    components : {
      incidentesS2
    },
  };
</script>