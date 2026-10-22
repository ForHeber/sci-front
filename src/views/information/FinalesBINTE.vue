<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-sign</v-icon>
        Informes Finales de Incidentes de Seguridad 
      </h2>
    </v-col>
    <finalesBINTE />
  </v-container>
</template>

<script>
  import finalesBINTE from "@/components/information/finalesBINTE.vue" 

  export default {
    name       : "FinalesBINTE",
    components : {
      finalesBINTE
    }, 
  };
</script>