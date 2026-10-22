<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-card-account-details-outline</v-icon>
                Gestión de Tipos de Identificación
            </h2>
        </v-col>
        <tipoIdentificacion />
    </v-container>
</template>

<script>
    import tipoIdentificacion from "@/components/maintainers/tipoIdentificacion.vue" 

    export default {
        name: "TipoIdentificacion",
        components: {
            tipoIdentificacion
        },
    };
</script>