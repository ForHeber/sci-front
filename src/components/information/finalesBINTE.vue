<template>
  <v-container fluid :class="{ 'finales-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="toolbar">
<!-- Filtros de busqueda -->                
        <v-text-field
          v-model       = "search"
          :append-icon  = "search != oldSearch ? 'mdi-magnify-plus-outline' : 'mdi-magnify'"
          label         = "Buscar informe final de incidentes de seguridaden el listado"
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
<!-- Despliegue de datos -->			
        <v-data-table
          class        = "tabla"
          :headers     = "headers"
          :loading     = "isLoading"
          loading-text = "Cargando... por favor espere"
          :items       = "informesFinales"
          :item-class  = "getItemClass"
          disable-pagination
          hide-default-footer
        >
        <template v-slot:header.final.fechA_HECHO>
          <span class="multiline-header">Fecha y hora<br />hecho</span>
        </template>
        <template v-slot:header.final.fechA_TRAMITE>
          <span class="multiline-header">Fecha y hora<br />trámite final</span>
        </template>						
        <template v-slot:item.final.fechA_HECHO = "{ item }">
          <div> {{ getFormatDateTime(item.final.fechA_HECHO).dateFormatted }}</div>
          <div> {{ getFormatDateTime(item.final.fechA_HECHO).timeFormatted }}</div>
        </template>
        <template v-slot:item.final.fechA_TRAMITE = "{ item }">
          <div> {{ getFormatDateTime(item.final.fechA_TRAMITE).dateFormatted }}</div>
          <div> {{ getFormatDateTime(item.final.fechA_TRAMITE).timeFormatted }}</div>
        </template>										
        <template v-slot:item.final.circunstanciA_HECHO = "{ item }">
          <div class="tabla-bloque"> {{ item.final.circunstanciA_HECHO }}</div>
        </template>
        <template v-slot:item.final.medidaS_DISCIPLINARIAS = "{ item }">
          <div class="tabla-bloque">
            {{ item.final.medidaS_DISCIPLINARIAS || '' }}
          </div>
        </template>
        <template v-slot:item.final.estado = "{ item }">
          <div>
            <v-chip 
              class  =	"custom-chip my-2"
              pill
              :color =	"customChipColor(item.final)"
            >
              {{customChipText(item.final)}}
            </v-chip>
          </div>
        </template>								
<!--
    Acciones
        - Informe
        - Informe Preliminar
        - Informe Final
        - Procedimientos policiales
        - Antecedentes judiciales
        - Involucrados
        - Archivos
        - Ampliación de informe
        - Medidas disciplinarias
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
                  @click    = "preliminaryReportView(item.final)"
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
                  @click    = "incidentReportView(item.final)"
                >
                  <v-icon>mdi-file-document-outline</v-icon>
                </v-btn>
              </template>
              <span>Ver informe Incidente</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn 
                  class     = "accion-btn accion-btn--view"
                  icon 
                  v-on      = "on" 
                  @click    = "finalReportView(item.final)"
                >
                  <v-icon>mdi-file-document-edit-outline</v-icon>
                </v-btn>
              </template>
              <span>Ver informe Final</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn 
                  class     = "accion-btn accion-btn--police"
                  icon 
                  v-on      = "on" 
                  @click    = "policeProcedures(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"	
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
                  @click    = "judicialRecords(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"										
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
                  @click  = "involved(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"									
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
                  @click = "reportFolders(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"	
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
                  @click = "supplementaryReport(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"
                >
                  <v-icon>mdi-folder-plus-outline</v-icon>
                </v-btn>
              </template>
              <span>Ampliación de Informe</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn 
                  class     = "accion-btn accion-btn--disciplinary-measures"
                  icon 
                  v-on      = "on" 
                  @click    = "disciplinaryMeasures(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"	
                >
                  <v-icon>mdi-gavel</v-icon>
                </v-btn>
              </template>
              <span>Medidas disciplinarias</span>
            </v-tooltip>												
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn 
                  class     = "accion-btn accion-btn--edit"
                  icon 
                  v-on      = "on" 
                  @click    = "editItem(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"	
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
                  @click = "confirmDeleteItem(item.final)"
                  :disabled = "item.final.estado !== 2 ? true : false"
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
          No se han encontrado informes finales de incidentes de seguridad registrados en el sistema
        </template>
      </v-data-table>
