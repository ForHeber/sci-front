<template>
  <v-container fluid :class="{ 'supplementary-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0 supplementary-list" :class="{ 'supplementary-list--dark': $vuetify.theme.dark }">
      <v-card-title class="toolbar">
        <v-btn 
          class  = "toolbar-btn-new" 
          color  = "primary"
          dark
          @click = "involvedDialog = true"
        >
          NUEVO INVOLUCRADO
        </v-btn>                
        </v-card-title>              
<!-- Lista de involucrados -->            
          <v-container fluid>
            <v-data-table
              class        = "tabla"						
              :headers     = "headers"
              :loading     = "isLoading"
              loading-text = "Cargando... por favor espere"
              :items       = "involucrados"
              disable-pagination
              hide-default-footer
            >
              <template v-slot:item.r_INVOLUCRADO.nombres = "{ item }">
                {{ item.r_INVOLUCRADO.nombres }} {{ item.r_INVOLUCRADO.apellidO_PATERNO }} {{ item.r_INVOLUCRADO.apellidO_MATERNO }}
              </template>                               
<!--
    Acciones
        - Eliminar
--> 
              <template v-slot:item.acciones="{ item }"> 
                <div class="tabla-acciones">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn 
                        icon 
                        v-on   = "on" 
                        @click = "confirmDeleteItem(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>                                                                
                    </template>
                    <span>Eliminar</span>
                  </v-tooltip>
                </div>																	
              </template>           
<!--  Mensaje cuando no hay data -->                    
              <template v-slot:no-data>
                No se han encontrado involucrados registrados en el sistema
              </template>          
            </v-data-table>                    
<!--  Paginación -->
            <v-row class="text-center" dense>
              <v-col cols="12">
                <v-pagination
                  v-model        = "page"
                  :length        = "this.pages"
                  :total-visible = "10"
                  :disabled      = "isLoading || pages == 1"
                />
                <br />
              </v-col>
            </v-row>                                                
          </v-container>                                                 
        </v-card>
<!--
  👉 involvedDialog
      • Componente que despliega formulario para crear un nuevo involucrado o actualizar uno existente
--> 
        <v-dialog
            v-model    = "involvedDialog"
            :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
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
                        <p class="panel-title mb-1">Involucrados</p>
                        <p class="panel-subtitle mb-0">Identifique si es Militar o Civil y de acuerdo a ello complete la información correspondiente.</p>
                      </div>
                      <v-row class="panel-fields-row" dense>
                        <v-col cols="12">
                          <v-radio-group 
                            v-model = "editedItem.tipO_INVOLUCRADO"
                            class   = "radio-group"
                            row
                          >
                            <v-radio 
                              class = "radio"														
                              label = "Militar" 
                              value = "M"
                            />
                            <v-radio 
                              class = "radio"
                              label = "Civil"   
                              value = "C"
                            />
                          </v-radio-group>
                        </v-col>
<!--  Militar -->                                    
                        <v-row class="panel-fields-row" dense v-if = "editedItem.tipO_INVOLUCRADO === 'M'">
                          <v-col cols="12" class="text-center">
                            <v-btn
                              color = "primary"
                              text
                              outlined
                              class = "search-btn"																				
                              @click = "personaDialog = true"
                            >
                              Buscar Persona
                              <v-icon>mdi-magnify-plus-outline</v-icon>
                            </v-btn>
                          </v-col> 
                          <v-col cols="12">
                            <v-alert
                              border    = "left"
                              type      = "info"
                              elevation = "2"
                              class     = "mt-2"
                              colored-border                                        
                              prominent
                              v-if = "!editedItem.run"
                            >
                              <span class="alerta"> Debe seleccionar una persona desde el botón "Buscar persona"</span>
                            </v-alert>    
                            <v-card
                                class     = "card"
                                elevation = "0"
                                v-else
                              > 
                                <v-card-text>
                                  <v-row class="row">
                                    <v-col cols="12" md="4" class="text-center">
                                      <v-avatar
                                        size  = "210px"
                                        class = "mt-2 Avatar avatar"
                                      >
                                        <v-img
                                          lazy-src = "/avatar.svg"
                                          :src     = "editedItem.persona.foto"
                                          contain
                                        />
                                      </v-avatar>
                                    </v-col>
                                    <v-col cols="12" md="8" class="data">
                                      <div class="line">
                                        <span class="label">Grado</span>
                                        <span class="value">{{  editedItem.persona.grado || '-' }}</span>
                                      </div>
                                      <div class="line">
                                        <span class="label">Nombres</span>
                                        <span class="value">{{ editedItem.persona.nombres || '-' }}</span>
                                      </div>
                                      <div class="line">
                                        <span class="label">Apellidos</span>
                                        <span class="value">{{ editedItem.persona.apellidO_PATERNO || '-' }} {{ editedItem.persona.apellidO_MATERNO || '' }}</span>
                                      </div>
                                      <div class="line">
                                        <span class="label">Unidad</span>
                                        <span>
                                          <v-autocomplete
                                          v-model    = "editedItem.unidad"
                                          :items     = "itemsUnidades"
                                          :item-text = "getUnidadText"
                                          item-value = "codigo"
                                          :disabled  = "!editedItem.run ? true : false"      
                                          :rules     = "rules.required" 
                                          prepend-inner-icon = "mdi-form-select"
                                          dense
                                          hide-details       = "auto"
                                          return-object
                                          />
                                        </span>
                                      </div>																																					
                                    </v-col>
                                  </v-row>
                                </v-card-text>
                            </v-card>                                                              
                          </v-col>
                        </v-row>
