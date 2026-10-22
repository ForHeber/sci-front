<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-hospital-box-outline</v-icon>
                Gestión de Estados de Salud
            </h2>
        </v-col>
        <estadoSalud />
    </v-container>
</template>

<script>
    import estadoSalud from "@/components/maintainers/estadoSalud.vue" 

    export default {
        name: "EstadoSalud",
        components: {
            estadoSalud
        },
    };
</script>