<template>
  <v-container fluid :class="{ 'preliminares-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="toolbar">
<!-- Filtros de busqueda -->                
        <v-text-field
          v-model       = "search"
          :append-icon  = "search != oldSearch ? 'mdi-magnify-plus-outline' : 'mdi-magnify'"
          label         = "Buscar informe preliminar de seguridad en el listado"
          hint          = "Escriba su criterio de búsqueda y presione 'ENTER'"
          class         = "toolbar-search"
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
          class     = "toolbar-unit"
          item-text = "sigla"
          item-value= "codigo"
          outlined
          dense
        ></v-select>        
        <v-spacer />
<!-- Cantidad de items por paginas -->                 
        <v-select
          v-model = "items"
          :items  = "itemsPerPage"
          label   = "Cantidad de items por página"
          class   = "toolbar-items"                    
          outlined
          dense
        ></v-select>                
      </v-card-title>   
<!-- Lista de informes preliminares -->            
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
          <template v-slot:header.fechA_HECHO>
            <span class="multiline-header">Fecha y hora<br />hecho</span>
          </template>        
          <template v-slot:item.fechA_HECHO = "{ item }">
            <div> {{ getFormatDateTime(item.fechA_HECHO).dateFormatted }}</div>
            <div> {{ getFormatDateTime(item.fechA_HECHO).timeFormatted }}</div>
          </template>
          <template v-slot:item.incidentes.circunstanciA_HECHO = "{ item }">
            <div class="tabla-bloque"> {{ item.incidentes.circunstanciA_HECHO }}</div>
          </template>					
<!--
    Acciones
        - Informe
        - Procedimientos policiales
        - Antecedentes judiciales
        - Involucrados
        - Archivos				
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
                    @click    = "reportView(item)"
                  >
                    <v-icon>
                      mdi-file-document-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Ver informe preliminar</span>
              </v-tooltip>						 
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--police"
                    icon 
                    v-on      = "on" 
                    @click    = "policeProcedures(item)"
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
                    @click    = "judicialRecords(item)"
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
                    @click  = "involved(item)"
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
                    @click = "reportFolders(item)"
                  >
                    <v-icon>mdi-folder-file-outline</v-icon>
                  </v-btn>
                </template>
                <span>Archivos</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class     = "accion-btn accion-btn--edit"
                    icon 
                    v-on      = "on" 
                    @click    = "editItem(item)"
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
                    @click = "confirmDeleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Eliminar</span>
              </v-tooltip> -->
            </div>
          </template>   
<!-- Mensaje cuando no hay data -->                    
          <template v-slot:no-data>
            No se han encontrado informes preliminares de seguridad registrados en el sistema
          </template>
        </v-data-table>
<!-- Paginación -->
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
      • Componente que despliega la vista previa del informe preliminar publicado (report-view.vue)