<!-- civil ( run, nombres, apellido parterno y materno ) -->                                    
                        <v-row v-else>
                          <v-col cols="12">
                            <v-text-field
                              v-model            = "editedItem.run"
                              placeholder        = "Ej: 90601528"
                              hint               = "( Debe ingresar RUN sin puntos, guion, ni dígito verificador )"
                              label              = "RUN"
                              type               = "number"
                              :min               = "1"
                              :max               = "99999999"
                              maxlength          = "8"                                            
                              control-variant    = "hidden"
                              :rules             = "rules.validRun"   
                              prepend-inner-icon = "mdi-number"																				                                                
                            />
                          </v-col> 
                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model            = "editedItem.nombres"
                              label              = "Nombres"
                              density            = "compact"
                              :rules             = "rules.required"     
                              :disabled          = "!editedItem.run ? true : false"
                              maxlength          = "30"
                              prepend-inner-icon = "mdi-text"                                                
                            />
                          </v-col> 
                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model            = "editedItem.apellidO_PATERNO"
                              label              = "Apellido paterno"
                              density            = "compact"
                              maxlength          = "15"                                                                                        
                              :rules             = "rules.required"
                              :disabled          = "!editedItem.run ? true : false"
                              prepend-inner-icon = "mdi-text"
                            />
                          </v-col> 
                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model            = "editedItem.apellidO_MATERNO"
                              label              = "Apellido materno"
                              density            = "compact"
                              maxlength          = "15"                                                                                                                      
                              :rules             = "rules.required" 
                              :disabled          = "!editedItem.run ? true : false"
                              prepend-inner-icon = "mdi-text"
                            />
                          </v-col> 
                        </v-row>
                        <v-row>
<!-- Fecha (calendario) -->                                        
                          <v-col cols="12" md="6">
                            <v-menu
                              ref                     = "menu"
                              v-model                 = "nacimientoDate.menu"
                              :close-on-content-click = "false"
                              transition              = "scale-transition"
                              offset-y
                              :max-width              = "$vuetify.breakpoint.mdAndUp ? '80vw' : '20vw'"
                              min-width               = "auto"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model            = "nacimientoDate.dateFormatted"
                                  label              = "Fecha de nacimiento"
                                  hint               = "DD/MM/YYYY"
                                  persistent-hint
                                  readonly
                                  prepend-inner-icon = "mdi-calendar"
                                  v-bind             = "attrs"
                                  @blur              = "editedItem.fechA_NACIMIENTO = parseDate(nacimientoDate.dateFormatted)"
                                  v-on               = "on"
                                  :disabled          = "!editedItem.run ? true : false"                                                               
                                />
                              </template>
                              <v-date-picker
                                v-model            = "editedItem.fechA_NACIMIENTO"
                              :dark              = "$vuetify.theme.dark"
                                locale             = "es"                                                                                        
                                :min               = "nacimientoDate.minDate"
                                :max               = "nacimientoDate.maxDate"
                                :first-day-of-week = "1"
                                @input             = "nacimientoDate.menu = false"
                                no-title                                            
                              />
                            </v-menu>
                          </v-col>                                          