<!--	Paginación -->
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
    </v-card>	
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
            :tipoInforme = "'Final'"
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
              :tipoInforme = "'Final'"
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
              :tipoInforme = "'Final'"
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
            <span class="text-h8 white--text">{{ incidenteTitle }}</span>
          </v-card-subtitle>                                    
          <v-card-text>
            <Archivos-Informe v-if="reportFoldersDialog" 
              :informesId  = "informesId"
              :tipoInforme = "'Final'"
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
              :tipoInforme = "'Final'"
            />
          </v-card-text> 
        </v-card>
      </v-dialog>		      
  <!--
  👉 disciplinaryMeasureDialog
      • Componente que permite ingresar las medidas disciplinarias del incidente seleccionado
  -->			
      <v-dialog
        v-model    = "disciplinaryMeasureDialog"
        :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
        class      = "dialog"
      >
        <v-card :class="{ 'finales-dark': $vuetify.theme.dark }">
          <v-card-title class="primary">
            <span class="text-h5 white--text">Ingresar Medidas Disciplinarias</span>
            <v-spacer />
          </v-card-title>            
          <v-card-subtitle class="primary">
            <span class="text-h8 white--text">{{  `Id: ${this.editedItem.id}` }}</span>
          </v-card-subtitle>
          <v-card-text>
            <v-form v-model = "validForm" ref="form">                    
              <v-container class="mt-2">
                <v-row class="mt-4" dense>
                  <v-col cols="12">
                    <div class="panel">
                      <div class="panel-head">
                        <p class="panel-title mb-1">Medidas Disciplinarias</p>
                        <p class="panel-subtitle mb-0">Ingrese las medidas disciplinarias con un formato claro y ordenado.</p>
                      </div>
                      <v-row class="panel-fields-row" dense> 
                        <v-col cols="12">
                          <v-textarea
                            class              = "final-resolution-textarea"
                            v-model            = "editedItem.medidaS_DISCIPLINARIAS"
                            label              = "Medidas Disciplinarias del Comandante de la Unidad"
                            density            = "compact"
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
              </v-container>
            </v-form>
          </v-card-text>                
          <v-card-actions>
            <v-spacer></v-spacer>
              <v-btn
                color = "secondary"
                text
                outlined
                @click = "disciplinaryMeasureDialog = false"
              >
                Cancelar
              </v-btn>
              <v-btn
                color     = "primary"
                @click    = "saveDisciplinaryMeasures"
                :disabled = "buttonClicked"
              >
                Guardar
              </v-btn>
            </v-card-actions>           
          </v-card>            
        </v-dialog> 
<!--
  👉 finalDialog
      • Componente que despliega formulario para actualizar los antecedentes del incidente final seleccionado 
