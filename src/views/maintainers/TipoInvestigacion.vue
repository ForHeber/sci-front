<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-text-box-search-outline</v-icon>
                Gestión de Tipos de Investigación
            </h2>
        </v-col>
        <tipoInvestigacion />
    </v-container>
</template>

<script>
    import tipoInvestigacion from "@/components/maintainers/tipoInvestigacion.vue" 

    export default {
        name: "TipoInvestigacion",
        components: {
            tipoInvestigacion
        },
    };
</script>