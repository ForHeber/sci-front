<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-document-alert-outline</v-icon>
        Gestión de Informes Preliminares de Seguridad
      </h2>
    </v-col>
    <preliminares />
  </v-container>
</template>

<script>
  import preliminares from "@/components/information/preliminares.vue" 
  export default {
    name       : "Preliminares",
    components : {
      preliminares
    },
  };
</script>