<template>
  <v-container fluid>
    <v-col cols="12" class="text-center">
      <h2>
        <v-icon>mdi-alert-outline</v-icon>
        Gestión de Grupos de Tipos de Incidentes
      </h2>
    </v-col>
    <tipo-grupo-incidente />
  </v-container>
</template>

<script>
  import tipoGrupoIncidente from "@/components/maintainers/tipoGrupoIncidente.vue" 
  export default {
    name: "TipoGrupoIncidente",
    components: {
      tipoGrupoIncidente
    },
  };
</script>