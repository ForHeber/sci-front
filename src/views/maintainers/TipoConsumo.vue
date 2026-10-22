<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-cannabis</v-icon>
                Gestión de Tipos de Consumo
            </h2>
        </v-col>
        <tipoConsumo />
    </v-container>
</template>

<script>
    import tipoConsumo from "@/components/maintainers/tipoConsumo.vue" 

    export default {
        name: "TipoConsumo",
        components: {
            tipoConsumo
        },
    };
</script>