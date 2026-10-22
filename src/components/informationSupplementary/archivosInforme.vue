<template>
	<v-container fluid :class="{ 'supplementary-dark': $vuetify.theme.dark }">
		<v-card class="elevation-0 supplementary-list" :class="{ 'supplementary-list--dark': $vuetify.theme.dark }">
			<v-card-title>
				<v-btn 
					color  = "primary"
					dark
					@click = "reportFoldersDialog = true"
				>
					NUEVO ARCHIVO INFORME
				</v-btn>                
			</v-card-title>              
<!-- Lista de archivos de informe -->            
			<v-container fluid>
				<v-data-table
					:headers     = "headers"
					:loading     = "isLoading"
					loading-text = "Cargando... por favor espere"
					:items       = "archivosInforme"
					disable-pagination
					hide-default-footer
				>
				<template v-slot:item.fechA_ARCHIVO = "{ item }">
					{{ getFormatDate(item.fechA_ARCHIVO) }} 
				</template>                 
<!--
		Acciones
				- Editar 
				- Eliminar
--> 
				<template v-slot:item.acciones="{ item }"> 
					<v-tooltip top>
						<template v-slot:activator="{ on }">
							<v-btn 
								icon 
								v-on   = "on" 
								@click = "editItem(item)"
							>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
						</template>
						<span>Editar</span>
					</v-tooltip>
					<v-tooltip top>
						<template v-slot:activator="{ on }">
							<v-btn
								icon
								v-on   = "on" 
								@click = "confirmDeleteItem(item)"                                    
							>
								<v-icon >mdi-delete</v-icon>
							</v-btn>                                
						</template>
						<span>Eliminar</span>
					</v-tooltip>
				</template>           
<!-- Mensaje cuando no hay data -->                    
				<template v-slot:no-data>
					No se han encontrado archivos de informe registrados en el sistema
				</template>          
				</v-data-table>                    
<!-- Paginación -->
				<v-row class="text-center" dense>
					<v-col cols="12">
						<v-pagination
							v-model        = "page"
							:length        = "pages"
							:total-visible = "10"
							:disabled      = "isLoading || pages == 1"
						/>
						<br />
					</v-col>
				</v-row>                                                
			</v-container>                                                 
		</v-card>
<!-- 		
	👉	reportFoldersDialog
			• Componente que permite crear un nuevo archivo de informe o actualizar sus antecedentes
-->
		<v-dialog
			v-model    = "reportFoldersDialog"
			:max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
			class      = "dialog"
		>
			<v-card :class="{ 'dialog-card--dark': $vuetify.theme.dark }">
				<v-card-title class="primary">
					<span class="text-h5 white--text">{{ formTitle.title }}</span>
					<v-spacer />
				</v-card-title>            
				<v-card-subtitle class="primary">
					<span class="text-h8 white--text">{{ formTitle.subtitle }}</span>
				</v-card-subtitle>
				<v-form v-model = "validForm" ref="form">                    
					<v-container class="mt-2">
						<v-row class="mt-4" dense>
							<v-col cols="12">
								<div class="panel">
									<div class="panel-head">
										<p class="panel-title mb-1">Archivo de informe</p>
										<p class="panel-subtitle mb-0">Complete la información principal del archivo de informe con un formato claro y ordenado.</p>
									</div>
									<v-row class="panel-fields-row" dense>
<!-- Fecha (calendario) -->                                            
										<v-col cols="12">
											<v-menu
												ref                     = "menu"
												v-model                 = "reportFolderDate.menu"
												:close-on-content-click = "false"
												transition              = "scale-transition"
												offset-y
												:max-width              = "$vuetify.breakpoint.mdAndUp ? '80vw' : '20vw'"
												min-width               = "auto"
											>
												<template v-slot:activator="{ on, attrs }">
													<v-text-field
														v-model            = "reportFolderDate.dateFormatted"
														:rules             = "rules.required"
														label              = "Fecha"
														hint               = "DD/MM/YYYY"
														persistent-hint
														readonly
														prepend-inner-icon = "mdi-calendar"
														v-bind             = "attrs"
														@blur              = "editedItem.fecha = parseDate(reportFolderDate.dateFormatted)"
														v-on               = "on"
													/>
												</template>
												<v-date-picker
													v-model            = "editedItem.fecha"
													:dark              = "$vuetify.theme.dark"
													locale             = "es"                                            
													:min               = "reportFolderDate.minDate"
													:max               = "reportFolderDate.maxDate"
													:first-day-of-week = "1"
													@input             = "reportFolderDate.menu = false"
													no-title                                            
												/>
											</v-menu>
										</v-col>                                      
