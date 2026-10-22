<template>
  <v-container fluid :class="{ 'incidentes-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="toolbar">
<!-- Filtros de busqueda -->                
        <v-text-field
          v-model       = "search"
          :append-icon  = "search != oldSearch ? 'mdi-magnify-plus-outline' : 'mdi-magnify'"
          label         = "Buscar informe de incidentes de seguridad en el listado"
          hint          = "Escriba su criterio de búsqueda y presione 'ENTER'"
          class         = "toolbar-search toolbar-control"
          @click:append = "lookFor"
          @change       = "lookFor"
          outlined
          dense
        />
        <v-spacer />
<!-- Filtro por unidad -->
        <v-select
          v-model   = "selectedUnidad"
          :items    = "itemsUnidadesFilter"
          label     = "Filtrar por Unidad"
          class     = "toolbar-unit toolbar-control"
          item-text = "sigla"
          item-value= "codigo"
          outlined
          dense
        ></v-select>        
        <v-spacer />
<!-- Filtro por estado -->				
        <div class="toolbar-chips">
          <v-chip
            v-for="item in itemsChip"
            :key="item.value"
            pill
            class="custom-chip--toolbar"
            :class="{ 'custom-chip--toolbar-active': estado === item.value, 'custom-chip--toolbar-all': item.value === '00' }"
            :color="item.color"
            :text-color = "item.color ? 'white' : ''"
            @click="changeEstado(item.value)"
          >
            <v-icon v-if="item.value === '00'" left small>mdi-format-list-bulleted</v-icon>
            <v-icon v-else-if="estado === item.value" left small>mdi-check-circle</v-icon>
            {{ item.text }}
          </v-chip>
        </div>
        <v-spacer />  
<!-- Cantidad de items por paginas -->                 
        <v-select
          v-model = "items"
          :items  = "itemsPerPage"
          label   = "Cantidad de items por página"
          class   = "toolbar-items toolbar-control"
          outlined
          dense
        ></v-select> 
      </v-card-title>    
<!-- Lista de informes de incidentes -->            
      <v-container fluid>
        <v-data-table
          class        = "tabla"
          :headers     = "headers"
          :loading     = "isLoading"
          loading-text = "Cargando... por favor espere"
          :items       = "informes"
          :item-class  = "getItemClass"
          disable-pagination
          hide-default-footer
        >
          <template v-slot:header.incidente.fechA_HECHO>
            <span class="multiline-header">Fecha y hora<br />hecho</span>
          </template>
          <template v-slot:header.incidente.fechA_PUBLICACION>
            <span class="multiline-header">Fecha y hora<br />publicación</span>
          </template>				
          <template v-slot:item.incidente.fechA_HECHO = "{ item }">
            <div> {{ getFormatDateTime(item.incidente.fechA_HECHO).dateFormatted }}</div>
            <div> {{ getFormatDateTime(item.incidente.fechA_HECHO).timeFormatted }}</div>
          </template>
          <template v-slot:item.incidente.fechA_PUBLICACION = "{ item }">
            <div> {{ getFormatDateTime(item.incidente.fechA_PUBLICACION).dateFormatted }}</div>
            <div> {{ getFormatDateTime(item.incidente.fechA_PUBLICACION).timeFormatted }}</div>
          </template>
          <template v-slot:item.incidente.circunstanciA_HECHO = "{ item }">
            <div class="tabla-bloque"> {{ item.incidente.circunstanciA_HECHO }}</div>
          </template>					
          <template v-slot:item.motivoDevolucionInc.motivO_DEVOLUCION = "{ item }">
            <div class="tabla-bloque"  v-if="item.incidente.devuelto === 'S'"> {{ item.motivoDevolucionInc.motivO_DEVOLUCION }}</div>
          </template>
          <template v-slot:item.incidente.estado = "{ item }">
            <div>
              <v-chip 
                class  =	"custom-chip my-2"
                pill
                :color =	"customChipColor(item.incidente)"
              >
                {{customChipText(item.incidente)}}
              </v-chip>
            </div>
          </template>					
<!--
    Acciones
        - Informe
        - Informe Preliminar
        - Procedimientos policiales
        - Antecedentes judiciales
        - Involucrados
        - Archivos
        - Ampliación de informe
        - Editar 
        - Eliminar
--> 
          <template v-slot:item.acciones="{ item }">
            <div class="tabla-acciones">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--view"
                    icon 
                    v-on      = "on" 
                    @click    = "preliminaryReportView(item.incidente)"
                  >
                    <v-icon>mdi-file-powerpoint-outline</v-icon>
                  </v-btn>
                </template>
                <span>Ver informe Preliminar</span>
              </v-tooltip>							
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--view"
                    icon 
                    v-on      = "on" 
                    @click    = "incidentReportView(item.incidente)"
                  >
                    <v-icon>mdi-file-document-outline</v-icon>
                  </v-btn>
                </template>
                <span>Ver informe Incidente</span>
              </v-tooltip>					

              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--police"
                    icon 
                    v-on      = "on" 
                    @click    = "policeProcedures(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"	
                  >
                    <v-icon>mdi-police-badge</v-icon>
                  </v-btn>
                </template>
                <span>Procedimientos policiales</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--judicial"
                    icon 
                    v-on      = "on" 
                    @click    = "judicialRecords(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"										
                  >
                    <v-icon>mdi-scale-balance</v-icon>
                  </v-btn>
                </template>
                <span>Antecedentes judiciales</span>
              </v-tooltip>       
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--involved"
                    icon 
                    v-on      = "on" 
                    @click  = "involved(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"									
                  >
                    <v-icon>mdi-account-box-multiple</v-icon>
                  </v-btn>
                </template>
                <span>Involucrados</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--files"
                    icon 
                    v-on      = "on" 
                    @click = "reportFolders(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"
                  >
                    <v-icon>mdi-folder-file-outline</v-icon>
                  </v-btn>
                </template>
                <span>Archivos</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--files-plus"
                    icon 
                    v-on      = "on" 
                    @click = "supplementaryReport(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"
                  >
                    <v-icon>mdi-folder-plus-outline</v-icon>
                  </v-btn>
                </template>
                <span>Ampliación de Informe</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--edit"
                    icon 
                    v-on      = "on" 
                    @click    = "editItem(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"	
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Editar</span>
              </v-tooltip>
              <!-- <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--delete"
                    icon 
                    v-on      = "on" 
                    @click = "confirmDeleteItem(item.incidente)"
                    :disabled = "item.incidente.estado !== 2 ? true : false"	
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Eliminar</span>
              </v-tooltip> -->
            </div>
          </template>   
<!--
    Mensaje cuando no hay data
-->                    
          <template v-slot:no-data>
            No se han encontrado informes de incidentes de seguridad registrados en el sistema
          </template>
        </v-data-table>
<!--
    Paginación
-->
        <v-row class="text-center" dense>
          <v-col cols="12">
            <v-pagination
              v-model        = "page"
              :length        = "pages"
              :total-visible = "items"
              :disabled      = "isLoading || pages == 1"
            />
            <br />
          </v-col>
        </v-row>                                                
      </v-container>				
    </v-card>	
<!--
  👉 reportViewDialog
      • Componente que despliega la vista del incidente seleccionado ( Import components/reportView.vue )
-->
    <v-dialog
      v-model    = "reportViewDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
    >
      <v-card>
        <v-card-text>
          <report-view
            :item               = "editedItem"
            :icon               = "reportViewIcon"
            :titles             = "reportViewTitles"
            :tipoInforme	      = "reportViewType"
            @closeReportView    = "closeReportViewDialog"
          />
        </v-card-text>
        <v-card-actions class="px-6 py-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            outlined
            class="mr-3"
            @click="reportViewDialog = false"
          >
            Cerrar
          </v-btn>					
        </v-card-actions>
      </v-card>
    </v-dialog>	
<!--
  👉 policeProceduresDialog
      • Componente que despliega formulario para mantener los procedimientos policiales 
        ( Import components/procedimientosPoliciales.vue )
