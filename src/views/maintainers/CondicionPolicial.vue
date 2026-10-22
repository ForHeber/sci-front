<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-account-tie-hat</v-icon>
                Gestión de Condiciones Policiales
            </h2>
        </v-col>
        <condicionPolicial />
    </v-container>
</template>

<script>
    import condicionPolicial from "@/components/maintainers/condicionPolicial.vue" 

    export default {
        name: "CondicionPolicial",
        components: {
            condicionPolicial
        },
    };
</script>