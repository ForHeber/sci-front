<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-pistol</v-icon>
                Gestión de Tipos de Armamentos
            </h2>
        </v-col>
        <tipoArmamento />
    </v-container>
</template>

<script>
    import tipoArmamento from "@/components/maintainers/tipoArmamento.vue" 

    export default {
        name: "TipoArmamento",
        components: {
            tipoArmamento
        },
    };
</script>