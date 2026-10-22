<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-file-sign</v-icon>
        Informes Finales de Incidentes de Seguridad 
      </h2>
    </v-col>
    <finalesS2 />
  </v-container>
</template>

<script>
  import finalesS2 from "@/components/information/finalesS2.vue" 

  export default {
    name       : "FinalesS2",
    components : {
      finalesS2
    },
  };
</script>