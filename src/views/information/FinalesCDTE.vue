<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-sign</v-icon>
        Resolución Final de Informes de Incidentes de Seguridad
      </h2>
    </v-col>
    <finalesCDTE />
  </v-container>
</template>

<script>
  import finalesCDTE from "@/components/information/finalesCDTE.vue" 

  export default {
    name       : "FinalesCDTE",
    components : {
      finalesCDTE
    },
  };
</script>