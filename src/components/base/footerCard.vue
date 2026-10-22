<template>
    <v-container>
        <v-card class="text-center" elevation="2" width="100%">
            <v-card-title>
                {{ item.modulo }}
            </v-card-title>
            <v-card-text>
                <v-col cols="12">
                    <p>{{ item.nombre }}</p>
                    <v-img :src="item.escudo" height="90px" contain />
                </v-col>
                
                <v-col cols="12">
                    <v-icon small> mdi-phone-in-talk </v-icon> Telefono: {{ item.telefono }}
                    <br />
                    <v-icon small> mdi-email </v-icon> Correo: {{ item.correo }}
                </v-col>

                <v-col cols="12" class="text-justify">
                    {{ item.texto }}
                </v-col>

            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: "footerCard",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
}
</script>

<style scoped>
    .v-card__title {
        display: block !important;
    }
</style>