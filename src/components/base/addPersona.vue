<template>
    <v-container fluid>
        <v-card class="elevation-0">

            <v-card-title class="justify-center">
                
                <v-text-field
                    v-model="search"
                    :append-icon="search != oldSearch ? 'mdi-magnify-plus-outline' : 'mdi-magnify'"
                    label="Buscar persona en el listado"
                    @click:append="buscar"
                    @change="buscar"
                    hint="Escriba su criterio de búsqueda RUN, nombre o apellidos y presione 'ENTER'"
                    :class="$vuetify.breakpoint.mdAndUp ? 'pt-6 col-4' : 'col-12'"
                    outlined
                    dense
                />

                <v-btn
                    color="primary"
                    class="ml-4"
                    @click="buscar"
                >
                    BUSCAR
                    <v-icon>mdi-magnify-plus-outline</v-icon>
                </v-btn>
                
            </v-card-title>

            <v-container fluid>
                <v-data-table
                    :headers="headers"
                    :loading="isLoading"
                    loading-text="Cargando... por favor espere"
                    :items="personas"
                    disable-pagination
                    hide-default-footer
                >
                    <template v-slot:item.fotO_TN="{ item }">
                        <v-avatar>
                            <v-img :src="item.fotO_TN" />
                        </v-avatar>
                    </template>

                    <template v-slot:item.nombres="{ item }">
                        {{ item.nombres }} {{ item.apellidO_PATERNO }} {{ item.apellidO_MATERNO }}
                    </template>

                    <template v-slot:item.acciones="{ item }">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon
                                    v-on="on"
                                    @click="addPersona(item)"
                                >
                                    <v-icon>mdi-plus-circle-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>Agregar</span>
                        </v-tooltip>
                        
                    </template>

                    <template v-slot:no-data>
                        Seleccione un criterio de búsqueda y presione BUSCAR.
                    </template>

                </v-data-table>
        
                <v-row class="text-center" dense>
                    <v-col cols="12">
                        <v-pagination
                            v-model="page"
                            :length="pages"
                            :total-visible="items"
                            :disabled = "isLoading || pages == 1"
                        ></v-pagination>
                        <br />
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    name: "addPersona",
    props: {},
    data: () => ({
        personas: [],
        pages: 0,
        page: 1,
        oldPage: 1,
        items: 10,
        search: '',
        oldSearch: '',
        headers : [
            { text: 'Foto', value: 'fotO_TN', align: 'left', sortable: false },
            { text: 'Grado', value: 'grado', align: 'left', sortable: false },
            { text: 'Nombre Completo', value: 'nombres', align: 'left', sortable: false, width: '50%' },
            { text: 'Unidad', value: 'unidad', align: 'left', sortable: false },
            { text: 'Fono', value: 'movil', align: 'left', sortable: false },
            { text: 'Correo', value: 'correointer', align: 'left', sortable: false },
            { text: 'Agregar', value: 'acciones', align: 'right', sortable: false, width: '5%' },
        ],
    }),
    computed: {
        ...mapGetters("personasStore", [
            "isLoading", 
            "isError"
        ]),
    },
    watch: {
        page: {
            deep: true,
            async handler() {
                if (this.page != this.oldPage) {
                    await this.getData();
                    this.oldPage = this.page;
                }
            }
        },
    },
    async beforeMount() {
        // await this.getData()
    },
    methods: {
        
        async getData() {

            const resp = await this.getPersonas({ 
                page: this.page,
                items: this.items,
                search: this.search,
            });

            this.personas = resp.data.respuesta
            this.pages = resp.data.pageCount
        },

        async buscar(){
            if (this.search != this.oldSearch) {
                this.oldSearch = this.search;
                this.page = 1;
                await this.getData();
            }
        },

        addPersona(item) {
            this.$emit("addPersona", item);
        },

        ...mapActions("personasStore", [
            "getPersonas",
        ]),
    },
};
</script>