<!-- Contacto -->
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model            = "editedItem.fono"
                              label              = "Télefono"
                              placeholder        = "+56"
                              density            = "compact"
                              maxlength          = "12"
                              :disabled          = "!editedItem.run ? true : false"                                                       
                              prepend-inner-icon = "mdi-phone-outline"
                            /> 
                          </v-col>                                        
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model            = "editedItem.correointer"
                              label              = "Correo eléctrónico"
                              density            = "compact"
                              maxlength          = "40"
                              :disabled          = "!editedItem.run ? true : false" 
                              prepend-inner-icon = "mdi-email-outline"
                              :rules             = "[validEmailRule]"                                                
                            /> 
                          </v-col>                                           
<!--	Interviniente -->
                          <v-col cols="12" md="6">
                            <v-autocomplete
                              v-model            = "editedItem.tipO_INTERVINIENTE"
                              :items             = "itemsTipoIntervinientes"
                              item-text          = "descripcion"
                              item-value         = "id"
                              label              = "Interviniente"
                              :disabled          = "!editedItem.run ? true : false"      
                              :rules             = "[validObjectRule]"
                              outlined                                        
                              return-object
                              prepend-inner-icon = "mdi-form-select"
                            />
                          </v-col>
<!-- Consumo -->
                          <v-col cols="12" md="6">
                            <v-autocomplete
                              v-model            = "editedItem.tipO_CONSUMO"
                              auto-select-first
                              :items             = "itemsTipoConsumos"
                              item-text          = "descripcion"
                              item-value         = "id"
                              label              = "Consumo"
                              :disabled          = "!editedItem.run ? true : false"      
                              :rules             = "[validObjectRule]"
                              outlined                                        
                              return-object
                              prepend-inner-icon = "mdi-form-select"																				
                            />
                          </v-col> 
<!-- Estado de salud -->  
                          <v-col cols="12" md="6">
                            <v-autocomplete
                              v-model            = "editedItem.estadO_SALUD"
                              :items             = "itemsEstadosSalud"
                              item-text          = "descripcion"
                              item-value         = "id"
                              label              = "Estado de Salud"
                              :disabled          = "!editedItem.run ? true : false"      
                              :rules             = "[validObjectRule]"
                              outlined                                        
                              return-object
                              prepend-inner-icon = "mdi-form-select"
                            />
                          </v-col>                                                                            
                        </v-row>
                      </v-row>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>                
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="pa-20"
                color = "secondary"
                text
                outlined
                @click = "involvedDialog = false"
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
      • Componente que despliega mensaje que confirma y cancela la eliminación del involucrado seleccionado
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
                                Está a punto de eliminar a {{`Run: ${editedItem.ruT_INVOLUCRADO} `}}, ¿desea continuar?.
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
<!-- 
    👉 personaDialog
      • Componente que despliega formulario para la busqueda y selección del personal a 
        agregar ( Import components/addPersona.vue )
-->
        <v-dialog
            v-model = "personaDialog"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition"
            scrollable
        >
            <v-card :class="{ 'dialog-card--dark': $vuetify.theme.dark }">
                <v-card-title class="primary">
                    <span class="text-h5 white--text">BUSCAR PERSONAL</span>
                    <v-spacer />
                    <v-btn dark icon @click="personaDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <add-persona :key="Date.now()" @addPersona="addPersona" />
                </v-card-text>
            </v-card>
        </v-dialog>                
    </v-container>
</template>

