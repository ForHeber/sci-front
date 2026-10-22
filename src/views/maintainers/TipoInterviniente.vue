<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-gavel</v-icon>
                Gestión de Tipos de Intervinientes
            </h2>
        </v-col>
        <tipoInterviniente />
    </v-container>
</template>

<script>
    import tipoInterviniente from "@/components/maintainers/tipoInterviniente.vue" 

    export default {
        name: "TipoInterviniente",
        components: {
            tipoInterviniente
        },
    };
</script>