<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-clipboard-check-outline</v-icon>
        Gestión de Medidas Adoptadas
      </h2>
    </v-col>
    <medidas-adoptadas />
  </v-container>
</template>

<script>
  import medidasAdoptadas from "@/components/maintainers/medidasAdoptadas.vue" 
  export default {
    name: "MedidasAdoptadas",
    components: {
      medidasAdoptadas
    },
  };
</script>