<script>
  import { mapGetters, mapActions } from "vuex"
  import toastr, { error } from 'toastr'
  import 'toastr/build/toastr.min.css'

  import AddPersona   from "@/components/base/addPersona";

  export default {
    name       : "involucrados",        
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
      AddPersona,
    },           
    data       : () => ({
      page                    : 1,
      involvedDialog          : false,        
      confirmDeleteDialog     : false,   
      personaDialog           : false,
      editedIndex             : -1   ,
      validForm               : false,  
      buttonClicked           : false,
      editedItem              : {
        informesid         : null,    
        id                 : null,                                                                              
        tipO_INVOLUCRADO   : 'M',
        run                : null,
        persona            : {},                                                    
        unidad             : {},
        fechA_NACIMIENTO   : null,
        fono               : null,
        correointer        : null,
        grado              : null,
        nombres            : null,
        apellidO_PATERNO   : null,
        apellidO_MATERNO   : null,
        tipO_INTERVINIENTE : {},
        tipO_CONSUMO       : {},
        estadO_SALUD       : {},
        ruT_INVOLUCRADO    : null,                                                      
      },
      defaultItem             : {
        tipO_INVOLUCRADO   : 'M',
        run                : null,
        ruT_INVOLUCRADO    : null,                                                      
        persona            : {},                                                    
        unidad             : {},
        fechA_NACIMIENTO   : null,
        fono               : null,
        correointer        : null,
        grado              : null,                                                    
        nombres            : null,
        apellidO_PATERNO   : null,
        apellidO_MATERNO   : null,
        tipO_INTERVINIENTE : {},
        tipO_CONSUMO       : {},
        estadO_SALUD       : {},
      },
      headers                 : [
        { text : "Run"           , value : "ruT_INVOLUCRADO"         , groupable : false, sortable : false },
        { text : "Nombre"        , value : "r_INVOLUCRADO.nombres"   , groupable : false, sortable : false },      
        { text : "Alcohol/Drogas", value : "tipO_CONSUMO.descripcion", groupable : false, sortable : false },                            
        { text : "Salud"         , value : "estadO_SALUD.descripcion", groupable : false, sortable : false },
        { text : "Unidad"        , value : "u_INVOLUCRADO.sigla"     , groupable : false, sortable : false },                                                      
        { text : "Acciones"      , value : "acciones"                , groupable : false, sortable : false },  
      ],
      itemsUnidades           : [],    
      itemsTipoIntervinientes : [],
      itemsTipoConsumos       : [],
      itemsEstadosSalud       : [],                    
/* Calendario */                        
      nacimientoDate     : {
        date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
        dateFormatted : null,
        menu          : false,
        minDate       : "1930-01-01",
        maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      },                        
/* Validaciones */
      rules           : {
        required : [	(v) => !!v || "Este campo es requerido",	],
        validRun : [	(v) => !!v                    || "Este campo es requerido",
                      (v) => v > 0                  || 'Debe ser mayor a cero',                                                            
                      (v) => /^[0-9]{1,8}$/.test(v) || 'Debe contener hasta 8 dígitos',
        ]
      },  
    }),     
    computed   : {
      ...mapGetters("involucradosStore", [ "involucrados", "pages", "isLoading" ]),                                                        
      formTitle () {
        return { title: this.editedIndex === -1 ? 'Nuevo Involucrado' : 'Editar Involucrado', subtitle: this.editedIndex === -1 ? '' : `Nombre: ${this.editedItem.nombres} ${this.editedItem.apellidO_PATERNO} ${this.editedItem.apellidO_MATERNO}`   }													
      },        
    },
    async beforeMount() {
      await this.getData()
      const respUnidades           = await this.getListUnidades()
      this.itemsUnidades           = respUnidades.data.listaUnidades

      const respEstadosSalud       = await this.getListEstadoSalud()
      this.itemsEstadosSalud       = respEstadosSalud.data  

      const respTipoIntervinientes = await this.getListTipoInterviniente()
      this.itemsTipoIntervinientes = respTipoIntervinientes.data    

      const respTipoConsumos       = await this.getListTipoConsumo()
      this.itemsTipoConsumos       = respTipoConsumos.data  
    },          
