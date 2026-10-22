<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h3>
        <v-icon>mdi-file-clock-outline</v-icon>
        Boletín de Novedades Institucionales
      </h3>
        </v-col>
      <boletin />
  </v-container>
</template>

<script>
  import boletin from "@/components/information/boletin.vue"

  export default {
    name: "Boletin",
    components: {
      boletin
    },
  };
</script>