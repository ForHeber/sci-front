<template>
	<v-app>
		<v-main>

			<v-container class="contentHeight hero" fluid>

				<!-- COMPONENTE VERSIÓN -->
				<version />

				<v-row class="justify-center text-center" dense>
					<v-col sm="12" md="6" lg="4">
						<v-avatar
							:size="existLastUser ? 150 : 380"
							:class="existLastUser ? '' : 'pa-6 mb-5'"
						>
							<v-img contain :src="escudo"></v-img>
						</v-avatar>
					</v-col>
				</v-row>

				<v-row class="justify-center text-center" dense>
					<v-col sm="12" md="6" lg="4">
						<v-avatar
							v-if="existLastUser"
							size="270"
							class="Avatar mb-5"
						>
							<v-img contain :src="avatar" lazy-src="/avatar.svg" />
						</v-avatar>

						<p v-if="existLastUser" class="text-center title">{{nombreUsuario}}</p>
					</v-col>
				</v-row>

				<v-row class="justify-center text-center" dense>
					<v-col xs="12" sm="7" md="6" lg="4">
						<v-form @submit.prevent="authenticate" ref="loginform" v-model="formValid">

							<v-text-field
								v-show           = "!existLastUser"
								label            = "RUN sin puntos ni dígito verificador"
								v-model          = "credentials.usuario"
								:rules           = "userRule"
								type             = "text"
								outlined
								background-color = "white"
							/>

							<v-text-field
								id               = "password"
								label            = "Contraseña Ejército"
								v-model          = "credentials.password"
								:append-icon     = "mostrar ? 'mdi-eye-off' : 'mdi-eye'"
								:type            = "mostrar ? 'text' : 'password'"
								:rules           = "passRule"
								@click:append    = "mostrar = !mostrar"
								outlined
								background-color = "white"
							/>

							<v-row>
								<v-col>
									<p class="text-left">
										<span @click="restablecerModal=!restablecerModal" style="cursor:pointer">
											Restablecer contraseña
											<v-icon small>mdi-lock</v-icon>
										</span>
									</p>
								</v-col>
								<v-col>
									<!-- Se muestra en tamaños grandes -->
									<p v-if="existLastUser" class="text-right hidden-sm-and-down">
										<span @click="changeUserLogin" style="cursor:pointer">
											Cambiar de usuario
										</span>
									</p>
									<!-- Se muestra en tamaños pequeños -->
									<p v-if="existLastUser" class="text-left hidden-md-and-up">
										<span @click="changeUserLogin" style="cursor:pointer">
											Cambiar de usuario
										</span>
									</p>
								</v-col>
							</v-row>
							<p class="text-right red--text text--lighten-1">{{ authError }}</p>

							<v-btn
								type      = "submit"
								class     = "ma-2"
								style     = "float: right;"
								title     = "Ingresar a la plataforma"
								:loading  = "isLoading"
								:disabled = "isLoading"
								color     = "primary"
								@click    = "authenticate"
							>
								INGRESAR
								<v-icon right x-large>mdi-chevron-right</v-icon>
							</v-btn>

						</v-form>
					</v-col>
				</v-row>

			</v-container>

			<v-dialog
				v-model="info.modal"
				persistent
				:max-width="$vuetify.breakpoint.mdAndUp ? '50vw' : '90vw'"
			>
				<v-card>
					<v-card-title class="primary">
						<span class="white--text">{{ info.titulo }}</span>
						<v-spacer />
						<v-btn dark icon @click="info.modal = false">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</v-card-title>
					<v-card-text>
						<!-- Mensaje de seguridad para todos los usuarios -->
						<v-row dense class="text-justify">
							<v-col cols="12" class="px-4 mt-4">
								<v-alert
									border="left"
									colored-border
									type="warning"
									prominent
									elevation="2"
								>
									<span class="alerta">{{ info.texto }}</span>
								</v-alert>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-dialog>

			<!-- COMPONENTE FOOTER -->
			<Footer />

			<!-- COMPONENTE CAMBIO CONTRASEÑA -->
			<cambio-pass
				v-if="restablecerModal"
				:show="restablecerModal"
				@close="restablecerModal=false"
			/>

		</v-main>
	</v-app>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import CambioPass from '@/components/base/cambioPass.vue';
	import Footer     from '@/components/base/Footer.vue';
	import Version    from '@/components/base/version.vue';

	import fondo      from '@/assets/fondo.svg';

	export default {
		components:{
			CambioPass,
			Footer,
			Version,
		},
		data() {
			return {
				escudo           : '/escudo.svg', 
				prefijo          : 'SCI', 
				backgroundImage  : `url(${fondo})`,
				existLastUser    : false,
				avatar           : null,
				mostrar          : false,
				formValid        : false,
				nombreUsuario    : '',
				userRule         : [
										v => !!v || "El run es requerido",
										v => v? v.length <= 8 || "El run debe ser menor a 8 digitos": "El run es requerido",
								],
				passRule         : [
										v => !!v || "Clave requerida",
										v => v? v.length > 5 || "La clave es muy corta": "Clave requerida",
								],
				credentials      : {
										usuario  : "",
										password : ""
								},
				info			 : {
										modal  : true,
										titulo : 'VERSIÓN DE PRUEBA SCI 2.0',
										texto  : 'Esta versión es un acercamiento a la versión final del SCI, ' + 
                                                'por lo que algunas funcionalidades pueden no estar completamente implementadas. ' +
												'Agradecemos su compresión. ' 

									},
				restablecerModal : false,
			};
		},
		computed: {

			...mapGetters(["isLoading", "authError"])
		},
		created() {
			this.credentials.usuario = localStorage.getItem(this.prefijo + "Run");
			this.nombreUsuario       = localStorage.getItem(this.prefijo + "Nombre");
			this.avatar              = localStorage.getItem(this.prefijo + "Avatar");

			if ( this.nombreUsuario ){
				this.existLastUser = true;
			}
		},
		beforeMount() {
			this.$vuetify.theme.dark = false
		},
		methods: {
			validate(){
				this.$refs.loginform.validate();
			},
			authenticate() {
				this.validate()
				if ( this.formValid ) {
					this.login( this.credentials )
				}
			},

			resetValidation(){
				//limpia los mensajes de validación de formulario abiertos previamente
				if(this.$refs.loginform)
					this.$refs.loginform.resetValidation();
			},

			changeUserLogin(){
				this.deleteLocalUser();
				this.credentials.usuario = '';
				this.resetValidation()
			},
			deleteLocalUser(){
				localStorage.removeItem(this.prefijo + "Token");
				localStorage.removeItem(this.prefijo + "Nombre");
				localStorage.removeItem(this.prefijo + "Run");
				localStorage.removeItem(this.prefijo + "Avatar");

				this.credentials.usuario = null;
				this.nombreUsuario = null;
				this.avatar = null;
				this.existLastUser = false;
			},

			...mapActions(["login"]),
		},
	};
</script>

<style scoped>

	.Avatar {
		border: 3px solid rgb(230, 230, 230);
	}

	.contentHeight {
		height: 95vh;
		display: table;
	}

	body {
		background-image: v-bind('backgroundImage');
	}

	.hero {
		background: v-bind('backgroundImage');
		background-size: cover;
	}

	.alerta {
		font-size: 1.3em;
		line-height: 1.4;
	}

</style>