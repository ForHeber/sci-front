<template>
  <v-container fluid :class="{ 'supplementary-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0 supplementary-list" :class="{ 'supplementary-list--dark': $vuetify.theme.dark }">
      <v-card-title class="toolbar">
        <v-btn
          class  = "toolbar-btn-new" 
          color  = "primary"
          dark
          @click = "policeProcedureDialog = true"
        >
          NUEVO PROCEDIMIENTO POLICIAL
        </v-btn>                
      </v-card-title>              
<!--  Lista de procedimientos policiales -->            
      <v-container fluid>
        <v-data-table
          class        = "tabla"   
          :dark        = "$vuetify.theme.dark"
          :headers     = "headers"
          :loading     = "isLoading"
          loading-text = "Cargando... por favor espere"
          :items       = "procedimientosPoliciales"
          disable-pagination
          hide-default-footer
        >
          <template v-slot:item.fechA_PROCEDIMIENTO_POL = "{ item }">
            {{ getFormatDate(item.fechA_PROCEDIMIENTO_POL) }} 
          </template>                
<!--
    Acciones
        - Editar 
        - Eliminar
-->
          <template v-slot:item.acciones="{ item }"> 
            <div class="tabla-acciones">
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
            </div>                        
          </template>           
<!--  Mensaje cuando no hay data -->                    
          <template v-slot:no-data>
            No se han encontrado procedimientos policiales registrados en el sistema
          </template>          
        </v-data-table>                    
<!--  Paginación -->
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
  👉 policeProcedureDialog
      • Componente que permite crear un nuevo procedimiento policial o actualizar sus antecedentes
-->   
    <v-dialog
      v-model    = "policeProcedureDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '100vw'"
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
        <v-card-text>
          <v-form v-model = "validForm" ref="form">                    
            <v-container class="mt-2">
							<v-row class="mt-4" dense>
								<v-col cols="12">
									<div class="panel">
										<div class="panel-head">
											<p class="panel-title mb-1">Procedimiento policial</p>
											<p class="panel-subtitle mb-0">Complete la información principal del procedimiento policial con un formato claro y ordenado.</p>
										</div>
                    <v-row class="panel-fields-row" dense>
<!--  - Fecha (calendario) -->                                            
                      <v-col cols="12">
                        <v-menu
                          ref                     = "menu"
                          v-model                 = "policeProcedureDate.menu"
                          :close-on-content-click = "false"
                          transition              = "scale-transition"
                          offset-y
                          :max-width              = "$vuetify.breakpoint.mdAndUp ? '80vw' : '20vw'"
                          min-width               = "auto"
                        >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model            = "policeProcedureDate.dateFormatted"
                            :rules             = "rules.required"
                            label              = "Fecha"
                            hint               = "DD/MM/YYYY"
                            persistent-hint
                            readonly
                            prepend-inner-icon = "mdi-calendar"
                            v-bind             = "attrs"
                            @blur              = "editedItem.fecha = parseDate(policeProcedureDate.dateFormatted)"
                            v-on               = "on"
                          />
                        </template>
                        <v-date-picker
                          v-model            = "editedItem.fecha"
                          :dark              = "$vuetify.theme.dark"
                          locale             = "es"                                                                                        
                          :min               = "policeProcedureDate.minDate"
                          :max               = "policeProcedureDate.maxDate"
                          :first-day-of-week = "1"                                            
                          @input             = "policeProcedureDate.menu = false"
                          no-title                                            
                        />
                      </v-menu>
                    </v-col>         
<!-- Procedimiento policial -->                                            

                    <v-col cols="12">
                      <v-textarea
                        v-model            = "editedItem.detallE_PROCEDIMIENTO_POL"
                        label              = "Procedimiento policial"
                        density            = "compact"
                        :rules             = "rules.maxCharacters.concat(rules.required)"  
                        counter            = "2000"
												prepend-inner-icon = "mdi-text"                                                                                                                                                                                                                                      
                        auto-grow                                        
                        outlined
                        clearable                                                  
                      />
                    </v-col>     