-->                         
        <v-dialog
          v-model    = "finalDialog"
          :max-width = "$vuetify.breakpoint.mdAndUp ? '70vw' : '110vw'"
          class      = "dialog"
        >
          <v-card :class="{ 'finales-dark': $vuetify.theme.dark }">
            <v-card-title class="primary">
              <span class="text-h5 white--text">{{ formTitle.title }}</span>
            </v-card-title> 
            <v-card-subtitle class="primary">
              <span class="text-h8 white--text">{{ formTitle.subtitle }}</span>
            </v-card-subtitle>	
            <v-tabs
              v-model          = "tabsEdit"
              class            = "tabsEdit"
              background-color = "transparent"
              grow
            >
              <v-tab class="tabEdit">
                <v-icon left small>mdi-account-badge-outline</v-icon>
                Informante
              </v-tab>
              <v-tab class="tabEdit">
                <v-icon left small>mdi-file-document-edit-outline</v-icon>
                Hechos
              </v-tab>
              <v-tab class="tabEdit">
                <v-icon left small>mdi-file-document-plus-outline</v-icon>
                Adicionales 
              </v-tab>
              <v-tab class="tabEdit">
                <v-icon left small>mdi-pistol</v-icon>
                Armamento
              </v-tab>
              <v-tab class="tabEdit">
                <v-icon left small>mdi-incognito	</v-icon>
                Investigación
              </v-tab>
            </v-tabs>
            <v-card-text>
              <v-form v-model = "validForm" ref="form">
                <v-container>                        
                  <v-tabs-items v-model="tabsEdit" class="full-height-tabEdit">
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
                            <div class="other-panel">
                              <div class="other-panel-head">
                                <p class="other-panel-title mb-1">Antecedentes de los hechos</p>
                                <p class="other-panel-subtitle mb-0">Complete la información principal del incidente o accidente con un formato claro y ordenado.</p>
                              </div>
                              <v-row class="other-fields-row" dense>
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
                            <div class="other-panel">
                              <div class="other-panel-head">
                                <p class="other-panel-title mb-1">Datos adicionales</p>
                                <p class="other-panel-subtitle mb-0">Ampliación de la información solicitada, ingrese con un formato claro y ordenado.</p>
                              </div>
                              <v-row class="other-fields-row" dense>
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
                            <div class="other-panel">
                              <div class="other-panel-head">
                                <p class="other-panel-title mb-1">Antecedentes relacionados al Armamento</p>
                                <p class="other-panel-subtitle mb-0">Complete los antecedentes solicitados con un formato claro y ordenado.</p>
                              </div>
                              <v-row class="other-fields-row" dense>
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
                            <div class="other-panel">
                              <div class="other-panel-head">
                                <p class="other-panel-title mb-1">Investigación de los hechos</p>
                                <p class="other-panel-subtitle mb-0">Complete los antecedentes solicitados con un formato claro y ordenado.</p>
                              </div>
                              <v-row class="other-fields-row" dense>
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
                @click = "closeFinalDialog"
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
                    Está a punto de eliminar el preliminar {{`Id: ${editedItem.id} (  ${editedItem.tipO_INCIDENTE ? editedItem.tipO_INCIDENTE.descripcion : ''} )`}}, ¿desea continuar?.
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
            :item            = "editedItem"
            :icon            = "reportViewIcon"
            :titles          = "reportViewTitles"
            :tipoInforme	   = "reportViewType"
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


  const createDefaultItem = () => ({
    estado                 : null,
    id                     : null,
    incidentes             : {
      tipO_INCIDENTE : {
        descripcion  : ''
      },
    },
    incidentesid           : null,
    medidaS_DISCIPLINARIAS : '',
  })

  export default {
    name       : "finalesS2",        
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
    data() {
      const defaultItem = createDefaultItem()
      return {
        tabs                      : null,
        tabsEdit                  : null,
        search                    : '',
        oldSearch                 : '',
        selectedUnidad            : '0',                 
        page                      : 1,
        oldPage                   : 1,
        items                     : 5,
        estado                    : '00',
        oldEstado                 : '00',
        informesId                : 0,
        policeProceduresDialog    : false,
        judicialRecordsDialog     : false,
        involvedDialog            : false,			
        reportFoldersDialog		    : false,
        supplementaryReportDialog : false,		
        disciplinaryMeasureDialog : false,        
        finalDialog               : false,
        personaDialog             : false,
        confirmDeleteDialog       : false,
        reportViewDialog          : false,
        reportViewMode            : 'Final',        
        incidenteTitle            : '',			
        buttonClicked             : false,
        defaultItem               : defaultItem,
        editedItem                : createDefaultItem(),
        validForm                 : false,
        itemsUnidadesFilter  	    : [ { codigo: '0', sigla: 'Todas las unidades' } ],        
        itemsPerPage              : [ 5, 10, 25, 50 ],
        itemsChip                 : [
          { text: 'Todos                  ', value: '00', color: ''  },						
          { text: 'En Proceso por S2      ', value: '01', color: 'success'   },
          { text: 'Tramitado al Cdte.     ', value: '02', color: 'info'      },
          { text: 'Devuelto por Cdte.     ', value: '03', color: 'primary'   },
          { text: 'Cerrado Temporalmente  ', value: '04', color: '#9e9e9e'   },
          { text: 'Cerrado definitivamente', value: '05', color: 'secondary' }
        ],	
        headers                  : [
          { text: "Id"                        , value: "final.id"                                   , groupable: false, sortable: false },
          { text: "Tipo incidente"            , value: "final.incidentes.tipO_INCIDENTE.descripcion", groupable: false, sortable: false },
          { text: "Fecha y hora hecho"        , value: "final.fechA_HECHO"                          , groupable: false, sortable: false },
          { text: "Fecha y hora tramite final", value: "final.fechA_TRAMITE"                        , groupable: false, sortable: false },
          { text: "Circunstancias"            , value: "final.circunstanciA_HECHO"                  , groupable: false, sortable: false },
          { text: "Medidas disciplinarias"    , value: "final.medidaS_DISCIPLINARIAS"               , groupable: false, sortable: false },
          { text: "Motivo de devolución"      , value: "motivoDevolucionFin.motivO_DEVOLUCION"      , groupable: false, sortable: false },
          { text: "Estado"                    , value: "final.estado"                               , groupable: false, sortable: false },
          { text: "Unidad responsable"        , value: "final.u_AFECTADA.sigla"                     , groupable: false, sortable: false },          
          { text: "Acciones"                  , value: "acciones"                                   , groupable: false, sortable: false },  
        ],        
        itemsUnidades            : [],
        itemsTipoIngestas        : [],
        itemsTipoIncidentes      : [],	
        itemsTipoIdentificacion	 : [],
        itemsTipoArmamento       : [],
        itemsTipoInvestigacion   : [],
        itemsPoliceProcedure     : [],
        itemsJudicialRecord      : [], 
        itemsInvolved            : [],

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
      }
    },
    computed   : {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Final' : 'Editar Final'
      },			
      reportViewType() {
        return this.reportViewMode === 'Preliminar' ? 'Preliminar' : this.reportViewMode === 'Incidente' ? 'Incidente' : 'Final';
      },
      reportViewIcon() {
        return this.reportViewMode === 'Preliminar' ? 'mdi-file-powerpoint-outline' : this.reportViewMode === 'Incidente' ? 'mdi-file-document-outline' : 'mdi-file-document-edit-outline';
      },
      reportViewTitles() {
        const isIncidente  = this.editedItem && this.editedItem.incidentE_ACCIDENTE === 'I';
        const accidentType = isIncidente ? 'Incidente' : 'Accidente';
        const scopeType    = this.editedItem && this.editedItem.personaL_UNIDAD === 'P' ? 'Personal' : 'Unidad';
        const reportLabel  = this.reportViewMode === 'Preliminar' ? 'Informe Preliminar' : this.reportViewMode === 'Incidente' ? 'Informe Incidente' : 'Informe Final';
        return {
          title    : `${reportLabel} ${ this.editedItem.finalId ? ' del id ' + this.editedItem.finalId : this.editedItem.id }`.trim(),
          subtitle : `${accidentType} - ${scopeType}`,
        };
      },			
      ...mapGetters("finalesStore", [ 'informesFinales', 'informesTemporales', 'informesCerrados', 'pages', 'isLoading' ]),
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
        await this.getListInformesFinalesBINTE({
          page                : this.page,
          items               : this.items,
          search              : this.search,
          unidadId            : this.selectedUnidad, 
          tipoEstadoIngresado : this.estado
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
        this.page   = 1;

      },
      getItemClass(item) {
				const final = item.final || item
				return	  final.estado === 2 && final.devuelto === 'N' ? 'row-table-display-success' : 
								( final.estado === 2 && final.devuelto === 'S' ? 'row-table-display-primary' : 
                ( final.estado === 1 ? 'row-table-display-info' : 
                  final.estado === 4 ? 'row-table-display-temporary' : 'row-table-display-secondary'))
			},  
			customChipColor(item) {
				return    item.estado === 2 && item.devuelto === 'N' ? 'success' : 
								( item.estado === 2 && item.devuelto === 'S' ? 'primary'   :
                ( item.estado === 1 ? 'info' : 
                  item.estado === 4 ? '#9e9e9e' : 'secondary'))
			},
			customChipText(item) {
				return    item.estado === 2 && item.devuelto === 'N' ? 'En proceso por S2' : 
								( item.estado === 2 && item.devuelto === 'S' ? 'Devuelto por Cdte.'   :
								( item.estado === 1 ? 'Tramitado al Cdte.' : 
                  item.estado === 4 ? 'Cerrado temporalmente' : 'Cerrado definitivamente'))
			},
/* Vista de informes */
      preliminaryReportView(item) {
        this.reportViewMode     = 'Preliminar';
        const informePreliminar = item && item.incidentes.preliminares ? item.incidentes.preliminares : {};
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
          finalId             : item.id,
        };
        this.reportViewDialog   = true
      },
      incidentReportView(item) {
        this.reportViewMode     = 'Incidente';
        this.editedItem         = this.buildIncidentReportItem(item);
        this.editedItem.finalId = item.id;
        this.reportViewDialog   = true
      },
      finalReportView(item) {
        this.reportViewMode     = 'Final';
        this.editedItem         = item;
        this.reportViewDialog   = true
      },
      getIncidentId(item) {
        if (!item) return null
        return item.incidentesid || item.incidentesId || item.incidenteS_ID || item.id || null
      },
      buildIncidentReportItem(item) {
        const incidente  = Object.assign({}, item && item.incidentes ? item.incidentes : {})
        const incidentId = this.getIncidentId(item)
        if (!incidente.id && incidentId) {
          incidente.id = incidentId
        }
        return incidente
      },
      closeReportViewDialog() {
        this.reportViewDialog      = false
      },
      closeReportView() {
        this.reportViewDialog = false
      },      
/* Complementos */      
      policeProcedures ( item ) {
        this.incidenteTitle         = `Id: ${item.id} (  ${this.getIncidentTypeDescription(item)} )`
        this.informesId             = item.id
        this.policeProceduresDialog = true
      },
      judicialRecords ( item ) {
        this.incidenteTitle        = `Id: ${item.id} (  ${this.getIncidentTypeDescription(item)} )`
        this.informesId            = item.id                            
        this.judicialRecordsDialog = true
      },
      involved ( item ) {
        this.incidenteTitle  = `Id: ${item.id} (  ${this.getIncidentTypeDescription(item)} )`
        this.informesId      = item.id
        this.involvedDialog  = true
      },
      async reportFolders(item) {
        this.incidenteTitle       = `Id: ${item.id} - ${this.getIncidentTypeDescription(item)}`
        this.informesId           = item.id
        this.reportFoldersDialog  = true
      },	
      async supplementaryReport(item) {
        this.incidenteTitle             = `Id: ${item.id} - ${this.getIncidentTypeDescription(item)}`
        this.informesId                 = item.id
        this.supplementaryReportDialog  = true
      },
      async disciplinaryMeasures (item) {
        this.resetValidation();
        this.editedIndex               = this.informesFinales.indexOf(item);
        this.editedItem                = Object.assign({}, item);
        this.disciplinaryMeasureDialog = true;
      },
      async editItem (item) {
        this.resetValidation();
        this.editedIndex                  = this.informesFinales.indexOf(item);
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
        this.tabsEdit                     = this.tabInformante
        this.finalDialog                  = true;
      },
      confirmDeleteItem(item) {
        this.editedIndex         = item.id;
        this.editedItem          = Object.assign({}, item);
        this.confirmDeleteDialog = true;
      },
      getIncidentTypeDescription(item) {
        if (!item || !item.incidentes || !item.incidentes.tipO_INCIDENTE) {
          return ''
        }
        return item.incidentes.tipO_INCIDENTE.descripcion || ''
      },
/* Transaccionales */
      async saveDisciplinaryMeasures () {
        this.buttonClicked = true;
        try {
          const	resp = await this.putMedidasDisciplinariasInformesFinales({
              finalesId              : this.editedItem.id,            
              incidentesId           : this.editedItem.incidentesid,
              preliminaresId         : this.editedItem.preliminaresid,
              medidaS_DISCIPLINARIAS : this.editedItem.medidaS_DISCIPLINARIAS,
            })
            if (resp.status == 200) {
              toastr.success("Se ha actualizado la información correctamente", "Éxito!");
              this.page = 1
              await this.getData()
              await this.closeDisciplinaryMeasureDialog()
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
      async closeDisciplinaryMeasureDialog() {
        this.disciplinaryMeasureDialog    = false
        this.editedItem                   = Object.assign({}, this.defaultItem);
        this.editedIndex                  = -1;
        this.resetValidation() 
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },
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
					const	resp = await this.putInformesFinales({
							finalesId                     : this.editedItem.id,
							incidentesId                  : this.editedItem.incidentesid,
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
							await this.closeFinalDialog()
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
      async closeFinalDialog() {
        this.finalDialog                  = false
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
      ...mapActions("finalesStore",	[	"getListInformesFinalesBINTE", "putMedidasDisciplinariasInformesFinales",  
                                      "putInformesFinales"     ]),
      ...mapActions("tipoIngestaStore"       , [ "getListTipoIngesta"         ]),
      ...mapActions("tipoIncidenteStore"     , [	"getListTipoIncidente"      ]),
      ...mapActions("unidadesStore"          , [	"getListUnidades"           ]), 
      ...mapActions("tipoIdentificacionStore", [	"getListTipoIdentificacion" ]),
      ...mapActions("tipoArmamentoStore"     , [	"getListTipoArmamento"      ]),
      ...mapActions("tipoInvestigacionStore" , [	"getListTipoInvestigacion"  ]),																						
    }  
  };

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
  .toolbar ::v-deep .toolbar-items .v-input__slot ,
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
  

	.tabla-acciones ::v-deep .accion-btn--view .v-icon                  { color: #2563a6; }
	.tabla-acciones ::v-deep .accion-btn--police .v-icon                { color: #176b87; }
	.tabla-acciones ::v-deep .accion-btn--judicial .v-icon              { color: #6b5b18; }
	.tabla-acciones ::v-deep .accion-btn--involved .v-icon              { color: #24745f; }
	.tabla-acciones ::v-deep .accion-btn--edit .v-icon                  { color: #708238; }
	.tabla-acciones ::v-deep .accion-btn--delete .v-icon                { color: #b33a3a; }
	.tabla-acciones ::v-deep .accion-btn--files .v-icon                 { color: #4c6280; }
	.tabla-acciones ::v-deep .accion-btn--files-plus .v-icon            { color: #287f9b; }
  .tabla-acciones ::v-deep .accion-btn--disciplinary-measures .v-icon { color: #7a5230; }

	.tabla-acciones ::v-deep .accion-btn--view:hover                  { border-color: #8ab4db; background: #edf5fc; }
	.tabla-acciones ::v-deep .accion-btn--police:hover                { border-color: #82c1d2; background: #eaf7fa; }
	.tabla-acciones ::v-deep .accion-btn--judicial:hover              { border-color: #d1bd65; background: #fbf7e6; }
	.tabla-acciones ::v-deep .accion-btn--involved:hover              { border-color: #8bc7b4; background: #eaf7f1; }
	.tabla-acciones ::v-deep .accion-btn--edit:hover                  { border-color: #aab56b; background: #f4f6e8; }
	.tabla-acciones ::v-deep .accion-btn--delete:hover                { border-color: #dc9898; background: #fff0f0; }
	.tabla-acciones ::v-deep .accion-btn--files:hover                 { border-color: #a6bbd2; background: #f2f7fc; }
	.tabla-acciones ::v-deep .accion-btn--files-plus:hover            { border-color: #8cc9d6; background: #eaf8fb; }
  .tabla-acciones ::v-deep .accion-btn--disciplinary-measures:hover { border-color: #b08d68; background: #f5ede2; }

  
/* color de fondo de las filas según estado */
  
  ::v-deep .row-table-display-info {
    background-color: #f8fcff !important;
  }
  ::v-deep .row-table-display-success {
    background-color: #f7fcf8 !important;
  }
  ::v-deep .row-table-display-primary {
    background-color: #fffafa !important;
  }
  ::v-deep .row-table-display-temporary {
    background-color: #fdfdfd !important;
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

  ::v-deep .final-resolution-textarea .v-input__slot {
    background-color: #ffffff !important;
    border-radius: 10px !important;
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }

  ::v-deep .final-resolution-textarea .v-label {
    color: #254f70 !important;
    font-weight: 400;
  }

  ::v-deep .final-resolution-textarea .v-input__prepend-inner .v-icon {
    color: #0b3c5d !important;
  }

  ::v-deep .final-resolution-textarea.v-input--is-focused .v-input__slot {
    border-color: #0b3c5d !important;
    box-shadow: 0 0 0 2px rgba(11, 60, 93, 0.14);
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
/** */
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

	.dialog ::v-deep .tabEdit {
    flex: 1 1 0 !important;
		font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
		font-size: 0.95rem;
		font-weight: 500;
		letter-spacing: 0.025em;
		text-transform: none;
		border-radius: 999px;
		margin: 0 6px 8px;
    min-width: 0;
    max-width: none;
		height: 40px;
		padding: 0 18px;
    justify-content: center;
		color: #314a61;
		background: linear-gradient(180deg, #ffffff 0%, #f3f6fa 100%);
		border: 1px solid #d5e0eb;
		transition: all 0.22s ease;
	}

	.dialog ::v-deep .tabsEdit {
		background: linear-gradient(135deg, #f5f9fd 0%, #edf4fb 55%, #f7fbff 100%);
		padding: 12px 12px 2px;
		border-bottom: 1px solid var(--dialog-border);
	}

	.dialog ::v-deep .tabEdit::before {
		opacity: 0;
	}

	.dialog ::v-deep .tabEdit:hover {
		transform: translateY(-1px);
		background: linear-gradient(180deg, #ffffff 0%, #eaf2fb 100%);
		color: var(--dialog-primary);
		box-shadow: 0 6px 16px rgba(11, 60, 93, 0.12);
	}

	.dialog ::v-deep .tabEdit.v-tab--active {
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

	.other-panel {
		padding: 15px;
		border-radius: 16px;
		background: linear-gradient(136deg, #f9fcff 0%, #eef4fb 58%, #f8fcff 100%);
		border: 1px solid #d5e1ed;
		box-shadow: 0 12px 26px rgba(23, 53, 82, 0.08);
	}

	.other-panel-head {
		padding: 0 2px 8px;
		margin-bottom: 8px;
		border-bottom: 1px solid rgba(130, 152, 176, 0.22);
	}

	.other-panel-title {
		font-size: 0.98rem;
		font-weight: 600;
		letter-spacing: 0.028em;
		color: #253f57;
	}

	.other-panel-subtitle {
		font-size: 0.8rem;
		line-height: 1.35;
		color: #60758b;
	}

	.other-fields-row {
		margin: 0;
	}

	.other-panel ::v-deep .v-input__slot {
		border-radius: 11px !important;
		background-color: rgba(255, 255, 255, 0.94);
	}

	.other-panel ::v-deep .v-input--is-focused .v-input__slot {
		box-shadow: 0 0 0 3px rgba(11, 60, 93, 0.1);
	}

	.other-panel ::v-deep .v-text-field--outlined fieldset {
		border-color: #bdccdb;
	}

	.other-panel ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
		border-color: #0b3c5d;
	}

	.other-panel ::v-deep .v-label {
		color: #29425b;
		letter-spacing: 0.012em;
		font-weight: 400;
	}

	.other-panel ::v-deep .v-counter {
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

  .v-tabs-items.full-height-tabEdit  {
    height: calc( 90vh - 292px );
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #9cb3c9 transparent;
  }

  .finales-dark {
    --dialog-primary: #345466;
    --dialog-primary-soft: #42687b;
    --dialog-border: #45494d;
  }

  .finales-dark ::v-deep .toolbar {
    border-bottom-color: #45494d;
  }

  .finales-dark ::v-deep .toolbar-control.v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  .finales-dark ::v-deep .tabla {
    background-color: #202224;
    border-color: #45494d;
  }

  .finales-dark ::v-deep .tabla thead tr {
    background: #2b2f32;
  }

  .finales-dark ::v-deep .tabla th {
    color: #dce4e9;
  }

  .finales-dark ::v-deep .tabla tbody td {
    color: #d4d8dc;
  }

  .finales-dark ::v-deep .tabla tbody tr:nth-child(even) {
    background-color: #252729;
  }

  .finales-dark ::v-deep .row-table-display-info {
    background-color: #242c31 !important;
  }

  .finales-dark ::v-deep .row-table-display-success {
    background-color: #252e27 !important;
  }

  .finales-dark ::v-deep .row-table-display-primary {
    background-color: #312728 !important;
  }

  .finales-dark ::v-deep .row-table-display-temporary {
    background-color: #28292a !important;
  }

  .finales-dark ::v-deep .row-table-display-secondary {
    background-color: #242526 !important;
  }

  .finales-dark ::v-deep .tabla tbody tr:hover {
    background-color: #363b3f !important;
  }

  .finales-dark ::v-deep .accion-btn {
    border-color: #51575c;
    background: linear-gradient(180deg, #34383b 0%, #292c2f 100%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .finales-dark ::v-deep .accion-btn:hover {
    border-color: #89959e;
    background: #3b4247;
  }

  .finales-dark ::v-deep .accion-btn--view .v-icon { color: #94c4ee; }
  .finales-dark ::v-deep .accion-btn--police .v-icon { color: #86c8d9; }
  .finales-dark ::v-deep .accion-btn--judicial .v-icon { color: #d8c77e; }
  .finales-dark ::v-deep .accion-btn--involved .v-icon { color: #92d3bb; }
  .finales-dark ::v-deep .accion-btn--edit .v-icon { color: #becd87; }
  .finales-dark ::v-deep .accion-btn--delete .v-icon { color: #ee9d9d; }
  .finales-dark ::v-deep .accion-btn--files .v-icon { color: #b1c6df; }
  .finales-dark ::v-deep .accion-btn--files-plus .v-icon { color: #89cddc; }
  .finales-dark ::v-deep .accion-btn--disciplinary-measures .v-icon { color: #d9b491; }

  .finales-dark ::v-deep .accion-btn.v-btn--disabled {
    border-color: #45494d;
  }

  .finales-dark ::v-deep .custom-chip--toolbar {
    border-color: #60676c;
  }

  .finales-dark ::v-deep .custom-chip--toolbar-active {
    border-color: #d3d8dc;
    box-shadow: 0 0 0 2px rgba(220, 228, 233, 0.28), 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .finales-dark ::v-deep .custom-chip--toolbar.custom-chip--toolbar-all {
    background-color: #292c2f !important;
    border-color: #899096;
    color: #d4d8dc !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .finales-dark ::v-deep .custom-chip--toolbar.custom-chip--toolbar-all:hover {
    border-color: #b9c0c6;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  }

  .finales-dark ::v-deep .custom-chip--toolbar.custom-chip--toolbar-all.custom-chip--toolbar-active {
    border-color: #e1e5e8;
    color: #ffffff !important;
    box-shadow: 0 0 0 3px rgba(225, 229, 232, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .v-card.finales-dark {
    background: #242628 !important;
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.4) !important;
  }

  .finales-dark ::v-deep .tabsEdit {
    background: #292c2f;
  }

  .finales-dark ::v-deep .tabEdit {
    background: #34383b;
    border-color: #51575c;
    color: #d4d8dc;
  }

  .finales-dark ::v-deep .tabEdit:hover {
    background: #3d4348;
    color: #ffffff;
  }

  .finales-dark ::v-deep .tabEdit.v-tab--active {
    background: #42687b;
    border-color: #7ba0b3;
    color: #ffffff !important;
  }

  .finales-dark ::v-deep .panel,
  .finales-dark ::v-deep .informante-panel,
  .finales-dark ::v-deep .other-panel,
  .finales-dark ::v-deep .informante-card {
    background: #2b2e30 !important;
    border-color: #45494d !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .finales-dark ::v-deep .panel-title,
  .finales-dark ::v-deep .informante-panel-title,
  .finales-dark ::v-deep .other-panel-title,
  .finales-dark ::v-deep .informante-value {
    color: #e1e5e8;
  }

  .finales-dark ::v-deep .panel-subtitle,
  .finales-dark ::v-deep .informante-panel-subtitle,
  .finales-dark ::v-deep .other-panel-subtitle,
  .finales-dark ::v-deep .informante-label,
  .finales-dark ::v-deep .v-counter {
    color: #aeb8c0;
  }

  .finales-dark ::v-deep .v-input__slot {
    background-color: #242628 !important;
  }

  .finales-dark ::v-deep .v-label {
    color: #c8d0d6 !important;
  }

  .finales-dark ::v-deep .v-text-field--outlined fieldset {
    border-color: #69747c;
  }

  .finales-dark ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #a6c9dc;
  }

  .finales-dark ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(166, 201, 220, 0.15);
  }

  .finales-dark ::v-deep .v-input .v-icon,
  .finales-dark ::v-deep .tabEdit .v-icon {
    color: #bacbd6 !important;
  }

  .finales-dark ::v-deep .informante-line,
  .finales-dark ::v-deep .radio-group,
  .finales-dark ::v-deep .radio {
    background: #34383b;
    border-color: #51575c;
  }

  .finales-dark ::v-deep .v-radio--is-active {
    background: #3c505b;
    border-color: #91b3c6;
  }

  .finales-dark ::v-deep .full-height-tabEdit {
    background: #242628;
    scrollbar-color: #69747c transparent;
  }

</style>
