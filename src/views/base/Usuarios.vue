<template>
    <v-container fluid>
        <v-col cols="12" class="text-center">
            <h2>
                <v-icon>mdi-account-circle</v-icon>
                Gestión de Usuarios
            </h2>
        </v-col>
        <iframe ref="usuariosApp" :src="url" frameborder="0" width="100%"></iframe>
    </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "Usuarios",
    data: () => ({
		url: process.env.VUE_APP_USUARIOS
	}),
    components: {
    },
    mounted() {
        // Abre el listener para comunicar el token y el tema del sistema.
        this.$refs.usuariosApp.addEventListener('load', this.setIframeMessage)
        
        // Escucha el evento message para ajustar el tamaño del iframe.
        window.addEventListener('message', this.setIframeHeight)
    },
    watch: {
        // observa los cambios de token (refresh) o del tema (toggle) para comunicarlos al iframe.
        tema: 'setIframeMessage',
        getToken: 'setIframeMessage',
    },
    computed: {
        tema () {
            return (this.$vuetify.theme.isDark) ? 'dark' : 'light'
        },
        ...mapGetters(["getToken"]),
    },
    methods: {
        // cambia el tamaño del iframe en consecuencia del contenido escuchado desde el proyecto usuarios.
        setIframeHeight(event) {
            if (event.data.iframeHeight) {
                this.$refs.usuariosApp.style.height = `${event.data.iframeHeight}px`
            }
        },
        // notifica por listener POST el token y tema al proyecto usuarios.
        setIframeMessage() {
            if (this.$refs.usuariosApp && this.$refs.usuariosApp.contentWindow) {
                if (!!this.getToken) {
                    this.$refs.usuariosApp.contentWindow.postMessage({
                        token: this.getToken, 
                        theme: this.$vuetify.theme.dark
                    }, '*')
                }
            }
        }
    },
    beforeDestroy() {
        window.removeEventListener('message', this.setIframeHeight)
    },
};
</script>