/*	🚀 Watch
    - involvedDialog: Cuando se cierra el dialog de involucrados, se resetea el formulario
    - nacimientoDate: Cuando se cambia la fecha de nacimiento, se formatea la fecha para mostrarla en el input
*/ 
    watch      : {
      async involvedDialog (val) {
        val || this.closeInvolvedDialog();
        this.resetValidation();
      },
      nacimientoDate: {
        deep: true,
        async handler() {
          this.nacimientoDate.dateFormatted = this.formatDate(this.editedItem.fechA_NACIMIENTO)
        }
      },                        
    },             
    methods    : {
      async getData() {
        if (this.tipoInforme == 'Preliminar') {
          await this.getListInvolucradosPreliminares(this.informesId)
        } else if (this.tipoInforme == 'Incidente') {
          await this.getListInvolucradosIncidentes(this.informesId)
        }	else if (this.tipoInforme == 'Final') {
          await this.getListInvolucradosFinales(this.informesId)
        }
      },
      async addPersona(item) {
        this.editedItem.persona          = item
        this.editedItem.run              = item.run
        this.editedItem.grado            = item.grado
        this.editedItem.nombres          = item.nombres
        this.editedItem.apellidO_PATERNO = item.apellidO_PATERNO
        this.editedItem.apellidO_MATERNO = item.apellidO_MATERNO
        this.editedItem.unidad           = item.unidadcodigo
        this.editedItem.fono             = item.fono
        this.editedItem.correointer      = item.correointer
        this.personaDialog               = false
      },                        
      confirmDeleteItem(item) {
        this.editedIndex         = item.id;
        this.editedItem          = Object.assign({}, item);
        this.confirmDeleteDialog = true;
      },

      async deleteItem() {
        let res
        if (this.tipoInforme == 'Preliminar') {
          res = await this.deleteInvolucradosPreliminares(this.editedItem)
        } else if (this.tipoInforme == 'Incidente') {
          res = await this.deleteInvolucradosIncidentes(this.editedItem)
        } else if (this.tipoInforme == 'Final') {
          res = await this.deleteInvolucradosFinales(this.editedItem)
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
          tipO_INVOLUCRADO          : this.editedItem.tipO_INVOLUCRADO     ,
          ruT_INVOLUCRADO           : this.editedItem.run                  , 
          unidaD_INVOLUCRADO        : this.editedItem.tipO_INVOLUCRADO == 'C' ? '0' : this.editedItem.unidad,
          fechA_NACIMIENTO          : this.editedItem.fechA_NACIMIENTO     ,
          tipO_INTERVINIENTEID      : this.editedItem.tipO_INTERVINIENTE.id,
          tipO_CONSUMOID            : this.editedItem.tipO_CONSUMO.id      ,
          estadO_SALUDID            : this.editedItem.estadO_SALUD.id       ,
          grado                     : this.editedItem.tipO_INVOLUCRADO == 'C' ? ' ' : this.editedItem.grado,
          nombres                   : this.editedItem.nombres              ,
          apellidO_PATERNO          : this.editedItem.apellidO_PATERNO     ,
          apellidO_MATERNO          : this.editedItem.apellidO_MATERNO     ,
          fono                      : this.editedItem.fono                 ,
          correointer               : this.editedItem.correointer          ,
        }
        try {
          let resp = null
          if (this.tipoInforme == 'Preliminar') {
            resp = await this.postInvolucradosPreliminares({
              PRELIMINARESID : this.informesId,                   
              ...payload
            })
          } else if (this.tipoInforme == 'Incidente') {
            resp = await this.postInvolucradosIncidentes({
              incidentesid : this.informesId,
              ...payload
            })
          } else if (this.tipoInforme == 'Final') {
            resp = await this.postInvolucradosFinales({
              finalesid : this.informesId,
              ...payload
            })
          }
          if (resp.status == 200) {
            toastr.success("Se ha creado correctamente el involucrado", "Éxito!");
            this.page = 1
            await this.getData()
            await this.closeInvolvedDialog()
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
        } catch (error) {
          toastr.error("Ha ocurrido un error al guardar el involucrado", "Error!");
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
      validEmailRule(value) {
        return !value || /.+@.+/.test(value) ? true : 'El correo electrónico debe ser válido'
      },                          
      async closeInvolvedDialog() {
        this.involvedDialog               = false    
        this.editedItem                   = Object.assign({}, this.defaultItem);
        this.nacimientoDate.dateFormatted = '';
        this.resetValidation()
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },    
      async closeConfirmDeleteDialog() {
        this.confirmDeleteDialog = false    
        this.editedItem          = Object.assign({}, this.defaultItem);
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
      getUnidadText(item) {
        if (item.codigo) {
          return `${item.codigo.toUpperCase()} - ${item.sigla.toUpperCase()} - ${item.descripcion.toUpperCase()}`;
        }
      },          
      ...mapActions("involucradosStore"      , [	"getListInvolucradosPreliminares", "getListInvolucradosIncidentes" , "getListInvolucradosFinales",
                                                  "postInvolucradosPreliminares"   , "postInvolucradosIncidentes"    , "postInvolucradosFinales",
                                                  "deleteInvolucradosPreliminares" , "deleteInvolucradosIncidentes"  , "deleteInvolucradosFinales"  ]),
      ...mapActions("estadoSaludStore"       , [	"getListEstadoSalud"             , ]),
      ...mapActions("tipoConsumoStore"       , [	"getListTipoConsumo"             , ]),                        
      ...mapActions("tipoIntervinienteStore" , [	"getListTipoInterviniente"       , ]),
      ...mapActions("unidadesStore"          , [	"getListUnidades"                , ]),                         
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
  /* radio buttons */
  .radio-group {
    margin-top: 2px;
    padding: 7px 10px;
    border-radius: 12px;
    border: 1px solid rgba(133, 155, 179, 0.26);
    background: linear-gradient(145deg, #fafcff 0%, #eef4fa 100%);
  }

  .radio-group ::v-deep .v-input--radio-group__input {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
  }

  .radio {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding: 4px 10px;
    border-radius: 999px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(133, 155, 179, 0.28);
  }
  .radio-group ::v-deep .v-radio .v-label {
    font-size: var(--form-control-font-size);
    color: #2f4256;
    letter-spacing: 0.015em;
    font-weight: 300;
  }

  .radio-group ::v-deep .v-input--selection-controls__ripple,
  .radio-group ::v-deep .v-input--selection-controls__input {
    margin-right: 4px;
  }

  .radio-group ::v-deep .v-radio--is-active {
    background: linear-gradient(180deg, #e9f3fb 0%, #dceaf7 100%);
    border-color: #84abc9;
  }

  .radio-group ::v-deep .v-radio--is-active .v-label {
    color: #0b3c5d;
  }
/* Card Persona */
  .card {
    background    : linear-gradient(145deg, #f8fbfe 0%, #edf4fb 100%) !important;
    border        : 1px solid #bcc8d8 !important;
    border-radius : 15px !important;
  }

  .row {
    margin: 0;
    align-items: center;
  }

  .avatar {
    border: 1px solid #bdbdbd
  }

  .data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    padding: 2px 4px;
  }

  .line {
    display: flex;
    flex-direction: column;
    padding: 5px 8px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(133, 155, 179, 0.24);
  }

  .label {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    color: #51667d;
    font-weight: 400;
  }

  .value {
    font-size: 0.84rem;
    font-weight: 300;
    color: #4c5d6f;
    margin-top: 1px;
    line-height: 1.2;
  }
    .search-btn {
    border-radius  : 999px;
    padding        : 0 18px;
    letter-spacing : 0.03em;
    text-transform : none;
    transition     : all 0.2s ease;
    border-width   : 1px;
  }

  .search-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(11, 60, 93, 0.14);
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

    .dialog-card--dark ::v-deep .panel,
    .dialog-card--dark ::v-deep .card {
      background: linear-gradient(136deg, #263542 0%, #202d39 58%, #263542 100%) !important;
      border-color: #405364;
      box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
    }

    .dialog-card--dark ::v-deep .panel-title,
    .dialog-card--dark ::v-deep .panel .v-label,
    .dialog-card--dark ::v-deep .panel .v-counter,
    .dialog-card--dark ::v-deep .label {
      color: #c9d5df;
    }

    .dialog-card--dark ::v-deep .panel-subtitle,
    .dialog-card--dark ::v-deep .value {
      color: #aebdca;
    }

    .dialog-card--dark ::v-deep .panel .v-input__slot,
    .dialog-card--dark ::v-deep .line {
      background-color: #18232e;
      border-color: #405364;
    }

    .dialog-card--dark ::v-deep .panel .v-input input,
    .dialog-card--dark ::v-deep .panel .v-input textarea,
    .dialog-card--dark ::v-deep .panel .v-select__selection {
      color: #e6edf3;
    }

    .dialog-card--dark ::v-deep .panel .v-text-field--outlined fieldset {
      border-color: #526576;
    }

    .dialog-card--dark ::v-deep .radio-group {
      background: linear-gradient(145deg, #263542 0%, #202d39 100%);
      border-color: #405364;
    }

    .dialog-card--dark ::v-deep .radio {
      background-color: #18232e;
      border-color: #526576;
    }

    .dialog-card--dark ::v-deep .radio-group .v-radio .v-label {
      color: #c9d5df;
    }

    .dialog-card--dark ::v-deep .radio-group .v-radio--is-active {
      background: linear-gradient(180deg, #34495b 0%, #293c4d 100%);
      border-color: #6f9dbc;
    }

    .dialog-card--dark ::v-deep .radio-group .v-radio--is-active .v-label {
      color: #ffffff;
    }

    .dialog-card--dark ::v-deep .v-alert {
      background-color: #35252a;
      color: #f3dce0;
    }

</style>