<!-- Condición policial -->
                    <v-col cols="12" md="6">
                      <v-autocomplete
                        v-model            = "editedItem.condicioN_POLICIALID"
                        :items             = "itemsCondicionPolicial"
                        item-text          = "descripcion"
                        item-value         = "id"
                        label              = "Condición policial"
                        :rules             = "[validObjectRule]"
                        prepend-inner-icon = "mdi-form-select"
                        outlined                                        
                        return-object
                      />
                    </v-col>                                
                    </v-row>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color = "secondary"
            text
            outlined
            @click = "policeProcedureDialog = false"
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
        • Componente que permite confirmar la eliminación de un procedimiento policial
-->
    <v-dialog 
      v-model    = "confirmDeleteDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
    >
      <v-card :class="{ 'dialog-card--dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="white--text">Eliminar</span>
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
                Está a punto de eliminar el procedimiento policial {{`Id: ${editedItem.id} `}}  ¿desea continuar?.                            
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
    name       : "procedimientosPoliciales",        
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
      page                      : 1,

      policeProcedureDialog     : false,        
      confirmDeleteDialog       : false,

      editedIndex               : -1,
      validForm                 : false,  
      buttonClicked             : false,

      editedItem                : {
        informesid                : null,
        id                        : null,
        fecha                     : null,
        detallE_PROCEDIMIENTO_POL : '',
        condicioN_POLICIALID      : null,
      },
      defaultItem               : {
        fecha                     : null,
        detallE_PROCEDIMIENTO_POL : '',
        condicioN_POLICIALID      : null,                                                        
      },
      headers                   : [
        { text : "Id"                    , value : "id"                            , groupable : false, sortable : false },                            
        { text : "Fecha"                 , value : "fechA_PROCEDIMIENTO_POL"       , groupable : false, sortable : false },
        { text : "Procedimiento policial", value : "detallE_PROCEDIMIENTO_POL"     , groupable : false, sortable : false },
        { text : "Condición policial"    , value : "condicioN_POLICIAL.descripcion", groupable : false, sortable : false },                                                        
        { text : "Acciones"              , value : "acciones"                      , groupable : false, sortable : false },  
      ],
      itemsCondicionPolicial    : [],                                                    
/* Calendario */                        
      policeProcedureDate : {
        date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
        dateFormatted : null,
        menu          : false,
        minDate       : "2024-02-01",
        maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      },                        
/* Validaciones */
      rules               : {
        required        : [ (v) => !!v || "Este campo es requerido", ],
        maxCharacters   : [ (v) => v.length <= 2000 || "Máximo 2000 caracteres", ],
      },                                     
    }),     
    computed   : {
      ...mapGetters("procedimientosPolicialesStore", [ "procedimientosPoliciales", "pages", "isLoading" ]),                                            
      formTitle () {
        return { title: this.editedIndex === -1 ? 'Nuevo Procedimiento Policial' : 'Editar Procedimiento Policial', subtitle: this.editedIndex === -1 ? '' : `Id: ${this.editedItem.id} - ${this.editedItem.condicioN_POLICIAL.descripcion}` }  
      },        
    },
    async beforeMount() {
      await this.getData()
      const respCondicionPolicial = await this.getListCondicionPolicial()
      this.itemsCondicionPolicial = respCondicionPolicial.data                
    },          
/*	🚀 Watch
		- policeProcedureDialog : Se encarga de cerrar el diálogo de procedimiento policial y resetear las validaciones cuando el valor cambia
		- policeProcedureDate   : Se encarga de formatear la fecha obtenida desde el backend para desplegarla en el campo de fecha del formulario,
															y estableciendo el valor formateado en policeProcedureDate.dateFormatted
                                
*/        
    watch      : {
      async policeProcedureDialog (val) {
        val || this.closePoliceProcedureDialog();
        this.resetValidation();
      },
      policeProcedureDate: {
        deep: true,
        async handler() {
          this.policeProcedureDate.dateFormatted = this.formatDate(this.editedItem.fecha)
        }
      },                         
    },             
