<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-replace-outline</v-icon>
        Informes de Incidentes de Seguridad
      </h2>
    </v-col>
    <incidentesBINTE />
  </v-container>
</template>

<script>
  import incidentesBINTE from "@/components/information/incidentesBINTE.vue" 
  export default {
    name       : "IncidentesBINTE",
    components : {
      incidentesBINTE
    },
  };
</script>