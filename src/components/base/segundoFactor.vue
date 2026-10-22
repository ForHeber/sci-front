<template>
	<v-dialog 
		v-model="show"
		persistent
		:max-width="$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
	>
		<v-card>
			<v-card-title class="primary">
				<span class="white--text">
					<v-icon color="white">mdi-target-account</v-icon>
					Segundo Factor de Autenticación
				</span>
				<v-spacer />
				<v-btn dark icon @click="close">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<v-card-text>
				<iframe ref="usuariosApp" :src="url" frameborder="0" width="100%"></iframe>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "segundoFactor",
	props: {
        show: {
            type: Boolean,
            required: false,
			default: false,
        },
    },
    data: () => ({
		url: `${process.env.VUE_APP_USUARIOS}/2fa`
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
		close() {
			console.log('emite')
			this.$emit("close");
		},
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