/*  🚀 Métodos    
    - getData                     : Se encarga de obtener la lista de procedimientos policiales preliminares desde el backend
    - editItem                    : Se encarga de abrir el diálogo de procedimiento policial y establecer los valores del 
                                    procedimiento policial seleccionado para editarlo
    - save                        : Se encarga de guardar un nuevo procedimiento policial o actualizar uno existente, dependiendo 
                                    de si se está editando o creando uno nuevo
    - deleteItem                  : Se encarga de eliminar un procedimiento policial seleccionado
    - closePoliceProcedureDialog  : Se encarga de cerrar el diálogo de procedimiento policial y resetear las validaciones
    - closeConfirmDeleteDialog    : Se encarga de cerrar el diálogo de confirmación de eliminación y resetear las validaciones
    - formatDate                  : Se encarga de formatear la fecha obtenida desde el backend para desplegarla en el campo de 
                                    fecha del formulario
    - parseDate                   : Se encarga de parsear la fecha obtenida desde el campo de fecha del formulario para enviarla al 
                                    backend en el formato correcto
    - formatDateTime              : Se encarga de formatear la fecha y hora obtenida desde el backend para desplegarla en el 
                                    campo de fecha y hora del formulario
    - getFormatDate               : Se encarga de formatear la fecha obtenida desde el backend para desplegarla en la tabla de 
                                    procedimientos policiales
*/
    methods    : {
      async getData() {
        if ( this.tipoInforme == 'Preliminar' ) {
          await this.getListProcedimientosPolicialesPreliminares(this.informesId)
        }
        if ( this.tipoInforme == 'Incidente' ) {
          await this.getListProcedimientosPolicialesIncidentes(this.informesId)
        }
        if ( this.tipoInforme == 'Final' ) {
          await this.getListProcedimientosPolicialesFinales(this.informesId)
        }

      },

      async editItem (item) {
        this.resetValidation();
        this.editedIndex                       = this.procedimientosPoliciales.indexOf(item);
        this.editedItem                        = Object.assign({}, item);
        this.editedItem.fecha                  = this.formatDateTime(item.fechA_PROCEDIMIENTO_POL,'date')
        this.policeProcedureDate.dateFormatted = this.formatDate(this.editedItem.fecha)                            
        this.editedItem.condicioN_POLICIALID   = { "id" : item.condicioN_POLICIALID  }
        this.policeProcedureDialog             = true;
      },

      async confirmDeleteItem(item) {
        this.editedIndex         = item.id;
        this.editedItem          = Object.assign({}, item);
        this.confirmDeleteDialog = true;
      },

      async deleteItem() {
        let res = null
        if ( this.tipoInforme == 'Preliminar' ) {
          res = await this.deleteProcedimientosPolicialesPreliminares(this.editedItem)
        } else if ( this.tipoInforme == 'Incidente' ) {
          res = await this.deleteProcedimientosPolicialesIncidentes(this.editedItem)
        } else if ( this.tipoInforme == 'Final' ) {
          res = await this.deleteProcedimientosPolicialesFinales(this.editedItem)
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
          fechA_PROCEDIMIENTO_POL   : this.editedItem.fecha                    ,
          detallE_PROCEDIMIENTO_POL : this.editedItem.detallE_PROCEDIMIENTO_POL, 
          condicioN_POLICIALID      : typeof(this.editedItem.condicioN_POLICIALID) === 'object' ? this.editedItem.condicioN_POLICIALID.id : this.editedItem.u_INFOcondicioN_POLICIALIDRMANTE,                                       
        }
				try {
					let resp = null
					if (this.editedIndex > -1) {
            if ( this.tipoInforme == 'Preliminar' ) {
              resp = await this.putProcedimientosPolicialesPreliminares({
                PRELIMINARESID : this.informesId   ,                 
                id             : this.editedItem.id,
                ...payload,
              })
            } else if ( this.tipoInforme == 'Incidente' ) {

            resp = await this.putProcedimientosPolicialesIncidentes({
                incidentesid   : this.informesId   ,                 
                id             : this.editedItem.id,
                ...payload,
              })
            } else if ( this.tipoInforme == 'Final' ) {
              resp = await this.putProcedimientosPolicialesFinales({
                finalesid     : this.informesId   ,                 
                id            : this.editedItem.id,
                ...payload,
              })
            }
						if (resp.status == 200) {
							toastr.success("Se ha actualizado la información correctamente", "Éxito!");
							this.page = 1
							await this.getData()
							await this.closePoliceProcedureDialog()
							return
						}

						toastr.error(`Error ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
						this.buttonClicked = false
						return
					} else { 
            if ( this.tipoInforme == 'Preliminar' ) {           
              resp = await this.postProcedimientosPolicialesPreliminares({
                PRELIMINARESID : this.informesId,                   
                ...payload
              })
            } else if ( this.tipoInforme == 'Incidente' ) {
              resp = await this.postProcedimientosPolicialesIncidentes({
                incidentesid    : this.informesId,    
                ...payload
              })
            } else if ( this.tipoInforme == 'Final' ) {
              resp = await this.postProcedimientosPolicialesFinales({
                finalesid    : this.informesId,    
                ...payload
              })
            }
            if (resp.status == 200) {
              toastr.success("Se ha creado correctamente el procedimiento policial", "Éxito!");
              this.page = 1
              await this.getData()
              await this.closePoliceProcedureDialog()
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
					toastr.error("Ha ocurrido un error al guardar el procedimiento policial", "Error!");
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
      validObjectRule(value) {
        return value && value.id ? true : 'Este campo es requerido'
        },                                 
      async closePoliceProcedureDialog() {
        this.policeProcedureDialog             = false    
        this.editedItem                        = Object.assign({}, this.defaultItem);
        this.editedIndex                       = -1;
        this.policeProcedureDate.dateFormatted = '';
        this.resetValidation()
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },    
      async closeConfirmDeleteDialog() {
        this.confirmDeleteDialog = false    
        this.editedItem          = Object.assign({}, this.defaultItem);
        this.editedIndex         = -1;
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
    ...mapActions("procedimientosPolicialesStore", [  "getListProcedimientosPolicialesPreliminares", "getListProcedimientosPolicialesIncidentes", "getListProcedimientosPolicialesFinales",
                                                      "putProcedimientosPolicialesPreliminares"    , "putProcedimientosPolicialesIncidentes"    , "putProcedimientosPolicialesFinales"    ,
                                                      "postProcedimientosPolicialesPreliminares"   , "postProcedimientosPolicialesIncidentes"   , "postProcedimientosPolicialesFinales"   ,
                                                      "deleteProcedimientosPolicialesPreliminares" , "deleteProcedimientosPolicialesIncidentes" , "deleteProcedimientosPolicialesFinales" ]),
    ...mapActions("condicionPolicialStore"       , [  "getListCondicionPolicial" ]), 
    },
  }
</script>
<style scoped>
	/* Barra de herramientas*/
	.toolbar {
		padding: 10px 2px 12px;
		align-items: flex-start;
		gap: 10px;
		border-bottom: 1px solid #d8e4f0;
	}
	.toolbar ::v-deep .v-spacer {
		max-width: 10px;
		flex: 0 0 10px;
	}
	.toolbar ::v-deep .toolbar-btn-new {
		border-radius: 10px;
		border: 1px solid transparent;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
		font-size: 0.76rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: none;
		transition: all 0.18s ease;
	}
	.toolbar ::v-deep .toolbar-btn-new:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
	}
	.toolbar ::v-deep .toolbar-items {
		max-width: 250px;
		min-width: 220px;
	}
	.toolbar ::v-deep .toolbar-items .v-input__slot {
		border-radius: 10px !important;
	}
	.toolbar ::v-deep .toolbar-items.v-input--is-focused .v-input__slot {
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
	}
	.toolbar ::v-deep .toolbar-items .v-label,
	.toolbar ::v-deep .toolbar-items input,
	.toolbar ::v-deep .toolbar-items .v-select__selection {
		font-size: 0.95rem;
		font-weight: 400;
		letter-spacing: 0.015em;
	}
	.toolbar ::v-deep .toolbar-items .v-input__append-inner .v-icon {
		font-size: 16px;
		opacity: 0.86;
	}
/* Tabla de datos */
	.tabla {
		border: 1px solid #d4e0ec;
		border-radius: 12px;
		overflow: hidden;
		background-color: #ffffff;
    display: block;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
	}
	.tabla ::v-deep .v-data-table__wrapper {
		overflow-x: auto;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
	}
	.tabla ::v-deep table {
    width: max-content;
    min-width: 100%;
    margin: 0 auto;
	}
	.tabla ::v-deep thead tr {
		background: #edf4fb;
	}
	.tabla ::v-deep th {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #2b4963;
		white-space: nowrap;
	}
	.tabla ::v-deep tbody td {
		font-size: 0.82rem;
		font-weight: 300;
		color: #2f4359;
		vertical-align: top;
	}
	.tabla ::v-deep tbody tr:nth-child(even) {
		background-color: #fbfdff;
	}
	.tabla ::v-deep tbody tr:hover {
		background-color: #f1f7fe;
	}
	.tabla-acciones {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
    min-width: 100px;
	}
	.tabla-acciones ::v-deep .v-btn--icon {
		width: 36px;
		height: 36px;
	}
	.tabla-acciones ::v-deep .accion-btn {
		position: relative;
		width: 37px;
		height: 37px;
		min-width: 37px;
		border-radius: 10px;
		border: 1px solid #cfdae6;
		background: linear-gradient(180deg, #ffffff 0%, #f4f8fc 100%);
		box-shadow: 0 1px 2px rgba(25, 56, 84, 0.08);
		transition: all 0.18s ease;
	}
	.tabla-acciones ::v-deep .accion-btn .v-icon {
		font-size: 17px;
		opacity: 0.95;
		transition: color 0.18s ease;
	}
	.tabla-acciones ::v-deep .accion-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 14px rgba(24, 62, 96, 0.14);
	}
	.tabla-acciones ::v-deep .accion-btn:disabled,
	.tabla-acciones ::v-deep .accion-btn.v-btn--disabled {
		opacity: 0.42;
		box-shadow: none;
		transform: none;
		border-color: #d8e2ec;
	}
	.tabla-acciones ::v-deep .accion-btn--edit .v-icon     { color: #2c6281; }
	.tabla-acciones ::v-deep .accion-btn--delete .v-icon   { color: #a1462f; }
	.tabla-acciones ::v-deep .accion-btn--edit:hover     { border-color: #8fb5cc; background: #ebf4fb; }
	.tabla-acciones ::v-deep .accion-btn--delete:hover   { border-color: #bf8673; background: #f5e8e2; }
  
  /* Dialogs */
	.dialog {
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		--form-control-font-size: 0.84rem;
		--dialog-primary: #0b3c5d;
		--dialog-primary-soft: #16527b;
		--dialog-accent: #f4b400;
		--dialog-surface: #f5f9fd;
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
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: capitalize;
	}
	.dialog ::v-deep .v-card__subtitle .text-h8 {
		font-weight: 300;
		letter-spacing: 0.03em;
		opacity: 0.95;
	}
  .dialog ::v-deep .v-label,
	.dialog ::v-deep .v-input input,
	.dialog ::v-deep .v-input textarea,
	.dialog ::v-deep .v-btn {
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		letter-spacing: 0.012em;
		font-weight: 300;
	}
	.dialog ::v-deep .v-input .v-label,
	.dialog ::v-deep .v-input input,
	.dialog ::v-deep .v-input textarea,
	.dialog ::v-deep .v-select__selection,
	.dialog ::v-deep .v-select__selections {
		font-size: var(--form-control-font-size) !important;
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
	.dialog ::v-deep .v-btn {
		font-size: 0.8rem;
		font-weight: 400;
		letter-spacing: 0.03em;
		text-transform: none;
	}
/* Panel */  
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

  .supplementary-list--dark ::v-deep .tabla,
  .supplementary-list--dark ::v-deep .tabla .v-data-table__wrapper,
  .supplementary-list--dark ::v-deep .tabla table {
    background-color: #18232e !important;
    border-color: #405364 !important;
  }

  .supplementary-list--dark ::v-deep thead tr,
  .supplementary-list--dark ::v-deep .tabla thead tr,
  .supplementary-list--dark ::v-deep .tabla thead th {
    background: #22313e !important;
    color: #d6e0e8 !important;
  }

  .supplementary-list--dark ::v-deep th {
    color: #aebdca !important;
  }

  .supplementary-list--dark ::v-deep td {
    color: #e6edf3;
    border-color: #30404e !important;
  }

  .supplementary-list--dark ::v-deep .tabla tbody tr,
  .supplementary-list--dark ::v-deep .tabla tbody td {
    background-color: #18232e !important;
    color: #e6edf3 !important;
  }

  .supplementary-list--dark ::v-deep .tabla tbody tr:nth-child(even),
  .supplementary-list--dark ::v-deep .tabla tbody tr:nth-child(even) > td {
    background-color: #202d39 !important;
  }

  .supplementary-list--dark ::v-deep .tabla tbody tr:hover,
  .supplementary-list--dark ::v-deep .tabla tbody tr:hover > td {
    background-color: #2a3947 !important;
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