<!-- Archivo de informe --> 

										<v-col cols="12">
											<v-textarea
												v-model            = "editedItem.descripcioN_ARCHIVO"
												label              = "Archivo de informe"
												density            = "compact"
												:rules             = "rules.maxCharacters.concat(rules.required)"  
												counter            = "2000" 
												prepend-inner-icon = "mdi-text"
												auto-grow                                        
												outlined
												clearable                                               
											/>
										</v-col>              
									</v-row>
								</div>
							</v-col>
						</v-row>
					</v-container>
				</v-form>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color = "secondary"
						text
						outlined
						@click = "reportFoldersDialog = false"
					>
						Cancelar
					</v-btn>
					<v-btn
						color     = "primary"
						@click    = "save"
						:disabled = "buttonClicked"
					>
						Guardar
					</v-btn>
				</v-card-actions>           
			</v-card>
		</v-dialog>
<!-- 
	👉 confirmDeleteDialog
		• Componente que permite confirmar la eliminación de un archivo de informe
-->
						<v-dialog 
						v-model    = "confirmDeleteDialog"
						persistent
						:max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
				>
						<v-card :class="{ 'dialog-card--dark': $vuetify.theme.dark }">
								<v-card-title class="primary">
										<span class="white--text">
												Eliminar
										</span>
										<v-spacer />
										<v-btn dark icon @click="confirmDeleteDialog = false">
										<v-icon>mdi-close</v-icon>
										</v-btn>
								</v-card-title>
								<v-card-text>
										<v-row>
												<v-col cols="12" class="pt-10">
														<v-alert
																type   = "error"
																prominent
																border = "left"
																outlined
														>
																Está a punto de eliminar el Archivo de Informe {{`Id: ${editedItem.id} `}}  ¿desea continuar?
														</v-alert>

												</v-col>
										</v-row>
								</v-card-text>
								<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn
												color  = "secondary"
												outlined
												@click = "confirmDeleteDialog = false"
										>
												No, Cancelar
										</v-btn>
										<v-btn
												color  = "primary"
												@click = "deleteItem"
										>
												Si, Eliminar
										</v-btn>
								</v-card-actions>
						</v-card>
				</v-dialog>
		</v-container>
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import toastr, { error } from 'toastr'
	import 'toastr/build/toastr.min.css' 
		
	export default {
		name       : "archivosInforme",        
		props      : {
			tipoInforme : {
				type     : String,
				required : true,
				default  : '',
			},   
			informesId : {
				type     : Number,
				required : true,
				default  : null,
			},                          
		},
		components : {
		},           
		data       : () => ({
			page                : 1,
			reportFoldersDialog : false,        
			confirmDeleteDialog : false,                           
			editedIndex         : -1,
			validForm           : false,  
			buttonClicked       : false,
			editedItem          : {
				informesId          : null,
				id                  : null,                            
				fecha               : null,
				descripcioN_ARCHIVO : '',
			},
			defaultItem         : {
				fecha               : null,
				descripcioN_ARCHIVO : '',
			},
			headers             : [
				{ text : "Id"                  , value : "id"                 , groupable : false, sortable : false },                                                        
				{ text : "Fecha"               , value : "fechA_ARCHIVO"      , groupable : false, sortable : false },                            
				{ text : "Archivo de Informe"  , value : "descripcioN_ARCHIVO", groupable : false, sortable : false },
				{ text : "Acciones"            , value : "acciones"           , groupable : false, sortable : false },  
			],
/*	calendario */                        
			reportFolderDate    : {
				date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
				dateFormatted : null,
				menu          : false,
				minDate       : "2024-02-01",
				maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
			},                        
/*	Validaciones */
			rules               : {
				required      : [	(v) => !!v || "Este campo es requerido",	],
				maxCharacters : [	(v) => v.length <= 2000 || "Máximo 2000 caracteres",	],
			},                                 
		}),     
		computed   : {
			...mapGetters("archivosInformesStore", [ "archivosInforme", "pages", "isLoading" ]),                                                        
			formTitle () {
				return { title: this.editedIndex === -1 ? 'Nuevo Archivo de Informe' : 'Editar Archivo de Informe' , subtitle: this.editedIndex === -1 ? '' : `Id: ${this.editedItem.id}`   }
			},        
		},
		async beforeMount() {
			await this.getData()        
		},         
		watch      : {
			async reportFoldersDialog (val) {
				val || this.closeReportFolderDialog();
				this.resetValidation();
		},      
		reportFolderDate: {
			deep: true,
			async handler() {
				this.reportFolderDate.dateFormatted = this.formatDate(this.editedItem.fecha)
			}
		},                                  
		},             
		methods    : {
			async getData() {
				if ( this.tipoInforme == 'Preliminar' ) {
					await this.getListArchivosInformesPreliminares(this.informesId,)
				} else if ( this.tipoInforme == 'Incidente' ) {
					await this.getListArchivosInformesIncidentes(this.informesId,)
				} else if ( this.tipoInforme == 'Final' ) {
					await this.getListArchivosInformesFinales(this.informesId,)
				}
			},

			async editItem (item) {
				this.resetValidation();
				this.editedIndex                    = this.archivosInforme.indexOf(item);
				this.editedItem                     = Object.assign({}, item);
				this.editedItem.fecha               = this.formatDateTime(item.fechA_ARCHIVO,'date')
				this.reportFolderDate.dateFormatted = this.formatDate(this.editedItem.fecha)                            
				this.reportFoldersDialog            = true;
			},

			confirmDeleteItem(item) {
				this.editedIndex         = this.archivosInforme.indexOf(item);
				this.editedItem          = Object.assign({}, item);
				this.confirmDeleteDialog = true;
			},

			async deleteItem() {
				let res = null
				if ( this.tipoInforme == 'Preliminar' ) {
					res = await this.deleteArchivosInformesPreliminares(this.editedItem)
				} else if ( this.tipoInforme == 'Incidente' ) {
					res = await this.deleteArchivosInformesIncidentes(this.editedItem)
				} else if ( this.tipoInforme == 'Final' ) {
					res = await this.deleteArchivosInformesFinales(this.editedItem)
				}

				if (res.status == 200) {
					toastr.success("Se ha eliminado la información correctamente", "Éxito!");
					this.page = 1
					await this.getData()
				} else {
					toastr.error("error", "Ha ocurrido un error", "Error!");
					return;
				}
				this.closeConfirmDeleteDialog();                           
			},   

			async save () {
				this.buttonClicked = true;
				const isValid = await this.validate()

				if ( !isValid ) {
					this.buttonClicked = false
					return
				}
				const payload = {
						fechA_ARCHIVO       : this.editedItem.fecha              ,
						descripcioN_ARCHIVO : this.editedItem.descripcioN_ARCHIVO,
						nombrE_ARCHIVO      : ' ',
						urL_ARCHIVO         : ' ',
				}

				try {
					let resp = null
					if (this.editedIndex > -1) {
						if ( this.tipoInforme == 'Preliminar' ) {
							resp = await this.putArchivosInformesPreliminares({
								PRELIMINARESID : this.informesId   ,                 
								id             : this.editedItem.id,
								...payload,
							})
						} else if ( this.tipoInforme == 'Incidente' ) {
							resp = await this.putArchivosInformesIncidentes({
								incidentesid : this.informesId   ,                 
								id           : this.editedItem.id,
								...payload,
							})
						} else if ( this.tipoInforme == 'Final' ) {
							resp = await this.putArchivosInformesFinales({
								finalesid : this.informesId   ,                 
								id        : this.editedItem.id,
								...payload,
							})
						}
						if (resp.status == 200) {
							toastr.success("Se ha actualizado la información correctamente", "Éxito!");
							this.page = 1
							await this.getData()
							await this.closeReportFolderDialog()
							return
						}

						toastr.error(`Error ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
						this.buttonClicked = false
						return
					} else {            
						if ( this.tipoInforme == 'Preliminar' ) {
							resp = await this.postArchivosInformesPreliminares({
								PRELIMINARESID : this.informesId,                   
								...payload
							})
						} else if ( this.tipoInforme == 'Incidente' ) {
							resp = await this.postArchivosInformesIncidentes({
								incidentesid : this.informesId,                   
								...payload
							})
						} else if ( this.tipoInforme == 'Final' ) {
							resp = await this.postArchivosInformesFinales({
								finalesid : this.informesId,                   
								...payload
							})
						}
						if (resp.status == 200) {
							toastr.success("Se ha creado correctamente el archivo informe", "Éxito!");
							this.page = 1
							await this.getData()
							await this.closeReportFolderDialog()
							return
						}

						if (resp.status == 409) {
							toastr.error(resp.message, "Error!: "+error);
							this.buttonClicked = false
							return;
						} else if (resp.status == 401) {
							toastr.error( resp.message, "Error!: "+error);
							this.buttonClicked = false
							return;
						} else {
							toastr.error( `Error distinto  ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
							this.buttonClicked = false
							return;
						}
					}
				} catch (error) {
					toastr.error("Ha ocurrido un error al guardar el archivo informe", "Error!");
					this.buttonClicked = false
					console.error('save error', error)
				}
			},
			validate() {
				if ( !this.$refs.form ) {
					return false
				}
				return this.$refs.form.validate()
			}, 
			resetValidation(){
				if ( this.$refs.form ) this.$refs.form.resetValidation();
			},                         

			async closeReportFolderDialog() {
				this.reportFoldersDialog            = false    
				this.editedItem                     = Object.assign({}, this.defaultItem);
				this.editedIndex                    = -1;     
				this.reportFolderDate.dateFormatted = '';             
				this.resetValidation()               
				setTimeout(() =>{ this.buttonClicked = false; }, 3000)
			},

			async closeConfirmDeleteDialog() {
				this.confirmDeleteDialog = false    
				this.editedItem       = Object.assign({}, this.defaultItem);
				this.editedIndex      = -1;
			},  
			formatDate (date) {
				if (!date) return null
				const [year, month, day] = date.split('-')
				return `${day}/${month}/${year}`
			},
			parseDate (date) {
				if (!date) return null
				const [day, month, year] = date.split('/')
				return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
			},  
			formatDateTime (datetime, token) {
				if (!datetime) return null
				const [date,time] = datetime.split('T')  
				if ( token == 'time' ) {
					const [hour,minute,second] = time.split(':')
					return `${hour}:${minute}`
				} 
				if ( token == 'date') {
					return date
				}
			},                           
			getFormatDate(datetime) {
				const date         = new Date(datetime)
				const formatedDate = [ (date.getDate()).toString().padStart(2, "0"),
															(date.getMonth() + 1).toString().padStart(2, "0"),
															date.getFullYear(),
															].join('/')
				return formatedDate
			},      
			...mapActions("archivosInformesStore", [	"getListArchivosInformesPreliminares", "getListArchivosInformesIncidentes" , "getListArchivosInformesFinales",
																								"postArchivosInformesPreliminares"   , "postArchivosInformesIncidentes"    , "postArchivosInformesFinales",
																								"putArchivosInformesPreliminares"    , "putArchivosInformesIncidentes"     , "putArchivosInformesFinales",
																								"deleteArchivosInformesPreliminares" , "deleteArchivosInformesIncidentes"  , "deleteArchivosInformesFinales"    ,	]),
				},
		}
