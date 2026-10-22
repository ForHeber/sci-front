<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-document-alert-outline</v-icon>
          Informes Preliminares de Seguridad
      </h2>
    </v-col>
    <preliminaresBINTE />
  </v-container>
</template>

<script>
  import preliminaresBINTE from "@/components/information/preliminaresBINTE.vue" 
  export default {
    name       : "PreliminaresBINTE",
    components : {
      preliminaresBINTE
    },
  };
</script>