<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-alert-outline</v-icon>
                Gestión de Tipos de Incidentes
            </h2>
        </v-col>
        <tipoIncidente />
    </v-container>
</template>

<script>
    import tipoIncidente from "@/components/maintainers/tipoIncidente.vue" 

    export default {
        name: "TipoIncidente",
        components: {
            tipoIncidente
        },
    };
</script>