</script>
<style scoped>
	.dialog {
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		--form-control-font-size: 0.84rem;
		--dialog-primary: #0b3c5d;
		--dialog-primary-soft: #16527b;
		--dialog-accent: #f4b400;
		--dialog-border: #d3deea;
	}

	.dialog ::v-deep .v-card {
		border-radius: 18px;
		overflow: hidden;
		box-shadow: 0 20px 44px rgba(11, 60, 93, 0.2);
		background: linear-gradient(180deg, #fafdff 0%, #f3f8fe 100%);
	}

	.dialog ::v-deep .v-card__title.primary,
	.dialog ::v-deep .v-card__subtitle.primary {
		background: linear-gradient(115deg, var(--dialog-primary) 0%, var(--dialog-primary-soft) 68%, #1d628f 100%) !important;
	}

	.dialog ::v-deep .v-card__title .text-h5 {
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: capitalize;
	}

	.dialog ::v-deep .v-card__subtitle .text-h8 {
		font-weight: 400;
		letter-spacing: 0.03em;
		opacity: 0.95;
	}

	.dialog ::v-deep .tab {
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: none;
		border-radius: 999px;
		margin: 0 6px 8px;
		min-width: 160px;
		height: 42px;
		padding: 0 18px;
		color: #2f4256;
		background: linear-gradient(180deg, #ffffff 0%, #f3f6fa 100%);
		border: 1px solid #d7e1ec;
		transition: all 0.22s ease;
	}

	.dialog ::v-deep .tabs {
		background: linear-gradient(135deg, #f8fafc 0%, #edf3fa 55%, #f6f9fc 100%);
		padding: 10px 10px 0;
		border-bottom: 1px solid #d5deea;
	}

	.dialog ::v-deep .tab::before {
		opacity: 0;
	}

	.dialog ::v-deep .tab:hover {
		transform: translateY(-1px);
		background: linear-gradient(180deg, #ffffff 0%, #eaf2fb 100%);
		color: #0b3c5d;
		box-shadow: 0 6px 16px rgba(11, 60, 93, 0.12);
	}

	.dialog ::v-deep .tab.v-tab--active {
		background: linear-gradient(180deg, #0b3c5d 0%, #16527b 100%);
		color: #ffffff !important;
		border-color: #0b3c5d;
		box-shadow: 0 8px 18px rgba(11, 60, 93, 0.3);
	}

	.dialog ::v-deep .v-tabs-slider {
		height: 4px;
		border-radius: 999px;
		background-color: #f4b400;
	}

	.dialog ::v-deep .v-label,
	.dialog ::v-deep .v-input input,
	.dialog ::v-deep .v-input textarea,
	.dialog ::v-deep .v-btn {
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		letter-spacing: 0.012em;
		font-weight: 400;
	}

	.dialog ::v-deep .v-input .v-label,
	.dialog ::v-deep .v-input input,
	.dialog ::v-deep .v-input textarea,
	.dialog ::v-deep .v-select__selection,
	.dialog ::v-deep .v-select__selections {
		font-size: var(--form-control-font-size) !important;
	}

	.dialog ::v-deep .v-btn {
		font-size: 0.8rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: none;
	}

	.dialog ::v-deep .v-icon {
		font-size : 13px;
		color     : #60758b;
		opacity   : 0.82;
	}

	.dialog ::v-deep .v-tab .v-icon {
		font-size : 13px !important;
		opacity   : 0.8;
	}

	.dialog ::v-deep .v-input__prepend-inner .v-icon {
		font-size        : 13px !important;
		color            : #7d90a3;
		opacity          : 0.66;
		transform        : scale(0.9);
		transform-origin : center;
	}

	.dialog ::v-deep .v-input__append-inner .v-icon {
		font-size : 13px !important;
		color     : #70859a;
		opacity   : 0.72;
	}

	.dialog ::v-deep .v-btn .v-icon {
		font-size : 13px !important;
	}
	.panel {
		padding: 15px;
		border-radius: 16px;
		background: linear-gradient(136deg, #f9fcff 0%, #eef4fb 58%, #f8fcff 100%);
		border: 1px solid #d5e1ed;
		box-shadow: 0 12px 26px rgba(23, 53, 82, 0.08);
	}

	.panel-head {
		padding: 0 2px 8px;
		margin-bottom: 8px;
		border-bottom: 1px solid rgba(130, 152, 176, 0.22);
	}

	.panel-title {
		font-size: 0.98rem;
		font-weight: 600;
		letter-spacing: 0.028em;
		color: #253f57;
	}

	.panel-subtitle {
		font-size: 0.8rem;
		line-height: 1.35;
		color: #60758b;
	}

	.panel-fields-row {
		margin: 0;
	}

	.panel ::v-deep .v-input__slot {
		border-radius: 11px !important;
		background-color: rgba(255, 255, 255, 0.94);
	}

	.panel ::v-deep .v-input--is-focused .v-input__slot {
		box-shadow: 0 0 0 3px rgba(11, 60, 93, 0.1);
	}

	.panel ::v-deep .v-text-field--outlined fieldset {
		border-color: #bdccdb;
	}

	.panel ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
		border-color: #0b3c5d;
	}

	.panel ::v-deep .v-label {
		color: #29425b;
		letter-spacing: 0.012em;
		font-weight: 400;
	}

	.panel ::v-deep .v-counter {
		color: #6b7f95;
	}

	.supplementary-dark {
		min-height: 100%;
		color: #e6edf3;
		background: #111820;
	}

	.supplementary-list--dark {
		color: #e6edf3;
		background: #18232e !important;
	}

	.supplementary-list--dark ::v-deep .v-data-table,
	.supplementary-list--dark ::v-deep .v-data-table__wrapper,
	.supplementary-list--dark ::v-deep table,
	.supplementary-list--dark ::v-deep .v-data-footer {
		color: #e6edf3;
		background: #18232e;
	}

	.supplementary-list--dark ::v-deep thead tr,
	.supplementary-list--dark ::v-deep tbody tr:hover {
		background: #22313e !important;
	}

	.supplementary-list--dark ::v-deep th {
		color: #aebdca !important;
	}

	.supplementary-list--dark ::v-deep td {
		color: #e6edf3;
		border-color: #30404e !important;
	}

	.supplementary-list--dark ::v-deep .toolbar {
		border-bottom-color: #405364;
	}

	.supplementary-list--dark ::v-deep .toolbar .v-input__slot {
		background-color: #18232e;
	}

	.supplementary-list--dark ::v-deep .toolbar .v-label,
	.supplementary-list--dark ::v-deep .toolbar input,
	.supplementary-list--dark ::v-deep .toolbar .v-select__selection,
	.supplementary-list--dark ::v-deep .toolbar .v-icon {
		color: #c9d5df;
	}

	.supplementary-dark ::v-deep .v-pagination .v-pagination__item,
	.supplementary-dark ::v-deep .v-pagination .v-pagination__navigation {
		color: #e6edf3;
		background: #22313e;
	}

	.dialog-card--dark {
		background: linear-gradient(180deg, #202d39 0%, #18232e 100%) !important;
		color: #e6edf3;
	}

	.dialog-card--dark ::v-deep .v-card__text,
	.dialog-card--dark ::v-deep .v-card__actions {
		color: #e6edf3;
	}

	.dialog-card--dark ::v-deep .v-icon {
		color: #aebdca;
	}

	.dialog-card--dark ::v-deep .panel {
		background: linear-gradient(136deg, #263542 0%, #202d39 58%, #263542 100%);
		border-color: #405364;
		box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
	}

	.dialog-card--dark ::v-deep .panel-title,
	.dialog-card--dark ::v-deep .panel .v-label,
	.dialog-card--dark ::v-deep .panel .v-counter {
		color: #c9d5df;
	}

	.dialog-card--dark ::v-deep .panel-subtitle {
		color: #aebdca;
	}

	.dialog-card--dark ::v-deep .panel .v-input__slot {
		background-color: #18232e;
	}

	.dialog-card--dark ::v-deep .panel .v-input input,
	.dialog-card--dark ::v-deep .panel .v-input textarea {
		color: #e6edf3;
	}

	.dialog-card--dark ::v-deep .panel .v-text-field--outlined fieldset {
		border-color: #526576;
	}

	.dialog-card--dark ::v-deep .v-alert {
		background-color: #35252a;
		color: #f3dce0;
	}
	</style>