-->
    <v-dialog
      v-model    = "reportViewDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
    >
      <v-card>
        <v-card-text>
          <report-view
            :item               = "editedItem"
            :titles             = "{ 
              title    : `Informe Preliminar ${editedItem.id}`, 
              subtitle : `${editedItem.incidentE_ACCIDENTE ? 'Incidente' : 'Accidente'} - ${editedItem.personaL_UNIDAD === 'P' ? 'Personal' : 'Unidad'} ` 
              }"
            :tipoInforme		= "'Preliminar'"
            @closeReportView = "closeReportViewDialog"
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
          <span class="text-h8 white--text">{{ preliminarTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Procedimientos-Policiales v-if="policeProceduresDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Preliminar'"
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
          <span class="text-h8 white--text">{{ preliminarTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Antecedentes-Judiciales v-if="judicialRecordsDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Preliminar'"
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
          <span class="text-h8 white--text">{{ preliminarTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Involucrados v-if="involvedDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Preliminar'"
          />
        </v-card-text> 
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
          <span class="text-h8 white--text">{{ preliminarTitle }}</span>
        </v-card-subtitle>                                    
        <v-card-text>
          <Archivos-Informe v-if="reportFoldersDialog" 
          :informesId  = "informesId"
          :tipoInforme = "'Preliminar'"
          />
        </v-card-text> 
      </v-card>
    </v-dialog>							
<!--
  👉 preliminarDialog
      • Componente que despliega formulario para crear un nuevo informe preliminar o actualizar uno existente
-->                        
    <v-dialog
      v-model    = "preliminarDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
      class      = "dialog"
    >
      <v-card :class="{ 'preliminares-dark': $vuetify.theme.dark }">
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
                                locale	= "es"
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
            @click = "closePreliminarDialog"
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
  👉	PublishDialog
      •	Componente que despliega la vista previa del informe preliminar antes de su publicación (report-preview.vue)
      •	Se puede confirmar o cancelar la publicación del informe preliminar, mediante el despliegue del componente confirmPublishDialog
-->                        
    <v-dialog
      v-model    = "publishDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
    >
      <v-card>
        <v-card-text>
          <preview-report
            :item               = "editedItem"
            :titles             = "{ 
              title    : `Publicar Informe Preliminar ${editedItem.id}`, 
              subtitle : `${editedItem.incidentE_ACCIDENTE ? 'Incidente' : 'Accidente'} - ${editedItem.personaL_UNIDAD === 'P' ? 'Personal' : 'Unidad'} ` 
              }"
            :tipoInforme		    = "'Preliminar'"						
            @closePreviewReport = "closePreviewReport"
          />
        </v-card-text>
        <v-card-actions class="px-6 py-4">
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            outlined
            class="mr-3"
            @click="publishDialog = false"
          >
            No, Cancelar
          </v-btn>
          <v-btn
            color="primary"
    
            @click="confirmPublishDialog = true"
            :disabled="buttonClicked"
          >
            Si, Publicar
          </v-btn>
          
        </v-card-actions>
<!-- 
  👉 confirmPublishDialog
      • Componente que despliega mensaje que confirma y cancela la publicación del preliminar
-->
        <v-dialog 
          v-model    = "confirmPublishDialog"
          persistent
          :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
        >
          <v-card>
            <v-card-title class="primary">
              <span class="white--text">Publicar Preliminar</span>
              <v-spacer />
              <v-btn dark icon @click="confirmPublishDialog = false">
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
                    Está a punto de publicar el nuevo preliminar; una vez publicado, será inmutable y quedará disponible para el S2 de {{ editedItem.u_AFECTADA.sigla }}. ¿desea continuar?.
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color  = "secondary"
                outlined
                @click = "publishDialog = false"
              >
                No, Cancelar
              </v-btn>
              <v-btn
                color  = "primary"
                @click = "publishItem"
              >
                Si, Publicar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>				
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
  import PreviewReport		        from "@/components/reports/previewReport";
  import ReportView		            from "@/components/reports/reportView";

  export default {
    name       : "preliminaresBINTE",        
    components : {
      AddPersona,
      ProcedimientosPoliciales,
      AntecedentesJudiciales,
      Involucrados,
      ArchivosInforme,
      PreviewReport,
      ReportView,
    },		
    data       : () => ({
      search                  : '', 
      oldSearch               : '',
      selectedUnidad          : '0',      
      page                    : 1,
      oldPage                 : 1,
      items                   : 5,				
      tabs                    : null,
      informesId              : 0,
      policeProceduresDialog  : false,
      judicialRecordsDialog   : false,
      involvedDialog          : false,			
      preliminarDialog        : false,
      publishDialog           : false,			
      confirmPublishDialog    : false,
      personaDialog           : false,
      confirmDeleteDialog     : false,
      reportViewDialog        : false,
      reportFoldersDialog     : false,
      preliminarTitle         : '',
      editedIndex             : -1,			
      validForm               : false,
      buttonClicked           : false,			
      tabInformante           : 'tabInformante',
      tabHechos               : 'tabHechos',
      editedItem              : {
        ruT_INFORMANTE      : null,
        informante          : {},
        u_INFORMANTE        : {},
        fechaInformante     : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0,10),
        horaInformante      : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16),
        incidentE_ACCIDENTE	: null,
        TipO_INGESTA        : {},
        tipO_INCIDENTE      : {},
        personaL_UNIDAD     : null,
        u_AFECTADA          : {},
        fechaHechos         : null,
        horaHechos          : null,
        lugaR_HECHO         : '',
        circunstanciA_HECHO : '',
        danoS_PERSONALES    : '',
        medidaS_ADOPTADAS   : '',
      },
      defaultItem             : {
        ruT_INFORMANTE      : null,
        informante          : {},
        u_INFORMANTE        : {},
        fechaInformante     : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0,10),
        horaInformante      : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16),
        incidentE_ACCIDENTE	: null,
        TipO_INGESTA        : {},				
        tipO_INCIDENTE      : {},
        personaL_UNIDAD     : null,
        u_AFECTADA          : {},
        fechaHechos         : null,
        horaHechos          : null,
        lugaR_HECHO         : '',
        circunstanciA_HECHO : '',
        danoS_PERSONALES    : '',
        medidaS_ADOPTADAS   : '',
      }, 			
      headers                 : [
        { text: "Id"                    , value: "id"                        , groupable: false, sortable: false },
        { text: "Tipo incidente"        , value: "tipO_INCIDENTE.descripcion", groupable: false, sortable: false },
        { text: "Fecha y hora del hecho", value: "fechA_HECHO"               , groupable: false, sortable: false },
        { text: "Circunstancias"        , value: "circunstanciA_HECHO"       , groupable: false, sortable: false },
        { text: "Unidad responsable"    , value: "u_AFECTADA.sigla"          , groupable: false, sortable: false },
        { text: "Acciones"              , value: "acciones"                  , groupable: false, sortable: false },  
      ],
      headersPoliceProcedure  : [
        { text : "FECHA"        , value : "fechA_PROCEDIMIENTO_POL"       , groupable : false, sortable : false, class:"my-header-style" },
        { text : "PROCEDIMIENTO", value : "detallE_PROCEDIMIENTO_POL"     , groupable : false, sortable : false, class:"my-header-style" },
        { text : "CONDICION"    , value : "condicioN_POLICIAL.descripcion", groupable : false, sortable : false, class:"my-header-style" },
      ],
      headersJudicialRecord   : [
        { text : "FECHA"      , value : "fechA_ANTECEDENTES_JUD"  , groupable : false, sortable : false, class:"my-header-style" },
        { text : "ANTECEDENTE", value : "detallE_ANTECEDENTES_JUD", groupable : false, sortable : false, class:"my-header-style" },
      ],	
      headersInvolved         : [
        { text: "RUN"           , value: "ruT_INVOLUCRADO"         , groupable: false, sortable: false, class:"my-header-style" },
        { text: "NOMBRE"        , value: "r_INVOLUCRADO.nombres"   , groupable: false, sortable: false, class:"my-header-style" },
        { text: "ALCOHOL/DROGAS", value: "tipO_CONSUMO.descripcion", groupable: false, sortable: false, class:"my-header-style" },
        { text: "SALUD"         , value: "estadO_SALUD.descripcion", groupable: false, sortable: false, class:"my-header-style" },
        { text: "UNIDAD"        , value: "u_INVOLUCRADO.sigla"     , groupable: false, sortable: false, class:"my-header-style" },
      ],					    
      itemsUnidadesFilter  	  : [ { codigo: '0', sigla: 'Todas las unidades' } ],
      itemsPerPage            : [ 5, 10, 25, 50 ],          			
      itemsUnidades           : [],
      itemsTipoIngestas       : [],
      itemsTipoIncidentes     : [],	
      itemsPoliceProcedure    : [],
      itemsJudicialRecord     : [], 
      itemsInvolved           : [],

/* Calendario */                        
      informanteDate          : {
        date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
        dateFormatted : null,
        menu          : false,
        minDate       : "2024-02-01",
        maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      },
      hechosDate              : {
        date          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
        dateFormatted : null,
        menu          : false,
        minDate       : "2024-02-01",
        maxDate       : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      },    
/* Reloj */     
      informanteTime          : {
        time          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16),
        timeFormatted : null,
        menu          : false
      },
      hechosTime              : {
        time          : (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(11,16), 
        timeFormatted : null,
        menu          : false
      },
/* Validaciones */
      rules                   : {
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
        return { title : this.editedIndex === -1 ? 'Nuevo Preliminar' : 'Editar Preliminar ', subtitle : this.editedIndex === -1 ? '' : `Id: ${this.editedItem.id} - ${this.editedItem.tipO_INCIDENTE.descripcion}` }
      },        
      ...mapGetters("informesPreliminaresStore", [ "informes", "pages", "isLoading" ]),
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

      const respTipoIncidentes = await this.getListTipoIncidente()
      this.itemsTipoIncidentes = respTipoIncidentes.data

      const respTipoIngestas   = await this.getListTipoIngesta()
      this.itemsTipoIngestas   = respTipoIngestas.data
    },
/*	🚀 Watch
    • informanteDate y hechosDate : Se encargan de formatear la fecha obtenida desde el backend para desplegarla en el campo de fecha del 
                                    formulario, y estableciendo el valor formateado en informanteDate.dateFormatted y hechosDate.dateFormatted respectivamente			
    • informanteTime y hechosTime : Se encargan de formatear la hora obtenida desde el backend para desplegarla en el campo de hora del formulario,
                                    a través de la escucha de cambios en el valor de horaInformante y horaHechos respectivamente,y estableciendo el 
                                    valor formateado en informanteTime.timeFormatted y hechosTime.timeFormatted respectivamente
    • page												:	Se encarga de realizar el get de datos para el listado de informes preliminares, con paginación, 
                                    filtro de busqueda y filtrado por tipo de informe ( 'P' de preliminar ), a través de la escucha de cambios en
                                    el valor de page, y controlando la lógica para evitar realizar el getData si el valor de page no ha cambiado 
                                    realmente, a través del valor oldPage
    • items												: Se encarga de realizar el get de datos para el listado de informes preliminares, con paginación, filtro de 
                                    busqueda y filtrado por tipo de informe ( 'P' de preliminar ), a través de la escucha de cambios en el 
                                    valor de items, y estableciendo el valor de page	
*/	
    watch      : {
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
        await this.getListInformesPreliminaresBINTE({
          page     : this.page,
          items    : this.items,
          search   : this.search,
          unidadId : this.selectedUnidad,          
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
/* Vista de informes */      
      reportView(item) {
        this.editedIndex      = item.id;
        this.editedItem       = Object.assign({}, item);				
        this.reportViewDialog = true
      },
      closeReportView() {
        this.reportViewDialog = false
      },			
      closeReportViewDialog() {
        this.reportViewDialog = false
      },	
      closePreviewReport() {
        this.publishDialog = false
      },      
/* Complementos */         
      policeProcedures ( item ) {
        this.preliminarTitle        = `Id: ${item.id} - ${item.tipO_INCIDENTE.descripcion}`
        this.informesId             = item.id
        this.policeProceduresDialog = true
      }, 
      judicialRecords ( item ) {
        this.preliminarTitle       = `Id: ${item.id} - ${item.tipO_INCIDENTE.descripcion}`
        this.informesId            = item.id                            
        this.judicialRecordsDialog = true
      },
      involved ( item ) {
        this.preliminarTitle = `Id: ${item.id} - ${item.tipO_INCIDENTE.descripcion}`
        this.informesId      = item.id
        this.involvedDialog  = true
      },
      async reportFolders(item) {
        this.preliminarTitle      = `Id: ${item.id} - ${item.tipO_INCIDENTE.descripcion}`
        this.informesId           = item.id
        this.reportFoldersDialog  = true
      },	
      async publish(item) {
        this.editedItem    = Object.assign({}, item);
        this.publishDialog = true;
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
        this.tabs                         = 'tabInformante'								
        this.preliminarDialog             = true;
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
        if ( !this.editedItem.ruT_INFORMANTE ) {
              toastr.warning("Debe buscar la persona informante", "Advertencia!");
              this.buttonClicked = false
              return
        }
        const isValid = await this.validate()
        if ( !isValid ) {
          toastr.warning("Debe completar los campos requeridos", "Advertencia!");
          this.buttonClicked = false
          return
        }
        const payload = {
          ruT_INFORMANTE      : this.editedItem.ruT_INFORMANTE,
          unidaD_INFORMANTE   : typeof(this.editedItem.u_INFORMANTE) === 'object' ? this.editedItem.u_INFORMANTE.codigo : this.editedItem.u_INFORMANTE,
          incidentE_ACCIDENTE : this.editedItem.incidentE_ACCIDENTE,					
          TipO_INGESTAID      : this.editedItem.tipO_INGESTA.id,
          fechA_INFORMANTE    : this.editedItem.fechaInformante + 'T' + this.editedItem.horaInformante + ':00',					
          tipO_INCIDENTEID    : this.editedItem.tipO_INCIDENTE.id,
          personaL_UNIDAD     : this.editedItem.personaL_UNIDAD,
          unidaD_AFECTADA     : this.editedItem.u_AFECTADA.codigo,
          fechA_HECHO         : this.editedItem.fechaHechos + 'T' + this.editedItem.horaHechos + ':00',
          lugaR_HECHO         : this.editedItem.lugaR_HECHO,
          circunstanciA_HECHO : this.editedItem.circunstanciA_HECHO,
          danoS_PERSONALES    : this.editedItem.danoS_PERSONALES,
          medidaS_ADOPTADAS   : this.editedItem.medidaS_ADOPTADAS,
        }
        try {
          let resp = null
          if (this.editedIndex > -1) {
            resp = await this.putInformesPreliminares({
              informesid   : this.editedItem.id,
              ...payload,
            })
            if (resp.status == 200) {
              toastr.success("Se ha actualizado la información correctamente", "Éxito!");
              this.page = 1
              await this.getData()
              await this.closePreliminarDialog()
              return
            }
            toastr.error(`Error ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
            this.buttonClicked = false
            return
          } else {
            resp = await this.postInformesPreliminares({
              ...payload,
              especificacioN_VESTUARIO      : "N/R",
              tipO_IDENTIFICACIONID         : null,
              portabA_ARMA                  : "N",
              tipO_ARMAMENTOID              : null,
              armA_FISCAL_PARTICULAR        : "N",
              detallE_PORTE_ARMA            : "N/R",
              realizA_INVESTIGACION         : "N",
              tipO_INVESTIGACIONID          : null,
              detallE_INVESTIGACION         : "N/R",
              unidaD_INTELIGENCIA_ADOPTA    : "N/R",
              caracteristicaS_MATERIAL      : "N/R",
              detallE_RESULTADO_MUERTE      : "N/R",
              detallE_DOCUMENTACION_PERDIDA : "N/R",
              autoridaD_REQUIERE_INFO       : "N/R",
              medidaS_ADOPTADAS_FAMILIARES  : "N/R",
              sintesiS_MEDIOS_PRENSA        : "N/R",
              medidaS_DISCIPLINARIAS        : "N/R",
            })
            if (resp.status == 200) {
              toastr.success("Se ha creado correctamente el informe preliminar", "Éxito!");
              this.page = 1
              await this.getData()
              await this.closePreliminarDialog()
              return
            }
            if (resp.status == 409 || resp.status == 401) {
              toastr.error(resp.message, "Error!");
              this.buttonClicked = false
              return
            }
            toastr.error(`Error ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
            this.buttonClicked = false
          }
        } catch (error) {
          toastr.error("Ha ocurrido un error al guardar el informe", "Error!");
          this.buttonClicked = false
          console.error('save error', error)
        }
      },      
      async closePreliminarDialog() {
        const now = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)
        const today = now.toISOString().slice(0,10)
        const currentTime = now.toISOString().slice(11,16)

        this.preliminarDialog             = false    
        this.editedItem                   = Object.assign({}, this.defaultItem);
        this.editedItem.fechaInformante   = today
        this.editedItem.horaInformante    = currentTime
        this.editedIndex                  = -1;
        this.informanteDate.date          = today
        this.informanteDate.maxDate       = today
        this.informanteDate.dateFormatted = this.formatDate(today)
        this.informanteTime.timeFormatted = currentTime
        this.hechosDate.dateFormatted     = '' 
        this.hechosTime.timeFormatted     = ''
        this.resetValidation() 
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },      
      async deleteItem() {
        const res = await this.deleteInformesPreliminares(this.editedItem)
        if (res.status == 200) {
          toastr.success("Se ha eliminado la información correctamente", "Éxito!");
          this.page = 1
          await this.getData()
        } else {
          toastr.error("Ha ocurrido un error", "Error!");
          return;
        }
        this.closeConfirmDeleteDialog(); 
      },      
      async closeConfirmDeleteDialog() {
        this.confirmDeleteDialog = false    
        this.editedItem          = Object.assign({}, this.defaultItem);
        this.editedIndex         = -1;
      },      
      async publishItem() {
        this.buttonClicked = true
        await this.putPublicarInformesPreliminares({
          informesid : this.editedItem.id,					
          ...this.editedItem,
          
        })
        .then(async resp => {
          if (resp.status == 200) {
            toastr.success("Se ha publicado correctamente el informe preliminar", "Éxito!");
            this.buttonClicked = false
            this.page = 1
            await this.getData()
          } else {
            toastr.error("Ha ocurrido un error al publicar el informe preliminar", "Error!");
            this.buttonClicked = false
            return;
          }
        });
        this.publishDialog = false
      },

			


			

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
        const tabRefs = ["tabInformantePanel", "tabHechosPanel"];

        for (let i = 0; i < tabRefs.length; i++) {
          const tabRef = this.$refs[tabRefs[i]];
          const tabEl = Array.isArray(tabRef) ? tabRef[0] : tabRef;

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
      getItemClass(item) {
        const index = this.informes.indexOf(item)
        return index % 2 === 0 ? 'row-table-display-even' : 'row-table-display-odd'
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

      ...mapActions("informesPreliminaresStore",	[	"getListInformesPreliminaresBINTE", "postInformesPreliminares"       ,      
                                                    "putInformesPreliminares"         , "putPublicarInformesPreliminares",
                                                    "deleteInformesPreliminares" , ]),            
      ...mapActions("tipoIngestaStore"         , 	[ "getListTipoIngesta"   , ]),
      ...mapActions("tipoIncidenteStore"       , 	[ "getListTipoIncidente" , ]),
      ...mapActions("unidadesStore"            , 	[ "getListUnidades"      , ]), 
    }							
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
  .toolbar ::v-deep .toolbar-search {
    max-width: 430px;
    min-width: 330px;
  }
  .toolbar ::v-deep .toolbar-items,
  .toolbar ::v-deep .toolbar-unit {
    max-width: 250px;
    min-width: 220px;
  }
  .toolbar ::v-deep .toolbar-search .v-input__slot,
  .toolbar ::v-deep .toolbar-items .v-input__slot,
  .toolbar ::v-deep .toolbar-unit .v-input__slot {
    border-radius: 10px !important;
  }
  .toolbar ::v-deep .toolbar-search.v-input--is-focused .v-input__slot,
  .toolbar ::v-deep .toolbar-items.v-input--is-focused .v-input__slot,
  .toolbar ::v-deep .toolbar-unit.v-input--is-focused .v-input__slot   {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
  }
  .toolbar ::v-deep .toolbar-search .v-label,
  .toolbar ::v-deep .toolbar-items .v-label,
  .toolbar ::v-deep .toolbar-unit .v-label,
  .toolbar ::v-deep .toolbar-search input,
  .toolbar ::v-deep .toolbar-items input,
  .toolbar ::v-deep .toolbar-unit input,
  .toolbar ::v-deep .toolbar-items .v-select__selection {
    font-size: 0.95rem;
    font-weight: 400;
    letter-spacing: 0.015em;
  }
  .toolbar ::v-deep .toolbar-search .v-input__append-inner .v-icon,
  .toolbar ::v-deep .toolbar-items .v-input__append-inner .v-icon,
  .toolbar ::v-deep .toolbar-unit .v-input__append-inner .v-icon {
    font-size: 16px;
    opacity: 0.86;
  }

/* Tabla de datos */
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
    flex-wrap: wrap;
    min-width: 320px;
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
  .tabla-acciones ::v-deep .accion-btn--view .v-icon       { color: #2563a6; }
  .tabla-acciones ::v-deep .accion-btn--police .v-icon     { color: #176b87; }
  .tabla-acciones ::v-deep .accion-btn--judicial .v-icon   { color: #6b5b18; }
  .tabla-acciones ::v-deep .accion-btn--involved .v-icon   { color: #24745f; }
  .tabla-acciones ::v-deep .accion-btn--edit .v-icon       { color: #708238; }
  .tabla-acciones ::v-deep .accion-btn--delete .v-icon     { color: #b33a3a; }
  .tabla-acciones ::v-deep .accion-btn--files .v-icon      { color: #4c6280; }

  .tabla-acciones ::v-deep .accion-btn--view:hover       { border-color: #8ab4db; background: #edf5fc; }
  .tabla-acciones ::v-deep .accion-btn--police:hover     { border-color: #82c1d2; background: #eaf7fa; }
  .tabla-acciones ::v-deep .accion-btn--judicial:hover   { border-color: #d1bd65; background: #fbf7e6; }
  .tabla-acciones ::v-deep .accion-btn--involved:hover   { border-color: #8bc7b4; background: #eaf7f1; }
  .tabla-acciones ::v-deep .accion-btn--edit:hover       { border-color: #aab56b; background: #f4f6e8; }
  .tabla-acciones ::v-deep .accion-btn--delete:hover     { border-color: #dc9898; background: #fff0f0; }
  .tabla-acciones ::v-deep .accion-btn--files:hover      { border-color: #a6bbd2; background: #f2f7fc; }

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
  .dialog ::v-deep .tab {
    font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
    font-size: 0.95rem;
    font-weight: 400;
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
/* tab informante */
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
    font-weight: 500;
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
    font-weight: 400;
  }
  .informante-value {
    font-size: 0.84rem;
    font-weight: 300;
    color: #4c5d6f;
    margin-top: 1px;
    line-height: 1.2;
  }
/* tab hechos */
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
    font-weight: 500;
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
  /* Radio buttons */
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
/* Date and Time pickers */
  .hechos-date-time-lift {
    margin-top: -10px;
    margin-bottom: 12px;
  }
/* Scrollbar */
  .v-tabs-items.full-height-tab  {
    height: calc( 90vh - 292px );
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #9cb3c9 transparent;
  }
/* Row table display off */
  ::v-deep .row-table-display-even {
    background-color: transparent !important;
  }
  ::v-deep .row-table-display-even td {
    color: #6d8093 !important;
  }
/* Row table display success */	
  ::v-deep .row-table-display-odd {
    background-color: #fafafa !important;	
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

  .preliminares-dark {
    --dialog-primary: #345466;
    --dialog-primary-soft: #42687b;
    --dialog-border: #45494d;
  }

  .preliminares-dark ::v-deep .toolbar {
    border-bottom-color: #45494d;
  }

  .preliminares-dark ::v-deep .toolbar .v-label,
  .preliminares-dark ::v-deep .toolbar input,
  .preliminares-dark ::v-deep .toolbar .v-select__selection {
    color: #d4d8dc;
  }

  .preliminares-dark ::v-deep .toolbar .v-icon {
    color: #bacbd6;
  }

  .preliminares-dark ::v-deep .tabla {
    background-color: #202224;
    border-color: #45494d;
  }

  .preliminares-dark ::v-deep .tabla thead tr {
    background: #2b2f32;
  }

  .preliminares-dark ::v-deep .tabla th {
    color: #dce4e9;
  }

  .preliminares-dark ::v-deep .tabla tbody td {
    color: #d4d8dc;
  }

  .preliminares-dark ::v-deep .tabla tbody tr:nth-child(even),
  .preliminares-dark ::v-deep .row-table-display-even {
    background-color: #252729 !important;
  }

  .preliminares-dark ::v-deep .row-table-display-even td {
    color: #d4d8dc !important;
  }

  .preliminares-dark ::v-deep .row-table-display-odd {
    background-color: #202224 !important;
  }

  .preliminares-dark ::v-deep .tabla tbody tr:hover {
    background-color: #363b3f !important;
  }

  .preliminares-dark ::v-deep .accion-btn {
    border-color: #51575c;
    background: linear-gradient(180deg, #34383b 0%, #292c2f 100%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .preliminares-dark ::v-deep .accion-btn:hover {
    border-color: #89959e;
    background: #3b4247;
  }

  .preliminares-dark ::v-deep .accion-btn--view .v-icon { color: #94c4ee; }
  .preliminares-dark ::v-deep .accion-btn--police .v-icon { color: #86c8d9; }
  .preliminares-dark ::v-deep .accion-btn--judicial .v-icon { color: #d8c77e; }
  .preliminares-dark ::v-deep .accion-btn--involved .v-icon { color: #92d3bb; }
  .preliminares-dark ::v-deep .accion-btn--edit .v-icon { color: #becd87; }
  .preliminares-dark ::v-deep .accion-btn--files .v-icon { color: #b1c6df; }

  .preliminares-dark ::v-deep .accion-btn.v-btn--disabled {
    border-color: #45494d;
  }

  .v-card.preliminares-dark {
    background: #242628 !important;
    color: #d4d8dc;
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.4) !important;
  }

  .preliminares-dark ::v-deep .tabs {
    background: #292c2f;
    border-bottom-color: #45494d;
  }

  .preliminares-dark ::v-deep .tab {
    background: #34383b;
    border-color: #51575c;
    color: #d4d8dc;
  }

  .preliminares-dark ::v-deep .tab:hover {
    background: #3d4348;
    color: #ffffff;
  }

  .preliminares-dark ::v-deep .tab.v-tab--active {
    background: #42687b;
    border-color: #7ba0b3;
    color: #ffffff !important;
  }

  .preliminares-dark ::v-deep .informante-panel,
  .preliminares-dark ::v-deep .hechos-panel,
  .preliminares-dark ::v-deep .informante-card {
    background: #2b2e30 !important;
    border-color: #45494d !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .preliminares-dark ::v-deep .informante-panel-head,
  .preliminares-dark ::v-deep .hechos-panel-head {
    border-bottom-color: #45494d;
  }

  .preliminares-dark ::v-deep .informante-panel-title,
  .preliminares-dark ::v-deep .hechos-panel-title,
  .preliminares-dark ::v-deep .informante-value {
    color: #e1e5e8;
  }

  .preliminares-dark ::v-deep .informante-panel-subtitle,
  .preliminares-dark ::v-deep .hechos-panel-subtitle,
  .preliminares-dark ::v-deep .informante-label,
  .preliminares-dark ::v-deep .v-counter {
    color: #aeb8c0;
  }

  .preliminares-dark ::v-deep .v-input__slot,
  .preliminares-dark ::v-deep .full-height-tab {
    background-color: #242628 !important;
  }

  .preliminares-dark ::v-deep .v-input input,
  .preliminares-dark ::v-deep .v-input textarea,
  .preliminares-dark ::v-deep .v-select__selection {
    color: #d4d8dc;
  }

  .preliminares-dark ::v-deep .v-label {
    color: #c8d0d6 !important;
  }

  .preliminares-dark ::v-deep .v-text-field--outlined fieldset {
    border-color: #69747c;
  }

  .preliminares-dark ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #a6c9dc;
  }

  .preliminares-dark ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(166, 201, 220, 0.15);
  }

  .preliminares-dark ::v-deep .v-input .v-icon {
    color: #bacbd6 !important;
  }

  .preliminares-dark ::v-deep .informante-line,
  .preliminares-dark ::v-deep .radio-group,
  .preliminares-dark ::v-deep .radio {
    background: #34383b;
    border-color: #51575c;
  }

  .preliminares-dark ::v-deep .radio-group .v-label {
    color: #d4d8dc !important;
  }

  .preliminares-dark ::v-deep .v-radio--is-active {
    background: #3c505b;
    border-color: #91b3c6;
  }

  .preliminares-dark ::v-deep .full-height-tab {
    scrollbar-color: #69747c transparent;
  }

</style>