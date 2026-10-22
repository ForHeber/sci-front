<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-clock-alert-outline</v-icon>
        Índices de Alerta
      </h2>
    </v-col>
    <indiceAlerta />
  </v-container>
</template>

<script>
  import indiceAlerta from "@/components/maintainers/indiceAlerta.vue" 
  export default {
    name: "IndiceAlerta",
    components: {
      indiceAlerta
    },
  };
</script>