-->        
    <v-dialog 
      v-model    = "policeProceduresDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '100vw'"
    >
      <v-card>
        <v-card-title class="grey darken-4">
          <span class="text-h5 white--text">Procedimientos Policiales</span>
          <v-spacer />
          <v-btn 
            icon
            dark
            size   = "x-small"
            class  = "float-end"
            @click = "policeProceduresDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="grey darken-4">
          <span class="text-h8 white--text">{{ incidenteTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Procedimientos-Policiales v-if="policeProceduresDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Incidente'"
          />
        </v-card-text> 
      </v-card>
    </v-dialog>
<!--
  👉 judicialRecordsDialog
      • Componente que despliega formulario para mantener los antecedentes judiciales 
        ( Import components/antecedentesJudiciales.vue )
-->        
    <v-dialog 
      v-model    = "judicialRecordsDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
    >
      <v-card>
        <v-card-title class="grey darken-4">
          <span class="text-h5 white--text">Antecedentes Judiciales</span>
          <v-spacer />
          <v-btn 
            icon
            dark
            size   = "x-small"
            class  = "float-end"
            @click = "judicialRecordsDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="grey darken-4">
          <span class="text-h8 white--text">{{ incidenteTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Antecedentes-Judiciales v-if="judicialRecordsDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Incidente'"
          />
        </v-card-text> 
      </v-card>
    </v-dialog>  		
<!--
  👉 involvedDialog
      • Componente que despliega formulario para mantener los involucrados 
        ( Import components/involucrados.vue )
-->        
    <v-dialog 
      v-model    = "involvedDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '100vw'"
    >
      <v-card>
        <v-card-title class="grey darken-4">
          <span class="text-h5 white--text">Involucrados</span>
          <v-spacer />
          <v-btn 
            icon
            dark
            size   = "x-small"
            class  = "float-end"
            @click = "involvedDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="grey darken-4">
          <span class="text-h8 white--text">{{ incidenteTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Involucrados v-if="involvedDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Incidente'"
          />
        </v-card-text> 
      </v-card>
    </v-dialog> 		
<!--
  👉 incidenteDialog
      • Componente que despliega formulario para actualizar los antecedentes del incidente seleccionado 
-->                         
    <v-dialog
      v-model    = "incidenteDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '110vw'"
      class      = "dialog"
    >
      <v-card :class="{ 'incidentes-dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="text-h5 white--text">{{ formTitle.title }}</span>
        </v-card-title> 
        <v-card-subtitle class="primary">
          <span class="text-h8 white--text">{{ formTitle.subtitle }}</span>
        </v-card-subtitle>	
        <v-tabs
          v-model          = "tabs"
          class            = "tabs"
          background-color = "transparent"
          grow
        >
          <v-tab class="tab">
            <v-icon left small>mdi-account-badge-outline</v-icon>
            Informante
          </v-tab>
          <v-tab class="tab">
            <v-icon left small>mdi-file-document-edit-outline</v-icon>
            Hechos
          </v-tab>
          <v-tab class="tab">
            <v-icon left small>mdi-file-document-plus-outline</v-icon>
            Adicionales 
          </v-tab>
          <v-tab class="tab">
            <v-icon left small>mdi-pistol</v-icon>
            Armamento
          </v-tab>
          <v-tab class="tab">
            <v-icon left small>mdi-incognito	</v-icon>
            Investigación
          </v-tab>
        </v-tabs>
        <v-card-text>
          <v-form v-model = "validForm" ref="form">
            <v-container>                        
              <v-tabs-items v-model="tabs" class="full-height-tab">
<!--
  Antecedentes del informante
-->  								
                <v-tab-item eager>
                  <div ref="tabInformantePanel">
                    <v-row class="mt-4" dense>
                      <v-col cols="12" class="text-center">
                        <v-btn
                          color = "primary"
                          text
                          outlined
                          class = "informante-search-btn"
                          @click = "personaDialog = true"
                        >
                          Buscar Persona
                          <v-icon>mdi-magnify-plus-outline</v-icon>
                        </v-btn>
                      </v-col> 
                      <v-col cols="12">
                        <div class="informante-panel">
                          <div class="informante-panel-head">
                            <p class="informante-panel-title mb-1">Antecedentes del informante</p>
                            <p class="informante-panel-subtitle mb-0">Seleccione a quien informa e ingrese la fecha y hora en la que se realiza.</p>
                          </div>
                          <v-row class="informante-fields-row" dense>
                            <v-col cols="12">
                              <v-alert
                                border    = "left"
                                type      = "info"
                                elevation = "2"
                                class     = "mt-2"
                                colored-border
                                prominent
                                v-if = "!editedItem.ruT_INFORMANTE"
                              >
                                <span class="alerta">Debe seleccionar una persona desde el botón "Buscar persona"</span>
                              </v-alert>
                              <v-card
                                class     = "informante-card"
                                elevation = "0"
                                v-else
                              >
                                <v-card-text >
                                  <v-row class="informante-row">
                                    <v-col cols="12" md="4" class="text-center">
                                      <v-avatar
                                        size  = "210px"
                                        class = "mt-2 Avatar informante-avatar"
                                      >
                                        <v-img
                                          lazy-src = "/avatar.svg"
                                          :src     = "editedItem.informante.foto"
                                          contain
                                        />
                                      </v-avatar>
                                    </v-col>
                                    <v-col cols="12" md="8" class="informante-data">
                                      <div class="informante-line">
                                        <span class="informante-label">Grado</span>
                                        <span class="informante-value">{{ editedItem.informante.grado || '-' }}</span>
                                      </div>
                                      <div class="informante-line">
                                        <span class="informante-label">Nombres</span>
                                        <span class="informante-value">{{ editedItem.informante.nombres || '-' }}</span>
                                      </div>
                                      <div class="informante-line">
                                        <span class="informante-label">Apellidos</span>
                                        <span class="informante-value">{{ editedItem.informante.apellidO_PATERNO || '-' }} {{ editedItem.informante.apellidO_MATERNO || '' }}</span>
                                      </div>
                                      <div class="informante-line">
                                        <span class="informante-label">Unidad</span>
                                        <span>
                                          <v-autocomplete
                                            v-model            = "editedItem.u_INFORMANTE"
                                            :items             = "itemsUnidades"
                                            :item-text         = "getUnidadText"
                                            :item-value        = "getUnidadCodigo"
                                            :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"
                                            :rules             = "[validObjectOtherRule]"
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
                            <v-col cols="12">
                              <v-row> 
                                          
                      <v-col cols="12" md="6">
                        <v-menu
                          ref                     = "menu"
                          v-model                 = "informanteDate.menu"
                          :close-on-content-click = "false"
                          transition              = "scale-transition"
                          offset-y
                          :max-width              = "$vuetify.breakpoint.mdAndUp ? '80vw' : '20vw'"
                          min-width               = "auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model            = "informanteDate.dateFormatted"
                              :rules             = "rules.required"
                              label              = "Fecha"
                              hint               = "DD/MM/YYYY"
                              persistent-hint
                              readonly
                              prepend-inner-icon = "mdi-calendar"
                              v-bind             = "attrs"
                              @blur              = "editedItem.fechaInformante = parseDate(informanteDate.dateFormatted)"
                              v-on               = "on"
                              :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"                                                               
                            />
                          </template>
                          <v-date-picker
                            v-model            = "editedItem.fechaInformante"
                            locale             = "es"                                                                                                    
                            :min               = "informanteDate.minDate"
                            :max               = "informanteDate.maxDate"
                            :first-day-of-week = "1"
                            @input             = "informanteDate.menu = false"
                            no-title                                                        
                          />
                        </v-menu>
                      </v-col>      
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref                = "horaInformante"
                          v-model            = "editedItem.horaInformante"
                          :rules             = "rules.time"
                          label              = "Hora"
                          hint               = "HH:MM"
                          persistent-hint
                          prepend-inner-icon = "mdi-clock-outline"
                          :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"
                          type    					 = "time"
                          class              = "time-picker-off"
                          @click:append-inner= "openSelectorTime"
                        />
                      </v-col> 				
                      </v-row>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-tab-item>
<!--
  Antecedentes de los hechos
--> 								
                <v-tab-item eager>
                  <div ref="tabHechosPanel">
                    <v-row class="mt-4" dense>
                      <v-col cols="12">
                        <div class="hechos-panel">
                          <div class="hechos-panel-head">
                            <p class="hechos-panel-title mb-1">Antecedentes de los hechos</p>
                            <p class="hechos-panel-subtitle mb-0">Complete la información principal del incidente o accidente con un formato claro y ordenado.</p>
                          </div>
                          <v-row class="hechos-fields-row" dense>
                            <v-col cols="12" md="6">
                              <v-radio-group
                                v-model   = "editedItem.incidentE_ACCIDENTE"
                                class     = "radio-group"
                                row
                                hide-details = "auto"
                                :rules    = "[(v) => !!v || 'Debe seleccionar Incidente o Accidente']"
                                :disabled = "!editedItem.ruT_INFORMANTE ? true : false"
                              >
                                <v-radio
                                    class = "radio"
                                    label = "Incidente"
                                    value = "I"
                                />
                                <v-radio
                                    class = "radio"
                                    label = "Accidente"
                                    value = "A"
                                />
                              </v-radio-group>	
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                v-model						= "editedItem.tipO_INGESTA"
                                :items						 = "itemsTipoIngestas"
                                item-text					= "descripcion"
                                item-value				 = "id"
                                label              = "Ingesta de bebidas alcohólicas"
                                :disabled					= "!editedItem.ruT_INFORMANTE ? true : false"
                                :rules             = "[validObjectRule]"
                                outlined                                        
                                prepend-inner-icon = "mdi-form-select"
                                return-object
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                v-model            = "editedItem.tipO_INCIDENTE"
                                :items             = "itemsTipoIncidentes"
                                item-text          = "descripcion"
                                item-value         = "id"
                                label              = "Tipo de incidente"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"                                        
                                :rules             = "[validObjectRule]"                                                   
                                outlined
                                prepend-inner-icon = "mdi-form-select"
                                return-object
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-radio-group
                                v-model   = "editedItem.personaL_UNIDAD"
                                class     = "radio-group"
                                row
                                hide-details = "auto"
                                :rules    = "[(v) => !!v || 'Debe seleccionar Personal o Unidad']"
                                :disabled = "!editedItem.ruT_INFORMANTE ? true : false"
                              >
                                <v-radio
                                    class = "radio"
                                    label = "Personal"
                                    value = "P"
                                />
                                <v-radio
                                    class = "radio"
                                    label = "Unidad"
                                    value = "U"
                                />
                              </v-radio-group>	
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                v-model            = "editedItem.u_AFECTADA"
                                :items             = "itemsUnidades"
                                :item-text         = "getUnidadText"
                                :item-value        = "getUnidadCodigo"
                                label              = "Unidad afectada"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"                                        
                                :rules             = "[validObjectRule]"
                                outlined
                                prepend-inner-icon = "mdi-form-select"
                                return-object
                              />  
                            </v-col>
                            <v-col cols="12" md="6" class="hechos-date-time-lift">
                              <v-menu
                                ref                     = "menu"
                                v-model                 = "hechosDate.menu"
                                :close-on-content-click = "false"
                                transition              = "scale-transition"
                                offset-y
                                :max-width              = "$vuetify.breakpoint.mdAndUp ? '80vw' : '20vw'"
                                min-width               = "auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model            = "hechosDate.dateFormatted"
                                    :rules             = "rules.required"
                                    label              = "Fecha"
                                    hint               = "DD/MM/YYYY"
                                    persistent-hint
                                    readonly                                                            
                                    prepend-inner-icon = "mdi-calendar"
                                    v-bind             = "attrs"
                                    @blur        		   = "editedItem.fechaHechos = parseDate(hechosDate.dateFormatted)"
                                    v-on               = "on"
                                    :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"                                                               
                                  />
                                </template>
                                <v-date-picker
                                  v-model = "editedItem.fechaHechos"
                                  locale  = "es"
                                  no-title
                                  :min    = "hechosDate.minDate"
                                  :max    = "hechosDate.maxDate"
                                  @input  = "hechosDate.menu = false"
                                />
                              </v-menu>
                            </v-col>      
                            <v-col cols="12" md="6" class="hechos-date-time-lift">
                              <v-text-field
                                ref                = "horaHechos"
                                v-model            = "editedItem.horaHechos"
                                :rules             = "rules.time"
                                label              = "Hora"
                                hint               = "HH:MM"
                                persistent-hint
                                prepend-inner-icon = "mdi-clock-outline"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"
                                type    					 = "time"
                                class              = "time-picker-off"
                                @click:append-inner= "openSelectorTime"
                              />
                            </v-col> 
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.lugaR_HECHO"
                                label              = "Lugar"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters.concat(rules.required)"  
                                counter            = "2000"
                                rows               = "3"              
                                prepend-inner-icon = "mdi-text"
                                auto-grow
                                outlined
                                clearable                                                                                                 
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.circunstanciA_HECHO"
                                label              = "Circunstancias"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters.concat(rules.required)"  
                                counter            = "2000"                                                    
                                rows               = "3" 
                                prepend-inner-icon = "mdi-text"
                                auto-grow                                  
                                outlined
                                clearable                                                                                             
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.danoS_PERSONALES"
                                label              = "Daños al personal"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters.concat(rules.required)"  
                                counter            = "2000"
                                rows               = "3"
                                prepend-inner-icon = "mdi-text"
                                auto-grow                                                
                                outlined
                                clearable   
                              />
                            </v-col>  
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.medidaS_ADOPTADAS"
                                label              = "Medidas adoptadas"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters.concat(rules.required)"  
                                counter            = "2000"                                                                                                                                                                                                              
                                rows               = "3"
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
                  </div>																		
                </v-tab-item>
<!--
  Ampliación de antecedentes de los hechos
-->  								
                <v-tab-item eager> 
                  <div ref="tabAdicionalPanel">
                    <v-row class="mt-4" dense>
                      <v-col cols="12">
                        <div class="hechos-panel">
                          <div class="hechos-panel-head">
                            <p class="hechos-panel-title mb-1">Datos adicionales</p>
                            <p class="hechos-panel-subtitle mb-0">Ampliación de la información solicitada, ingrese con un formato claro y ordenado.</p>
                          </div>
                          <v-row class="hechos-fields-row" dense>
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.especificacioN_VESTUARIO"
                                label              = "Vestuario"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"
                                counter            = "2000"                                                    
                                rows               = "3" 
                                prepend-inner-icon = "mdi-text"
                                auto-grow                                  
                                outlined
                                clearable                                                                                             
                              />
                            </v-col>		
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                v-model            = "editedItem.tipO_IDENTIFICACION"
                                :items             = "itemsTipoIdentificacion"
                                item-text          = "descripcion"
                                item-value         = "id"
                                label              = "Tipo de identificación que portaba"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"      
                                :rules             = "[validObjectRule]"
                                outlined                                        
                                prepend-inner-icon = "mdi-form-select"
                                return-object
                              />
                            </v-col>																								
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.unidaD_INTELIGENCIA_ADOPTA"
                                label              = "Unidad de inteligencia que adopta"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"
                                counter            = "2000"
                                rows               = "3"              
                                prepend-inner-icon = "mdi-text"
                                auto-grow
                                outlined
                                clearable                                                                                                 
                              />
                            </v-col>	
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.caracteristicaS_MATERIAL"
                                label              = "Detalle de material comprometido"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"  
                                counter            = "2000"                                                    
                                rows               = "3" 
                                prepend-inner-icon = "mdi-text"
                                auto-grow                                  
                                outlined
                                clearable                                                                                             
                              />
                            </v-col>

                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.detallE_RESULTADO_MUERTE"
                                label              = "Detalle de resultado de muerte"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"
                                counter            = "2000"
                                rows               = "3"
                                prepend-inner-icon = "mdi-text"
                                auto-grow                                                
                                outlined
                                clearable   
                              />
                            </v-col>  
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.detallE_DOCUMENTACION_PERDIDA"
                                label              = "Detalle de documentación perdida"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"  
                                counter            = "2000"                                                                                                                                                                                                              
                                rows               = "3"
                                prepend-inner-icon = "mdi-text"
                                auto-grow                           
                                outlined
                                clearable                                                                                             
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.autoridaD_REQUIERE_INFO"
                                label              = "Autoridad externa que requiere información"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"  
                                counter            = "2000"                                                                                                                                                                                                              
                                rows               = "3"
                                prepend-inner-icon = "mdi-text"
                                auto-grow                           
                                outlined
                                clearable                                                                                             
                              />
                            </v-col>		
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.medidaS_ADOPTADAS_FAMILIARES"
                                label              = "Medidas adoptadas respecto a familiares"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"  
                                counter            = "2000"                                                                                                                                                                                                              
                                rows               = "3"
                                prepend-inner-icon = "mdi-text"
                                auto-grow                           
                                outlined
                                clearable                                                                                             
                              />
                            </v-col>	
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.sintesiS_MEDIOS_PRENSA"
                                label              = "Síntesis de los medios de prensa"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"  
                                counter            = "2000"                                                                                                                                                                                                              
                                rows               = "3"
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
                  </div>									
                </v-tab-item>	
<!--
  Antecedentes relacionados al armamento
-->
                <v-tab-item eager>
                  <div ref="tabArmamentoPanel">
                    <v-row class="mt-4" dense>
                      <v-col cols="12">
                        <div class="hechos-panel">
                          <div class="hechos-panel-head">
                            <p class="hechos-panel-title mb-1">Antecedentes relacionados al Armamento</p>
                            <p class="hechos-panel-subtitle mb-0">Complete los antecedentes solicitados con un formato claro y ordenado.</p>
                          </div>
                          <v-row class="hechos-fields-row" dense>
                            <v-col cols="12" md="12">
                              <v-radio-group
                                v-model   = "editedItem.portabA_ARMA"
                                label     = "¿Portaba arma?"
                                class     = "radio-group"
                                row
                                hide-details
                                :disabled = "!editedItem.ruT_INFORMANTE ? true : false"
                              >
                                <v-radio
                                    class = "radio"
                                    label = "Si"
                                    value = "S"
                                />
                                <v-radio
                                    class = "radio"
                                    label = "No"
                                    value = "N"
                                />
                              </v-radio-group>	
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                v-model            = "editedItem.tipO_ARMAMENTO"
                                :items             = "itemsTipoArmamento"
                                item-text          = "descripcion"
                                item-value         = "id"
                                label              = "Tipo de armamento"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"      
                                :rules             = "[validObjectRule]"
                                outlined                                        
                                prepend-inner-icon = "mdi-form-select"
                                return-object
                              />
                            </v-col>													
                            <v-col cols="12" md="6">
                              <v-radio-group
                                v-model   = "editedItem.armA_FISCAL_PARTICULAR"
                                class     = "radio-group"
                                row
                                hide-details
                                :disabled = "!editedItem.ruT_INFORMANTE ? true : false"
                              >
                                <v-radio
                                    class = "radio"
                                    label = "Fiscal"
                                    value = "F"
                                />
                                <v-radio
                                    class = "radio"
                                    label = "Particular"
                                    value = "P"
                                />
                              </v-radio-group>	
                            </v-col>
                            <v-col cols="12" md="12">
                              <v-textarea
                                v-model            = "editedItem.detallE_PORTE_ARMA"
                                label              = "Detalle porte de arma"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"
                                counter            = "2000"                                                    
                                rows               = "3" 
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
                  </div>
                </v-tab-item>
<!--
  Investigación de los hechos
-->									
                <v-tab-item eager>
                  <div ref="tabInvestigacionPanel">			
                    <v-row class="mt-4" dense>
                      <v-col cols="12">
                        <div class="hechos-panel">
                          <div class="hechos-panel-head">
                            <p class="hechos-panel-title mb-1">Investigación de los hechos</p>
                            <p class="hechos-panel-subtitle mb-0">Complete los antecedentes solicitados con un formato claro y ordenado.</p>
                          </div>
                          <v-row class="hechos-fields-row" dense>
                            <v-col cols="12" md="6">
                              <v-radio-group
                                v-model   = "editedItem.realizA_INVESTIGACION"
                                label     = "¿Se realiza investigacion?"
                                class     = "radio-group"
                                row
                                hide-details
                                :disabled = "!editedItem.ruT_INFORMANTE ? true : false"
                              >
                                <v-radio
                                    class = "radio"
                                    label = "Si"
                                    value = "S"
                                />
                                <v-radio
                                    class = "radio"
                                    label = "No"
                                    value = "N"
                                />
                              </v-radio-group>	
                            </v-col>													
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                v-model            = "editedItem.tipO_INVESTIGACION"
                                :items             = "itemsTipoInvestigacion"
                                item-text          = "descripcion"
                                item-value         = "id"
                                label              = "Tipo de investigación"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"                                        
                                :rules             = "[validObjectRule]"                                                   
                                outlined
                                prepend-inner-icon = "mdi-form-select"
                                return-object
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-textarea
                                v-model            = "editedItem.detallE_INVESTIGACION"
                                label              = "Detalle de investigación"
                                density            = "compact"
                                :disabled          = "!editedItem.ruT_INFORMANTE ? true : false"          
                                :rules             = "rules.maxCharacters"  
                                counter            = "2000"
                                rows               = "3"              
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
                  </div>										
                </v-tab-item>			
              </v-tabs-items>
            </v-container>                                   
          </v-form>                        
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color = "secondary"
            text
            outlined
            @click = "closeIncidenteDialog"
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
  👉 personaDialog
      • Componente que despliega formulario para crear un nuevo informante o actualizar uno existente 
        ( Import components/addPersona.vue )
-->
    <v-dialog
      v-model    = "personaDialog"
      fullscreen
      hide-overlay
      transition = "dialog-bottom-transition"
      scrollable
    >
      <v-card>
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
<!--		
  👉 confirmDeleteDialog
      • Componente que despliega mensaje que confirma y cancela la eliminación del preliminar
        ( Import components/confirmDelete.vue )
-->
    <v-dialog 
      v-model    = "confirmDeleteDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
    >
      <v-card>
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
                Está a punto de eliminar el preliminar {{`Id: ${editedItem.id} (  ${editedItem.tipO_INCIDENTE.descripcion} )`}}, ¿desea continuar?.
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
  👉 reportFoldersDialog
        • Componente que despliega formulario para mantener los archivos de informes 
          ( Import components/archivosInforme.vue )
-->        
    <v-dialog 
      v-model    = "reportFoldersDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '100vw'"
    >
      <v-card>
        <v-card-title class="grey darken-4">
          <span class="text-h5 white--text">Archivos de Informes</span>
          <v-spacer />
          <v-btn 
            icon
            dark
            size   = "x-small"
            class  = "float-end"
            @click = "reportFoldersDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="grey darken-4">
          <span class="text-h8 white--text">{{ incidenteTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Archivos-Informe v-if="reportFoldersDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Incidente'"
          />
        </v-card-text> 
      </v-card>
    </v-dialog>				
<!-- 
  👉 supplementaryReportDialog
        • Componente que despliega formulario para mantener los archivos de ampliación de informes 
          ( Import components/archivosInforme.vue )
-->        
    <v-dialog 
      v-model    = "supplementaryReportDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '100vw'"
    >
      <v-card>
        <v-card-title class="grey darken-4">
          <span class="text-h5 white--text">Ampliación de archivos de Informes</span>
          <v-spacer />
          <v-btn 
            icon
            dark
            size   = "x-small"
            class  = "float-end"
            @click = "supplementaryReportDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="grey darken-4">
          <span class="text-h8 white--text">{{ incidenteTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Ampliaciones-Informe v-if="supplementaryReportDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Incidente'"

          />
        </v-card-text> 
      </v-card>
    </v-dialog>				
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from "vuex"
  import toastr from 'toastr'
  import 'toastr/build/toastr.min.css'

  import AddPersona               from "@/components/base/addPersona";
  import ProcedimientosPoliciales from "@/components/informationSupplementary/procedimientosPoliciales";
  import AntecedentesJudiciales   from "@/components/informationSupplementary/antecedentesJudiciales";
  import Involucrados             from "@/components/informationSupplementary/involucrados"; 
  import ArchivosInforme		      from "@/components/informationSupplementary/archivosInforme";
  import AmpliacionesInforme		  from "@/components/informationSupplementary/ampliacionesInforme";
  import previewReport		        from "@/components/reports/previewReport";
  import reportView			          from "@/components/reports/reportView";
  
  export default {
    name       : "incidentesS2",
    components : {
      AddPersona              ,
      ProcedimientosPoliciales,
      AntecedentesJudiciales  ,
      Involucrados            ,
      ArchivosInforme         ,
      AmpliacionesInforme     ,
      previewReport           ,
      reportView              ,
    },		
    data       : () => ({
      search                    : '', 
      oldSearch                 : '',
      selectedUnidad            : '0',
      page                      : 1,
      oldPage                   : 1,
      items                     : 5,				
      estado										:'00',
      oldEstado                 :'00',			
      tabs                      : null,
      informesId                : 0,
      policeProceduresDialog    : false,
      judicialRecordsDialog     : false,
      involvedDialog            : false,			
      incidenteDialog           : false,
      personaDialog             : false,
      confirmDeleteDialog       : false,
      reportViewDialog          : false,
      reportViewMode            : 'Incidente',
      reportFoldersDialog		    : false,
      supplementaryReportDialog : false,

      incidenteTitle            : '',
      editedIndex               : -1,			
      validForm                 : false,
      buttonClicked             : false,			
      tabInformante             : 'tabInformante',
      tabHechos                 : 'tabHechos',
      editedItem                : {
        ruT_INFORMANTE                : null,
        informante                    : {},
        u_INFORMANTE                  : {},
        fechaInformante               : null,
        horaInformante                : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16),
        tipO_INCIDENTE                : {},
        u_AFECTADA                    : {},
        fechaHechos                   : null,
        horaHechos                    : null,
        lugaR_HECHO                   : '',
        circunstanciA_HECHO           : '',
        danoS_PERSONALES              : '',
        medidaS_ADOPTADAS             : '',
        especificacioN_VESTUARIO      : '',
        tipO_IDENTIFICACION           : {},
        unidaD_INTELIGENCIA_ADOPTA    : '',
        caracteristicaS_MATERIAL      : '',
        detallE_RESULTADO_MUERTE	    : '',
        detallE_DOCUMENTACION_PERDIDA : '',
        autoridaD_REQUIERE_INFO       : '',
        medidaS_ADOPTADAS_FAMILIARES  : '',
        sintesiS_MEDIOS_PRENSA        : '',
        portabA_ARMA                  : '',
        tipO_ARMAMENTO                : {},
        armA_FISCAL_PARTICULAR        : '',
        detallE_PORTE_ARMA            : '',
        realizA_INVESTIGACION         : '',
        tipO_INVESTIGACION            : {},
        detallE_INVESTIGACION         : '',
      },
      defaultItem               : {
        ruT_INFORMANTE                : null,
        informante                    : {},
        u_INFORMANTE                  : {},
        fechaInformante               : null,
        horaInformante                : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16),
        tipO_INCIDENTE                : {},
        u_AFECTADA                    : {},
        fechaHechos                   : null,
        horaHechos                    : null,
        lugaR_HECHO                   : '',
        circunstanciA_HECHO           : '',
        danoS_PERSONALES              : '',
        medidaS_ADOPTADAS             : '',
        especificacioN_VESTUARIO      : '',
        tipO_IDENTIFICACION           : {},
        unidaD_INTELIGENCIA_ADOPTA    : '',
        caracteristicaS_MATERIAL      : '',
        detallE_RESULTADO_MUERTE	    : '',
        detallE_DOCUMENTACION_PERDIDA : '',
        autoridaD_REQUIERE_INFO       : '',
        medidaS_ADOPTADAS_FAMILIARES  : '',
        sintesiS_MEDIOS_PRENSA        : '',
        portabA_ARMA                  : '',
        tipO_ARMAMENTO                : {},
        armA_FISCAL_PARTICULAR        : '',
        detallE_PORTE_ARMA            : '',
        realizA_INVESTIGACION         : '',
        tipO_INVESTIGACION            : {},
        detallE_INVESTIGACION         : '',
                        
      },
      headers                   : [
        { text: "Id"                      , value: "incidente.id"                         , groupable: false, sortable: false },
        { text: "Tipo incidente"          , value: "incidente.tipO_INCIDENTE.descripcion" , groupable: false, sortable: false },
        { text: "Fecha y hora del hecho"  , value: "incidente.fechA_HECHO"                , groupable: false, sortable: false },
        { text: "Fecha y hora publicación", value: "incidente.fechA_PUBLICACION"          , groupable: false, sortable: false },
        { text: "Circunstancias"          , value: "incidente.circunstanciA_HECHO"        , groupable: false, sortable: false },
        { text: "Motivo Devolución"       , value: "motivoDevolucionInc.motivO_DEVOLUCION", groupable: false, sortable: false },
        { text: "Estado"                  , value: "incidente.estado"                     , groupable: false, sortable: false },				
        { text: "Unidad responsable"      , value: "incidente.u_AFECTADA.sigla"           , groupable: false, sortable: false },
        { text: "Acciones"                , value: "acciones"                             , groupable: false, sortable: false },  
      ],
      headersPoliceProcedure    : [
        { text : "FECHA"        , value : "fechA_PROCEDIMIENTO_POL"       , groupable : false, sortable : false, class:"my-header-style" },
        { text : "PROCEDIMIENTO", value : "detallE_PROCEDIMIENTO_POL"     , groupable : false, sortable : false, class:"my-header-style" },
        { text : "CONDICION"    , value : "condicioN_POLICIAL.descripcion", groupable : false, sortable : false, class:"my-header-style" },
      ],
      headersJudicialRecord     : [
        { text : "FECHA"      , value : "fechA_ANTECEDENTES_JUD"  , groupable : false, sortable : false, class:"my-header-style" },
        { text : "ANTECEDENTE", value : "detallE_ANTECEDENTES_JUD", groupable : false, sortable : false, class:"my-header-style" },
      ],	
      headersInvolved          : [
        { text: "RUN"           , value: "ruT_INVOLUCRADO"         , groupable: false, sortable: false, class:"my-header-style" },
        { text: "NOMBRE"        , value: "r_INVOLUCRADO.nombres"   , groupable: false, sortable: false, class:"my-header-style" },
        { text: "ALCOHOL/DROGAS", value: "tipO_CONSUMO.descripcion", groupable: false, sortable: false, class:"my-header-style" },
        { text: "SALUD"         , value: "estadO_SALUD.descripcion", groupable: false, sortable: false, class:"my-header-style" },
        { text: "UNIDAD"        , value: "u_INVOLUCRADO.sigla"     , groupable: false, sortable: false, class:"my-header-style" },
      ],					    
      itemsUnidadesFilter  	    : [ { codigo: '0', sigla: 'Todas las unidades' } ],        
      itemsPerPage              : [ 5, 10, 25, 50 ],
      itemsChip                 : [
        { text: 'Todos'             , value: '00', color: ''          },				
        { text: 'En Proceso por S2' , value: '01', color: 'success'   },
        { text: 'Tramitado al Cdte.', value: '02', color: 'info'      },
        { text: 'Devuelto por Cdte.', value: '03', color: 'primary'   },
        { text: 'Con informe final' , value: '04', color: 'secondary' }
      ],			          			
      itemsUnidades             : [],
      itemsTipoIngestas         : [],
      itemsTipoIncidentes       : [],	
      itemsTipoIdentificacion	  : [],
      itemsTipoArmamento        : [],
      itemsTipoInvestigacion    : [],
      itemsPoliceProcedure      : [],
      itemsJudicialRecord       : [], 
      itemsInvolved             : [],

/*	calendario */                        
      informanteDate            : {
        date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
        dateFormatted : null,
        menu          : false,
        minDate       : "2024-02-01",
        maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      },
      hechosDate                : {
        date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
        dateFormatted : null,
        menu          : false,
        minDate       : "2024-02-01",
        maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      },    
/*	Reloj */     
      informanteTime            : {
        time          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16),
        timeFormatted : null,
        menu          : false
      },
      hechosTime                : {
        time          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16), 
        timeFormatted : null,
        menu          : false
      },
/*	Validaciones */
      rules                     : {
        required      : [
          (v) => !!v || "Este campo es requerido",
        ],
        maxCharacters : [
          (v) => !v || v.length <= 2000 || "Máximo 2000 caracteres",
        ],
        time          : [
          (v) => !!v || "Este campo es requerido",
          (v) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v) || "Formato de hora inválido (HH:MM)",
        ],
      }, 			         			
    }),
    computed   : {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Preliminar' : 'Editar Preliminar'
      },
      reportViewType() {
        return this.reportViewMode === 'Preliminar' ? 'Preliminar' : 'Incidente';
      },
      reportViewIcon() {
        return this.reportViewMode === 'Preliminar' ? 'mdi-file-powerpoint-outline' : 'mdi-file-document-outline';
      },
      reportViewTitles() {
        const isIncidente  = this.editedItem && this.editedItem.incidentE_ACCIDENTE === 'I';
        const accidentType = isIncidente ? 'Incidente' : 'Accidente';
        const scopeType    = this.editedItem && this.editedItem.personaL_UNIDAD === 'P' ? 'Personal' : 'Unidad';
        const reportLabel  = this.reportViewMode === 'Preliminar' ? 'Informe Preliminar' : 'Informe Incidente';
        return {
          title    : `${reportLabel} ${ this.editedItem.incidenteId ? ' del id ' + this.editedItem.incidenteId : this.editedItem.id }`.trim(),
          subtitle : `${accidentType} - ${scopeType}`,
        };
      },
      ...mapGetters("incidentesStore", [ 'informes', 'pages', 'isLoading' ]),
      ...mapGetters(['currentUser']), 
    },
    async beforeMount() {
      await this.getData()
      let resp
      resp = await this.getListUnidades()
      const listaUnidades = Array.isArray(resp?.data?.listaUnidades)
        ? resp.data.listaUnidades
        : []
      this.itemsUnidadesFilter = [
        { codigo: '0', sigla: 'Todas las unidades' },
        ...listaUnidades.filter(unidad => unidad?.codigo !== '0'),
      ]      
      this.itemsUnidades       = listaUnidades

      const respTipoIngestas       = await this.getListTipoIngesta()
      this.itemsTipoIngestas       = respTipoIngestas.data

      const respTipoIncidentes     = await this.getListTipoIncidente()
      this.itemsTipoIncidentes     = respTipoIncidentes.data
      
      const respTipoIdentificacion = await this.getListTipoIdentificacion()
      this.itemsTipoIdentificacion = respTipoIdentificacion.data

      const respTipoArmamento      = await this.getListTipoArmamento()
      this.itemsTipoArmamento      = respTipoArmamento.data

      const respTipoInvestigacion  = await this.getListTipoInvestigacion()
      this.itemsTipoInvestigacion  = respTipoInvestigacion.data
    },
    watch      : {
/*
    - informanteDate y hechosDate : Se encargan de formatear la fecha obtenida desde el backend para desplegarla en el campo de fecha del 
                                    formulario, a través de la escucha de cambios en el valor de fechaInformante y fechaHechos respectivamente,
                                    y estableciendo el valor formateado en informanteDate.dateFormatted y hechosDate.dateFormatted respectivamente			
    - informanteTime y hechosTime : Se encargan de formatear la hora obtenida desde el backend para desplegarla en el campo de hora del formulario,
                                    a través de la escucha de cambios en el valor de horaInformante y horaHechos respectivamente,y estableciendo el 
                                    valor formateado en informanteTime.timeFormatted y hechosTime.timeFormatted respectivamente
    - page												:	Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, 
                                    filtro de busqueda, estado, a través de la escucha de cambios en el valor de page, y controlando 
                                    la lógica para evitar realizar el getData si el valor de page no ha cambiado realmente, a través del valor oldPage
    - estado											:	Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, 
                                    filtro de busqueda y estado, a través de la escucha de cambios en el valor de estado, y controlando 
                                    la lógica para evitar realizar el getData si el valor de estado no ha cambiado realmente, a través del valor oldEstado
    - items												: Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, filtro de
                                    busqueda y estado, a través de la escucha de cambios en el valor de items, y estableciendo el valor de page.
    - selectedUnidad              : Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, filtro de busqueda y estado,
                                    a través de la escucha de cambios en el valor de selectedUnidad, y estableciendo el valor de page.
*/	

      informanteDate : {
        deep: true,
        async handler() {
          this.informanteDate.dateFormatted = this.formatDate(this.editedItem.fechaInformante)
        }
      },
      hechosDate     : {
        deep: true,
        async handler() {
          this.hechosDate.dateFormatted = this.formatDate(this.editedItem.fechaHechos)
        }
      },
      informanteTime : {
        deep: true,
        async handler() {
          this.informanteTime.timeFormatted = this.editedItem.horaInformante
        }
      },
      hechosTime    : {
        deep: true,
        async handler() {
          this.hechosTime.timeFormatted = this.editedItem.horaHechos
        }
      },
      page: {
        deep: true,
        async handler() {
          if (this.page != this.oldPage) {
            await this.getData();
            this.oldPage = this.page;
          }
        }
      },
      estado: {
        deep: true,
        async handler() {
          if (this.estado != this.oldEstado) {
            await this.getData();
            this.oldEstado = this.estado;
          }
        }
      },			
      async items() {
        this.page = 1;
        await this.getData()
      },
      async selectedUnidad() {
        this.page = 1;
        await this.getData()
      },                              
    }, 		
    methods    : {
      async getData() {
        await this.getListInformesIncidentesBINTE({
          page                : this.page,
          items               : this.items,
          search              : this.search,
          tipoEstadoIngresado : this.estado,
          unidadId            : this.selectedUnidad,                
        })
      },
/* Barra de herramientas y tabla */      
      async lookFor() {
        if ( this.search != this.oldSearch ) {
          await this.getData();
          this.oldSearch = this.search;
          this.page      = 1;
        }
      },
      changeEstado(newEstado) {
        if (this.estado === newEstado) return;
        this.estado = newEstado;
        this.page = 1;

      },      
      getItemClass(item) {
        const incidente = item.incidente || item
        return	 incidente.estado === 2 && incidente.devuelto === 'N' ? 'row-table-display-success' : 
                (incidente.estado === 2 && incidente.devuelto === 'S' ? 'row-table-display-primary' : 
                (incidente.estado === 1 ? 'row-table-display-info' : 'row-table-display-secondary'))
      },      
      customChipColor(item) {
        return   item.estado === 2 && item.devuelto === 'N' ? 'success' : 
                (item.estado === 2 && item.devuelto === 'S' ? 'primary'   :
                (item.estado === 1 ? 'info' : 'secondary'))
      },
      customChipText(item) {
        return   item.estado === 2 && item.devuelto === 'N' ? 'En proceso por S2' : 
                (item.estado === 2 && item.devuelto === 'S' ? 'Devuelto por Cdte.'   :
                ( item.estado === 1 ? 'Tramitado al Cdte.' : 'Con informe final'))
      },
/* Vista de informes */
      preliminaryReportView(item) {
        this.reportViewMode     = 'Preliminar';
        const informePreliminar = item && item.preliminares ? item.preliminares : {};
        this.editedItem         = {
          ...Object.assign({}, this.defaultItem),
          ...Object.assign({}, informePreliminar),
          informante          : informePreliminar.informante          || {},
          u_INFORMANTE        : informePreliminar.u_INFORMANTE        || {},
          tipO_INCIDENTE      : informePreliminar.tipO_INCIDENTE      || {},
          u_AFECTADA          : informePreliminar.u_AFECTADA          || {},
          tipO_INGESTA        : informePreliminar.tipO_INGESTA        || {},
          tipO_IDENTIFICACION : informePreliminar.tipO_IDENTIFICACION || {},
          tipO_ARMAMENTO      : informePreliminar.tipO_ARMAMENTO      || {},
          tipO_INVESTIGACION  : informePreliminar.tipO_INVESTIGACION  || {},
          incidenteId         : item.id,
        };
        this.reportViewDialog   = true
      },			
      incidentReportView(item) {
        this.reportViewMode   = 'Incidente';
        this.editedItem       = Object.assign({}, item);
        this.reportViewDialog = true
      },
      closeReportViewDialog() {
        this.reportViewDialog = false
      },									
/* Complementos */            
      policeProcedures ( item ) {
        this.incidenteTitle         = `Id: ${item.id} (  ${item.tipO_INCIDENTE.descripcion} )`
        this.informesId             = item.id
        this.policeProceduresDialog = true
      }, 
      judicialRecords ( item ) {
        this.incidenteTitle        = `Id: ${item.id} (  ${item.tipO_INCIDENTE.descripcion} )`
        this.informesId            = item.id                            
        this.judicialRecordsDialog = true
      },
      involved ( item ) {
        this.incidenteTitle  = `Id: ${item.id} (  ${item.tipO_INCIDENTE.descripcion} )`
        this.informesId      = item.id
        this.involvedDialog  = true
      },
      async reportFolders(item) {
        this.incidenteTitle       = `Id: ${item.id} - ${item.tipO_INCIDENTE.descripcion}`
        this.informesId           = item.id
        this.reportFoldersDialog  = true
      },	
      async supplementaryReport(item) {
        this.incidenteTitle             = `Id: ${item.id} - ${item.tipO_INCIDENTE.descripcion}`
        this.informesId                 = item.id
        this.supplementaryReportDialog  = true
      },
      async editItem (item) {
        this.resetValidation();
        this.editedIndex                  = this.informes.indexOf(item);
        this.editedItem                   = Object.assign({}, item);
        this.editedItem.u_AFECTADA        = { "codigo" : item.unidaD_AFECTADA, "sigla" : "", "descripcion" : "" }
        this.editedItem.fechaInformante   = this.formatDateTime(item.fechA_INFORMANTE,'date')
        this.informanteDate.dateFormatted = this.editedItem.fechaInformante
        this.editedItem.horaInformante    = this.formatDateTime(item.fechA_INFORMANTE,'time')
        this.informanteTime.timeFormatted = this.editedItem.horaInformante
        this.editedItem.fechaHechos       = this.formatDateTime(item.fechA_HECHO,'date')
        this.hechosDate.dateFormatted     = this.editedItem.fechaHechos
        this.editedItem.horaHechos        = this.formatDateTime(item.fechA_HECHO,'time')
        this.hechosTime.timeFormatted     = this.editedItem.horaHechos
        this.tabs                         = this.tabInformante
        this.incidenteDialog              = true;
      },
      confirmDeleteItem(item) {
        this.editedIndex         = item.id;
        this.editedItem          = Object.assign({}, item);
        this.confirmDeleteDialog = true;
      },	
/* Transaccionales */
      async addPersona(item) {
        this.editedItem.informante     = item
        this.editedItem.ruT_INFORMANTE = item.run
        this.editedItem.u_INFORMANTE   = item.unidadcodigo
        this.personaDialog             = false
      },
      async save () {
        this.buttonClicked = true;
        const isValid = await this.validate()
        if ( !isValid ) {
          toastr.warning("Debe completar los campos requeridos", "Advertencia!");
          this.buttonClicked = false
          return
        }
        try {
          const	resp = await this.putInformesIncidentes({
              incidentesId                  : this.editedItem.id,
              preliminaresId                : this.editedItem.preliminaresid,
              ruT_INFORMANTE                : this.editedItem.ruT_INFORMANTE,
              unidaD_INFORMANTE             : typeof(this.editedItem.u_INFORMANTE) === 'object' ? this.editedItem.u_INFORMANTE.codigo : this.editedItem.u_INFORMANTE,
              incidentE_ACCIDENTE           : this.editedItem.incidentE_ACCIDENTE,					
              TipO_INGESTAID                : this.editedItem.tipO_INGESTA.id,
              fechA_INFORMANTE              : this.editedItem.fechaInformante + 'T' + this.editedItem.horaInformante + ':00',					
              tipO_INCIDENTEID              : this.editedItem.tipO_INCIDENTE.id,
              personaL_UNIDAD               : this.editedItem.personaL_UNIDAD,
              unidaD_AFECTADA               : this.editedItem.u_AFECTADA.codigo,
              fechA_HECHO                   : this.editedItem.fechaHechos + 'T' + this.editedItem.horaHechos + ':00',
              lugaR_HECHO                   : this.editedItem.lugaR_HECHO,
              circunstanciA_HECHO           : this.editedItem.circunstanciA_HECHO,
              danoS_PERSONALES              : this.editedItem.danoS_PERSONALES,
              medidaS_ADOPTADAS             : this.editedItem.medidaS_ADOPTADAS,
              especificacioN_VESTUARIO      : this.editedItem.especificacioN_VESTUARIO,
              tipO_IDENTIFICACIONID         : this.editedItem.tipO_IDENTIFICACION.id,
              portabA_ARMA    					    : this.editedItem.portabA_ARMA,
              tipO_ARMAMENTOID              : this.editedItem.tipO_ARMAMENTO.id,
              armA_FISCAL_PARTICULAR        : this.editedItem.armA_FISCAL_PARTICULAR,
              detallE_PORTE_ARMA            : this.editedItem.detallE_PORTE_ARMA,
              realizA_INVESTIGACION         : this.editedItem.realizA_INVESTIGACION,
              tipO_INVESTIGACIONID          : this.editedItem.tipO_INVESTIGACION.id,
              detallE_INVESTIGACION         : this.editedItem.detallE_INVESTIGACION,
              unidaD_INTELIGENCIA_ADOPTA    : this.editedItem.unidaD_INTELIGENCIA_ADOPTA,
              caracteristicaS_MATERIAL      : this.editedItem.caracteristicaS_MATERIAL,
              detallE_RESULTADO_MUERTE      : this.editedItem.detallE_RESULTADO_MUERTE,
              detallE_DOCUMENTACION_PERDIDA : this.editedItem.detallE_DOCUMENTACION_PERDIDA,
              autoridaD_REQUIERE_INFO       : this.editedItem.autoridaD_REQUIERE_INFO,
              medidaS_ADOPTADAS_FAMILIARES  : this.editedItem.medidaS_ADOPTADAS_FAMILIARES,
              sintesiS_MEDIOS_PRENSA        : this.editedItem.sintesiS_MEDIOS_PRENSA
            })
            if (resp.status == 200) {
              toastr.success("Se ha actualizado la información correctamente", "Éxito!");
              this.page = 1
              await this.getData()
              await this.closeIncidenteDialog()
              return
            }
            toastr.error(`Error ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
            this.buttonClicked = false
            return
          
        } catch (error) {
          toastr.error("Ha ocurrido un error al guardar el informe", "Error!");
          this.buttonClicked = false
          console.error('save error', error)
        }
      },			
      async closeIncidenteDialog() {
        this.incidenteDialog              = false
        this.editedItem                   = Object.assign({}, this.defaultItem);
        this.editedIndex                  = -1;
        this.informanteDate.dateFormatted = ''           
        this.informanteTime.timeFormatted = ''                            
        this.hechosDate.dateFormatted     = '' 
        this.hechosTime.timeFormatted     = ''
        this.resetValidation() 
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },
      async deleteItem() {
        const res = await this.deleteInformesIncidentes(this.editedItem)
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
      async closeConfirmDeleteDialog() {
        this.confirmDeleteDialog = false    
        this.editedItem          = Object.assign({}, this.defaultItem);
        this.editedIndex         = -1;
      },	
/* Funciones de validación y formateo de fechas entre otras */
      async validate() {
        const isValid = this.$refs.form.validate();
        await this.$nextTick();

        if (!isValid) {
          const tabWithErrors = this.getFirstTabWithErrors();
          if (tabWithErrors !== null) {
            this.tabs = tabWithErrors;
          }
        }
        return isValid;
      },
      getFirstTabWithErrors() {
        const tabRefs = ["tabInformantePanel", "tabHechosPanel", "tabAdicionalPanel", "tabArmamentoPanel", "tabInvestigacionPanel"];

        for (let i = 0; i < tabRefs.length; i++) {
          const tabRef = this.$refs[tabRefs[i]];
          const tabEl  = Array.isArray(tabRef) ? tabRef[0] : tabRef;

          if (!tabEl) continue;

          const hasErrors = tabEl.querySelector(
            ".v-input.error--text, .v-messages.error--text, .error--text .v-messages__message"
          );

          if (hasErrors) return i;
        }

        return null;
      },			
      resetValidation(){
        if ( this.$refs.form ) this.$refs.form.resetValidation();
      },
      validObjectOtherRule(value) {
        if ( typeof(value) === 'object' ) {
          return value && value.codigo ? true : 'Este campo es requerido'  
        } else {
          return value ? true : 'Este campo es requerido'
        }
      }, 
      validObjectRule(value) {
        return value && ( value.id || value.codigo ) ? true : 'Este campo es requerido'
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
      getUnidadText(item) {
        if (item.codigo) {
          return `${item.codigo.toUpperCase()} - ${item.sigla.toUpperCase()} - ${item.descripcion.toUpperCase()}`;
        }
      },
      getUnidadCodigo(item) {
        if (item.codigo) {
          return item.codigo.toUpperCase();
        }
      },
      getFormatDateTime(datetime) {
        if (!datetime) return null	
        const datetimeParts = datetime.split(/[ T]/)
        const [year, month, day] = datetimeParts[0].split('-')
        const time = datetimeParts[1]
        return { dateFormatted: `${day}/${month}/${year}`, time: time.slice(0,5) , timeFormatted: time.slice(0,5) }
      },
      openSelectorTime() {
        const inputInformanteTime = this.$refs.informanteTime.$el.querySelector('input');
        if (inputInformanteTime && typeof inputInformanteTime.showPicker === 'function') {
          inputInformanteTime.showPicker();
        }
        const inputHechosTime = this.$refs.horaHechos.$el.querySelector('input');
        if (inputHechosTime && typeof inputHechosTime.showPicker === 'function') {
          inputHechosTime.showPicker();
        }
      },
/* Funciones de mapeo de acciones para Vuex */
      ...mapActions("incidentesStore"        , [	"getListInformesIncidentesBINTE", "putInformesIncidentes" ,
                                                  "deleteInformesIncidentes"      , "putTramiteInformesIncidentes" ]),            
      ...mapActions("tipoIngestaStore"       , [ "getListTipoIngesta"         ]),                                                   
      ...mapActions("tipoIncidenteStore"     , [	"getListTipoIncidente"      ]),
      ...mapActions("unidadesStore"          , [	"getListUnidades"           ]), 
      ...mapActions("tipoIdentificacionStore", [	"getListTipoIdentificacion" ]),
      ...mapActions("tipoArmamentoStore"     , [	"getListTipoArmamento"      ]),
      ...mapActions("tipoInvestigacionStore" , [	"getListTipoInvestigacion"  ]),

    }							
  }
</script>
<style scoped>
/* Barra de herramientas (búsqueda, paginación, etc.) */
  .toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(200px, 250px) minmax(220px, 250px);
    grid-template-areas: "search unit items" "chips chips chips";
    padding: 10px 2px 16px;
    margin-bottom: 12px;
    align-items: flex-start;
    gap: 12px 16px;
    border-bottom: 1px solid #d8e4f0;
  }
  .toolbar .toolbar-control {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  .toolbar .toolbar-chips {
    grid-area: chips;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 40px;
  }

  .toolbar > .spacer {
    display: none;
  }

  .toolbar ::v-deep .toolbar-search {
    grid-area: search;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }

  .toolbar ::v-deep .toolbar-items,
  .toolbar ::v-deep .toolbar-unit {
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }

  .toolbar ::v-deep .toolbar-unit {
    grid-area: unit;
  }

  .toolbar ::v-deep .toolbar-items {
    grid-area: items;
  }

  .toolbar ::v-deep .toolbar-search .v-input__slot,
  .toolbar ::v-deep .toolbar-items .v-input__slot,
  .toolbar ::v-deep .toolbar-unit .v-input__slot {
    border-radius: 10px !important;
  }

  .toolbar ::v-deep .toolbar-search.v-input--is-focused .v-input__slot,
  .toolbar ::v-deep .toolbar-items.v-input--is-focused .v-input__slot,
  .toolbar ::v-deep .toolbar-unit.v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
  }

  .toolbar ::v-deep .toolbar-search .v-label,
  .toolbar ::v-deep .toolbar-items .v-label,
  .toolbar ::v-deep .toolbar-unit .v-label,
  .toolbar ::v-deep .toolbar-search input,
  .toolbar ::v-deep .toolbar-items input,
  .toolbar ::v-deep .toolbar-unit input,
  .toolbar ::v-deep .toolbar-items .v-select__selection,
  .toolbar ::v-deep .toolbar-unit .v-select__selection {
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.015em;
  }

  .toolbar ::v-deep .toolbar-search .v-input__append-inner .v-icon,
  .toolbar ::v-deep .toolbar-items .v-input__append-inner .v-icon,
  .toolbar ::v-deep .toolbar-unit .v-input__append-inner .v-icon {
    font-size: 16px;
    opacity: 0.86;
  }
/* tabla */
  .tabla {
    border: 1px solid #d4e0ec;
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
  }

  .tabla ::v-deep .v-data-table__wrapper {
    overflow-x: auto;
  }

  .tabla ::v-deep table {
    min-width: 980px;
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
  .tabla-bloque {
    white-space: pre-line;
    word-break: break-word;
    text-align: justify;
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
    flex-wrap: nowrap;
    white-space: nowrap;
    min-width: max-content;
  }

  .tabla-acciones > * {
    flex: 0 0 auto;
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

  .tabla-acciones ::v-deep .accion-btn--view .v-icon       { color: #2563a6; }
  .tabla-acciones ::v-deep .accion-btn--police .v-icon     { color: #176b87; }
  .tabla-acciones ::v-deep .accion-btn--judicial .v-icon   { color: #6b5b18; }
  .tabla-acciones ::v-deep .accion-btn--involved .v-icon   { color: #24745f; }
  .tabla-acciones ::v-deep .accion-btn--edit .v-icon       { color: #708238; }
  .tabla-acciones ::v-deep .accion-btn--delete .v-icon     { color: #b33a3a; }
  .tabla-acciones ::v-deep .accion-btn--files .v-icon      { color: #4c6280; }
  .tabla-acciones ::v-deep .accion-btn--files-plus .v-icon { color: #287f9b; }

  .tabla-acciones ::v-deep .accion-btn--view:hover       { border-color: #8ab4db; background: #edf5fc; }
  .tabla-acciones ::v-deep .accion-btn--police:hover     { border-color: #82c1d2; background: #eaf7fa; }
  .tabla-acciones ::v-deep .accion-btn--judicial:hover   { border-color: #d1bd65; background: #fbf7e6; }
  .tabla-acciones ::v-deep .accion-btn--involved:hover   { border-color: #8bc7b4; background: #eaf7f1; }
  .tabla-acciones ::v-deep .accion-btn--edit:hover       { border-color: #aab56b; background: #f4f6e8; }
  .tabla-acciones ::v-deep .accion-btn--delete:hover     { border-color: #dc9898; background: #fff0f0; }
  .tabla-acciones ::v-deep .accion-btn--files:hover      { border-color: #a6bbd2; background: #f2f7fc; }
  .tabla-acciones ::v-deep .accion-btn--files-plus:hover { border-color: #8cc9d6; background: #eaf8fb; }

  .tabla-acciones ::v-deep .v-chip {
    height: 30px;
    font-size: 0.74rem;
    font-weight: 400;
  }

  .tabla-acciones ::v-deep .accion-chip {
    border-radius: 10px;
    min-width: 122px;
    justify-content: center;
    padding: 0 10px;
    border: 1px solid #cfdae6;
    background: linear-gradient(180deg, #ffffff 0%, #f4f8fc 100%) !important;
    box-shadow: 0 1px 2px rgba(25, 56, 84, 0.08);
    letter-spacing: 0.02em;
    transition: all 0.18s ease;
  }

  .tabla-acciones ::v-deep .accion-chip:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(24, 62, 96, 0.14);
  }

  .tabla-acciones ::v-deep .accion-chip .v-icon {
    font-size: 16px;
    opacity: 0.92;
  }

  .tabla-acciones ::v-deep .accion-chip.v-chip--outlined {
    border-color: #9ab7d1;
    color: #2f6581 !important;
  }

  .tabla-acciones ::v-deep .accion-chip:not(.v-chip--outlined) {
    border-color: #6f869d;
    color: #f8fbff !important;
    background: linear-gradient(160deg, #8fa4b8 0%, #70879e 55%, #5f758a 100%) !important;
    box-shadow: 0 2px 7px rgba(39, 69, 98, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.24);
    text-shadow: 0 1px 0 rgba(18, 36, 53, 0.22);
  }

  .tabla-acciones ::v-deep .accion-chip:not(.v-chip--outlined):hover {
    border-color: #62839f;
    background: linear-gradient(160deg, #96acc0 0%, #748ea5 58%, #5f798f 100%) !important;
    box-shadow: 0 6px 14px rgba(30, 61, 90, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.28);
  }
/* dialog */
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
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    text-transform: none;
    border-radius: 999px;
    margin: 0 6px 8px;
    min-width: 160px;
    height: 40px;
    padding: 0 18px;
    color: #314a61;
    background: linear-gradient(180deg, #ffffff 0%, #f3f6fa 100%);
    border: 1px solid #d5e0eb;
    transition: all 0.22s ease;
  }

  .dialog ::v-deep .tabs {
    background: linear-gradient(135deg, #f5f9fd 0%, #edf4fb 55%, #f7fbff 100%);
    padding: 12px 12px 2px;
    border-bottom: 1px solid var(--dialog-border);
  }

  .dialog ::v-deep .tab::before {
    opacity: 0;
  }

  .dialog ::v-deep .tab:hover {
    transform: translateY(-1px);
    background: linear-gradient(180deg, #ffffff 0%, #eaf2fb 100%);
    color: var(--dialog-primary);
    box-shadow: 0 6px 16px rgba(11, 60, 93, 0.12);
  }

  .dialog ::v-deep .tab.v-tab--active {
    background: linear-gradient(180deg, var(--dialog-primary) 0%, var(--dialog-primary-soft) 100%);
    color: #ffffff !important;
    border-color: var(--dialog-primary);
    box-shadow: 0 8px 18px rgba(11, 60, 93, 0.3);
  }

  .dialog ::v-deep .v-tabs-slider {
    height: 3px;
    border-radius: 999px;
    background-color: var(--dialog-accent);
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

  /* Icon treatment: lighter visual weight for a cleaner, finer appearance. */
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
    font-weight: 500;
    letter-spacing: 0.03em;
    text-transform: none;
  }

  .informante-search-btn {
    border-radius  : 999px;
    padding        : 0 18px;
    letter-spacing : 0.03em;
    text-transform : none;
    transition     : all 0.2s ease;
    border-width   : 1px;
  }

  .informante-search-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(11, 60, 93, 0.14);
  }

  .informante-panel {
    padding: 15px;
    border-radius: 16px;
    background: linear-gradient(142deg, #fbfdff 0%, #eef5fc 64%, #f8fbff 100%);
    border: 1px solid #d6e2ee;
    box-shadow: 0 12px 28px rgba(22, 54, 84, 0.08);
  }

  .informante-panel-head {
    padding: 0 2px 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(130, 152, 176, 0.22);
  }

  .informante-panel-title {
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: 0.028em;
    color: #253f57;
  }

  .informante-panel-subtitle {
    font-size: 0.8rem;
    line-height: 1.35;
    color: #60758b;
  }

  .informante-fields-row {
    margin: 0;
  }

  .informante-panel ::v-deep .v-input__slot {
    border-radius: 11px !important;
    background-color: rgba(255, 255, 255, 0.94);
  }

  .informante-panel ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 3px rgba(11, 60, 93, 0.1);
  }

  .informante-panel ::v-deep .v-text-field--outlined fieldset {
    border-color: #bdccdb;
  }

  .informante-panel ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #0b3c5d;
  }

  .informante-panel ::v-deep .v-label {
    color: #29425b;
    letter-spacing: 0.012em;
    font-weight: 400;
  }

  .informante-card {
    background    : linear-gradient(145deg, #f8fbfe 0%, #edf4fb 100%) !important;
    border        : 1px solid #bcc8d8 !important;
    border-radius : 15px !important;
  }

  .informante-row {
    margin: 0;
    align-items: center;
  }

  .informante-avatar {
    border: 1px solid #bdbdbd
  }

  .informante-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    padding: 2px 4px;
  }

  .informante-line {
    display: flex;
    flex-direction: column;
    padding: 5px 8px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(133, 155, 179, 0.24);
  }

  .informante-label {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    color: #51667d;
    font-weight: 500;
  }

  .informante-value {
    font-size: 0.84rem;
    font-weight: 300;
    color: #4c5d6f;
    margin-top: 1px;
    line-height: 1.2;
  }

  .hechos-panel {
    padding: 15px;
    border-radius: 16px;
    background: linear-gradient(136deg, #f9fcff 0%, #eef4fb 58%, #f8fcff 100%);
    border: 1px solid #d5e1ed;
    box-shadow: 0 12px 26px rgba(23, 53, 82, 0.08);
  }

  .hechos-panel-head {
    padding: 0 2px 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(130, 152, 176, 0.22);
  }

  .hechos-panel-title {
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: 0.028em;
    color: #253f57;
  }

  .hechos-panel-subtitle {
    font-size: 0.8rem;
    line-height: 1.35;
    color: #60758b;
  }

  .hechos-fields-row {
    margin: 0;
  }

  .hechos-panel ::v-deep .v-input__slot {
    border-radius: 11px !important;
    background-color: rgba(255, 255, 255, 0.94);
  }

  .hechos-panel ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 3px rgba(11, 60, 93, 0.1);
  }

  .hechos-panel ::v-deep .v-text-field--outlined fieldset {
    border-color: #bdccdb;
  }

  .hechos-panel ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #0b3c5d;
  }

  .hechos-panel ::v-deep .v-label {
    color: #29425b;
    letter-spacing: 0.012em;
    font-weight: 400;
  }

  .hechos-panel ::v-deep .v-counter {
    color: #6b7f95;
  }

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
    font-weight: 400;
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

  .hechos-date-time-lift {
    margin-top: -10px;
    margin-bottom: 12px;
  }

  .v-tabs-items.full-height-tab  {
    height: calc( 90vh - 292px );
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #9cb3c9 transparent;
  }
/* Row table display */	
  ::v-deep .row-table-display-off {
    background-color: transparent !important;
  }
  ::v-deep .row-table-display-off td {
    color: #6b7885 !important;
  }
  ::v-deep .row-table-display-success {
    background-color: #f7fcf8 !important;
  }		
  ::v-deep .row-table-display-primary {
    background-color: #fffafa !important;
  }
  ::v-deep .row-table-display-info {
    background-color: #f8fcff !important;
  }
  ::v-deep .row-table-display-secondary {
    background-color: #fbfbfb !important;
  }
/* Multilinea para encabezados de tabla */
  .multiline-header {
    display: inline-block;
    white-space: normal;
    line-height: 1.25;
    text-align: center;
  }  
/* Time picker input */	
  .time-picker-off ::v-deep input[type="time"]::-webkit-calendar-picker-indicator {
    background        : none;
    display           : none;
    -webkit-appearance: none;
  }
  /* Chip */
  .custom-chip {
    border-radius: 50px;
    min-width: 120px;
    justify-content: center;
  }	
  .custom-chip--toolbar {
    border-radius: 50px;
    min-width: 120px;
    justify-content: center;
    font-size: 0.86rem;
    font-weight: 300;
    letter-spacing: 0.02em;
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;		
    min-height: 30px;
    border: 1px solid rgba(140, 167, 191, 0.38);
    box-shadow: 0 1px 2px rgba(25, 56, 84, 0.08); 
  }

  .custom-chip--toolbar:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(24, 62, 96, 0.14);
    filter: saturate(1.03);
  }

  .custom-chip--toolbar.v-chip.v-chip--pill {
    padding: 0 14px;
  }

  .custom-chip--toolbar-active {
    transform: translateY(-1px);
    box-shadow: 0 0 0 2px rgba(43, 73, 99, 0.28), 0 8px 14px rgba(24, 62, 96, 0.18);
    border-color: rgba(255, 255, 255, 0.75);
  }

  .custom-chip--toolbar-active ::v-deep .v-icon {
    opacity: 0.98;
  }

  .custom-chip--toolbar.custom-chip--toolbar-all {
    background-color: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.38);
    color: rgba(0, 0, 0, 0.6) !important;
    font-weight: 500;
    letter-spacing: 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .custom-chip--toolbar.custom-chip--toolbar-all ::v-deep .v-icon {
    color: inherit;
  }

  .custom-chip--toolbar.custom-chip--toolbar-all:hover {
    transform: none;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }

  .custom-chip--toolbar.custom-chip--toolbar-all.custom-chip--toolbar-active {
    transform: none;
    border-color: rgba(0, 0, 0, 0.72);
    color: rgba(0, 0, 0, 0.87) !important;
    font-weight: 600;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.16), 0 4px 10px rgba(0, 0, 0, 0.14);
  }
    /* Estilos para el modo oscuro */
.incidentes-dark {
    --dialog-primary: #345466;
    --dialog-primary-soft: #42687b;
    --dialog-border: #45494d;
    --dialog-surface: #242628;
  }

  .incidentes-dark ::v-deep .toolbar {
    border-bottom-color: #45494d;
  }

  .incidentes-dark ::v-deep .tabla {
    background-color: #202224;
    border-color: #45494d;
  }

  .incidentes-dark ::v-deep .tabla thead tr {
    background: #2b2f32;
  }

  .incidentes-dark ::v-deep .tabla th {
    color: #dce4e9;
  }

  .incidentes-dark ::v-deep .tabla tbody td {
    color: #d4d8dc;
  }

  .incidentes-dark ::v-deep .tabla tbody tr:nth-child(even) {
    background-color: #252729;
  }

  .incidentes-dark ::v-deep .row-table-display-info {
    background-color: #242c31 !important;
  }

  .incidentes-dark ::v-deep .row-table-display-success {
    background-color: #252e27 !important;
  }

  .incidentes-dark ::v-deep .row-table-display-primary {
    background-color: #312728 !important;
  }

  .incidentes-dark ::v-deep .row-table-display-secondary {
    background-color: #242526 !important;
  }

  .incidentes-dark ::v-deep .row-table-display-off td {
    color: #aeb8c0 !important;
  }

  .incidentes-dark ::v-deep .tabla tbody tr:hover {
    background-color: #363b3f !important;
  }

  .incidentes-dark ::v-deep .accion-btn {
    border-color: #51575c;
    background: linear-gradient(180deg, #34383b 0%, #292c2f 100%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .incidentes-dark ::v-deep .accion-btn:hover {
    border-color: #89959e;
    background: #3b4247;
  }

  .incidentes-dark ::v-deep .accion-btn--view .v-icon { color: #94c4ee; }
  .incidentes-dark ::v-deep .accion-btn--police .v-icon { color: #86c8d9; }
  .incidentes-dark ::v-deep .accion-btn--judicial .v-icon { color: #d8c77e; }
  .incidentes-dark ::v-deep .accion-btn--involved .v-icon { color: #92d3bb; }
  .incidentes-dark ::v-deep .accion-btn--edit .v-icon { color: #becd87; }
  .incidentes-dark ::v-deep .accion-btn--delete .v-icon { color: #ee9d9d; }
  .incidentes-dark ::v-deep .accion-btn--files .v-icon { color: #b1c6df; }
  .incidentes-dark ::v-deep .accion-btn--files-plus .v-icon { color: #89cddc; }

  .incidentes-dark ::v-deep .accion-btn.v-btn--disabled {
    border-color: #45494d;
  }

  .incidentes-dark ::v-deep .accion-chip.v-chip--outlined {
    background: #292c2f !important;
    border-color: #7ba0b3;
    color: #a6c9dc !important;
  }

  .incidentes-dark ::v-deep .accion-chip:not(.v-chip--outlined) {
    background: #42687b !important;
    border-color: #7ba0b3;
  }

  .incidentes-dark ::v-deep .accion-chip:hover {
    background: #3b4247 !important;
  }

  .incidentes-dark ::v-deep .custom-chip--toolbar {
    border-color: #60676c;
  }

  .incidentes-dark ::v-deep .custom-chip--toolbar-active {
    border-color: #d3d8dc;
    box-shadow: 0 0 0 2px rgba(220, 228, 233, 0.28), 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .incidentes-dark ::v-deep .custom-chip--toolbar.custom-chip--toolbar-all {
    background-color: #292c2f !important;
    border-color: #899096;
    color: #d4d8dc !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .incidentes-dark ::v-deep .custom-chip--toolbar.custom-chip--toolbar-all:hover {
    border-color: #b9c0c6;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  }

  .incidentes-dark ::v-deep .custom-chip--toolbar.custom-chip--toolbar-all.custom-chip--toolbar-active {
    border-color: #e1e5e8;
    color: #ffffff !important;
    box-shadow: 0 0 0 3px rgba(225, 229, 232, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .v-card.incidentes-dark {
    background: #242628 !important;
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.4) !important;
  }

  .incidentes-dark ::v-deep .tabs {
    background: #292c2f;
  }

  .incidentes-dark ::v-deep .tab {
    background: #34383b;
    border-color: #51575c;
    color: #d4d8dc;
  }

  .incidentes-dark ::v-deep .tab:hover {
    background: #3d4348;
    color: #ffffff;
  }

  .incidentes-dark ::v-deep .tab.v-tab--active {
    background: #42687b;
    border-color: #7ba0b3;
    color: #ffffff !important;
  }

  .incidentes-dark ::v-deep .informante-panel,
  .incidentes-dark ::v-deep .hechos-panel,
  .incidentes-dark ::v-deep .other-panel,
  .incidentes-dark ::v-deep .informante-card {
    background: #2b2e30 !important;
    border-color: #45494d !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .incidentes-dark ::v-deep .informante-panel-title,
  .incidentes-dark ::v-deep .hechos-panel-title,
  .incidentes-dark ::v-deep .other-panel-title,
  .incidentes-dark ::v-deep .informante-value {
    color: #e1e5e8;
  }

  .incidentes-dark ::v-deep .informante-panel-subtitle,
  .incidentes-dark ::v-deep .hechos-panel-subtitle,
  .incidentes-dark ::v-deep .other-panel-subtitle,
  .incidentes-dark ::v-deep .informante-label,
  .incidentes-dark ::v-deep .v-counter {
    color: #aeb8c0;
  }

  .incidentes-dark ::v-deep .v-input__slot {
    background-color: #242628 !important;
  }

  .incidentes-dark ::v-deep .v-label {
    color: #c8d0d6 !important;
  }

  .incidentes-dark ::v-deep input,
  .incidentes-dark ::v-deep textarea,
  .incidentes-dark ::v-deep .v-select__selection,
  .incidentes-dark ::v-deep .v-list-item__title {
    color: #e1e5e8 !important;
  }

  .incidentes-dark ::v-deep .v-text-field--outlined fieldset {
    border-color: #69747c;
  }

  .incidentes-dark ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #a6c9dc;
  }

  .incidentes-dark ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(166, 201, 220, 0.15);
  }

  .incidentes-dark ::v-deep .v-input .v-icon,
  .incidentes-dark ::v-deep .tab .v-icon {
    color: #bacbd6 !important;
  }

  .incidentes-dark ::v-deep .informante-line,
  .incidentes-dark ::v-deep .radio-group,
  .incidentes-dark ::v-deep .radio {
    background: #34383b;
    border-color: #51575c;
  }

  .incidentes-dark ::v-deep .v-radio--is-active {
    background: #3c505b;
    border-color: #91b3c6;
  }

  .incidentes-dark ::v-deep .full-height-tab {
    background: #242628;
    scrollbar-color: #69747c transparent;
  }  

  ::v-deep(.v-dialog__content.theme--dark .v-card) {
    background-color: #242628;
    color: #e1e5e8;
  }

  ::v-deep(.v-dialog__content.theme--dark .v-card__text) {
    color: #d4d8dc;
  }
</style>