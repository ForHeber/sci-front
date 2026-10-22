<template>
	<v-dialog 
		v-model="show"
		persistent
		:max-width="$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
	>
		<v-card>
			<v-card-title class="primary">
				<span class="white--text">Restablecer Clave Ejército</span>
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

export default {
	name: 'cambioPass',
	props: {
        show: {
            type: Boolean,
            required: true,
        },
    },
	data() {
		return {
			url: `${process.env.VUE_APP_USUARIOS}/reset`
		};
	},
	mounted() {
         // Escucha el evento message para ajustar el tamaño del iframe.
         window.addEventListener('message', this.setData)
    },
	methods: {
		// cambia el tamaño del iframe en consecuencia del contenido escuchado desde el proyecto usuarios.
		setData(event) {
            if (event.data.iframeHeight) {
                 this.$refs.usuariosApp.style.height = `${event.data.iframeHeight}px`
            }		
			if (event.data.dialog) {
                 if (event.data.dialog == 'cerrar') {
 					this.close()
 				}
			}
         },
 
 		close() {
 			this.$emit("close")
 		},
	},
 
	beforeDestroy() {
		window.removeEventListener('message', this.setData)
	},
};
</script>