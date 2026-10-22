<template>
  <v-container fluid :class="{ 'cdte-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="incidentes-toolbar">
<!-- Filtros de busqueda -->                
        <v-text-field
          v-model       = "search"
          :append-icon  = "search != oldSearch ? 'mdi-magnify-plus-outline' : 'mdi-magnify'"
          label         = "Buscar informe de incidentes en el listado"
          hint          = "Escriba su criterio de búsqueda y presione 'ENTER'"
          class         = "toolbar-search toolbar-control"
          @click:append = "lookFor"
          @change       = "lookFor"
          outlined
          dense
        />
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
          :dark        = "$vuetify.theme.dark"
          :headers     = "headers"
          :loading     = "isLoading"
          loading-text = "Cargando... por favor espere"
          :items       = "informes"
          disable-pagination
          hide-default-footer
        >
          <template v-slot:header.incidente.fechA_HECHO>
            <span class="multiline-header">Fecha y hora<br />hecho</span>
          </template>
          <template v-slot:header.incidente.fechA_TRAMITE>
            <span class="multiline-header">Fecha y hora<br />trámite final</span>
          </template>	        
          <template v-slot:item.incidente.fechA_HECHO = "{ item }">
            <div> {{ getFormatDateTime(item.incidente.fechA_HECHO).dateFormatted }}</div>
            <div> {{ getFormatDateTime(item.incidente.fechA_HECHO).timeFormatted }}</div>
          </template>
          <template v-slot:item.incidente.fechA_TRAMITE = "{ item }">
            <div> {{ getFormatDateTime(item.incidente.fechA_TRAMITE).dateFormatted }}</div>
            <div> {{ getFormatDateTime(item.incidente.fechA_TRAMITE).timeFormatted }}</div>
          </template> 
          <template v-slot:item.incidente.circunstanciA_HECHO = "{ item }">
            <div class="tabla-bloque"> {{ item.incidente.circunstanciA_HECHO }}</div>
          </template>
          <template v-slot:item.incidente.medidaS_DISCIPLINARIAS = "{ item }">
            <div class="tabla-bloque">{{ item.incidente.medidaS_DISCIPLINARIAS || '' }}</div>
          </template>
          <template v-slot:item.motivoDevolucionFin = "{ item }">
            <div class="tabla-bloque">{{ item.motivoDevolucionFin.motivO_DEVOLUCION || '' }}</div>
          </template>

<!--
    Acciones
        - Informe
        - Informe Preliminar
        - Editar 
        - Medidas disciplinarias        
        - Crear informe final
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
                    class     = "accion-btn accion-btn--disciplinary-measures"
                    icon 
                    v-on      = "on" 
                    @click    = "disciplinaryMeasures(item.incidente)"
                    :disabled = "item.incidente.estado === 2 ? true : false"
                  >
                    <v-icon>mdi-gavel</v-icon>
                  </v-btn>
                </template>
                <span>Medidas disciplinarias</span>
              </v-tooltip>
              <v-chip v-if = "item.incidente.estado === 1" 
                class       = "ma-2 accion-chip"
                :color      = "'#0b3c5d'"
                @click      = "returnIncident(item.incidente)"
                :outlined   = "true"
                title       ="Devolver"
              >
                {{ 'Devolver'}}
                <v-icon right>
                  {{ 'mdi-file-undo-outline' }}
                </v-icon>
              </v-chip>
              <v-chip v-if = "item.incidente.estado === 1 && item.incidente.medidaS_DISCIPLINARIAS"
                class       = "ma-2 accion-chip"
                :color      = "'#0b3c5d'"
                @click      = "createFinalReportItem(item.incidente)"
                :outlined   = "true"
                title       ="Crear informe final"
              >
                {{ 'Crear Informe Final'}}
                <v-icon right>
                  {{ 'mdi-file-check-outline' }}
                </v-icon>
              </v-chip>														
            </div>
          </template>   
<!--
    Mensaje cuando no hay data
-->                    
          <template v-slot:no-data>
            No se han encontrado incidentes registrados en el sistema
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
      <v-card :class="{ 'cdte-dialog--dark': $vuetify.theme.dark }">
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
  👉 disciplinaryMeasureDialog
      • Componente que permite ingresar las medidas disciplinarias del incidente seleccionado
  -->			
    <v-dialog
      v-model    = "disciplinaryMeasureDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
      class      = "dialog"
    >
      <v-card :class="{ 'cdte-dialog--dark': $vuetify.theme.dark }">
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
            @click    = "disciplinaryMeasuresItem"
            :disabled = "buttonClicked"
          >
            Guardar
          </v-btn>
        </v-card-actions>           
      </v-card>            
    </v-dialog>  
<!-- 
  👉	returnIncidentDialog
      • Componente que despliega un diálogo para ingresar el motivo de devolución del informe de incidente.
-->                        
      <v-dialog
      v-model    = "returnIncidentDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
      class      = "dialog"
    >
      <v-card :class="{ 'cdte-dialog--dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="text-h5 white--text">Ingresar Motivo de Devolución</span>
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
                      <p class="panel-title mb-1">Motivo de Devolución</p>
                      <p class="panel-subtitle mb-0">Ingrese el motivo de devolución con un formato claro y ordenado.</p>
                    </div>
                    <v-row class="panel-fields-row" dense> 
                      <v-col cols="12">
                        <v-textarea
                          class              = "final-resolution-textarea"
                          v-model            = "editedItem.motivO_DEVOLUCION"
                          label              = "Motivo de Devolución"
                          density            = "compact"
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
            </v-container>
          </v-form>
        </v-card-text>                
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color = "secondary"
            text
            outlined
            @click = "returnIncidentDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color     = "primary"
            @click    = "returnIncidentItem()"
            :disabled = "buttonClicked"
          >
            Guardar
          </v-btn>
        </v-card-actions>           
      </v-card>            
    </v-dialog>  

<!-- 
  👉	createFinalReportDialog
      •	Componente que despliega la vista previa del informe de incidentes antes de la creación del informe final (report-preview.vue))
      •	Se puede confirmar o cancelar la creación del informe de incidente final, mediante el despliegue del componente   
-->                        
    <v-dialog
      v-model    = "createFinalReportDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '60vw' : '90vw'"
    >
      <v-card :class="{ 'cdte-dialog--dark': $vuetify.theme.dark }">
        <v-card-text>
          <preview-report
            :item               = "editedItem"
            :titles             = "{ 
              title    : `Crear Informe Final del Incidente ${editedItem.id}`, 
              subtitle : `${editedItem.incidentE_ACCIDENTE ? 'Incidente' : 'Accidente'} - ${editedItem.personaL_UNIDAD === 'P' ? 'Personal' : 'Unidad'} ` 
              }"
            :tipoInforme		    = "'Incidente'"						
            @closePreviewReport = "closePreviewReport"
            @closeReportView    = "closePreviewReport"
          />
        </v-card-text>
        <v-card-actions class="px-6 py-4">
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            outlined
            class="mr-3"
            @click="createFinalReportDialog = false"
          >
            No, Cancelar
          </v-btn>
          <v-btn
            color="primary"
    
            @click="createFinalReportDialog = false; confirmCreateFinalReportDialog = true"
            :disabled="buttonClicked"
          >
            Si, Crear Informe Final
          </v-btn>
          
        </v-card-actions>
<!-- 
  👉 confirmCreateFinalReportDialog
      • Componente que despliega mensaje que confirma y cancela la creación del informe de incidente final
-->
        <v-dialog 
          v-model    = "confirmCreateFinalReportDialog"
          persistent
          :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
        >
          <v-card :class="{ 'cdte-dialog--dark': $vuetify.theme.dark }">
            <v-card-title class="primary">
              <span class="white--text">Crear Informe de Incidente Final</span>
              <v-spacer />
              <v-btn dark icon @click="confirmCreateFinalReportDialog = false">
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
                    Está a punto de crear el informe de incidente final; una vez creado quedará disponible para el S2 de la unidad. ¿Desea continuar?.
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color  = "secondary"
                outlined
                @click = "confirmCreateFinalReportDialog = false"
              >
                No, Cancelar
              </v-btn>
              <v-btn
                color  = "primary"
                @click = "createFinalReport"
              >
                Si, Crear Informe Final
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

  import previewReport from "@/components/reports/previewReport";
  import reportView		 from "@/components/reports/reportView";
  
  export default {
    name       : "incidentesCDTE",
    components : {
      previewReport ,
      reportView    ,
    },		
    data       : () => ({
      search                         : '', 
      oldSearch                      : '',
      page                           : 1,
      oldPage                        : 1,
      items                          : 5,				
      estado										     :'00',
      oldEstado                      :'00',			
      informesId                     : 0,
      disciplinaryMeasureDialog      : false,
      returnIncidentDialog           : false,
      confirmReturnIncidenteDialog   : false,
      createFinalReportDialog        : false,
      confirmCreateFinalReportDialog : false,
      reportViewDialog               : false,
      reportViewMode                 : 'Incidente',
      incidenteTitle                 : '',
      editedIndex                    : -1,			
      validForm                      : false,
      buttonClicked                  : false,			
      editedItem                     : {},
      defaultItem                    : {},
      headers                        : [
        { text: "Id"                      , value: "incidente.id"                             , groupable: false, sortable: false },
        { text: "Tipo incidente"          , value: "incidente.tipO_INCIDENTE.descripcion"     , groupable: false, sortable: false },
        { text: "Fecha y hora del hecho"  , value: "incidente.fechA_HECHO"                    , groupable: false, sortable: false },
        { text: "Fecha y hora publicación", value: "incidente.fechA_PUBLICACION"              , groupable: false, sortable: false },
        { text: "Circunstancias"          , value: "incidente.circunstanciA_HECHO"            , groupable: false, sortable: false, },
        { text: "Medidas disciplinarias"  , value: "incidente.medidaS_DISCIPLINARIAS"         , groupable: false, sortable: false },
        { text: "Motivo de devolución"    , value: "motivoDevolucionFin.motivO_DEVOLUCION", groupable: false, sortable: false },                  
        { text: "Acciones"                , value: "acciones"                             , groupable: false, sortable: false },  
      ],
      itemsPerPage                   : [ 5, 10, 25, 50 ],
/*	Validaciones */
      rules                          : {
        required      : [
          (v) => !!v || "Este campo es requerido",
        ],
        maxCharacters : [
          (v) => !v || v.length <= 2000 || "Máximo 2000 caracteres",
        ],
      }, 			         			
    }),
    computed   : {
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
    },
    watch      : {
/*
    - page												:	Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, 
                                    filtro de busqueda, estado, a través de la escucha de cambios en el valor de page, y controlando 
                                    la lógica para evitar realizar el getData si el valor de page no ha cambiado realmente, a través del valor oldPage
    - estado											:	Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, 
                                    filtro de busqueda y estado, a través de la escucha de cambios en el valor de estado, y controlando 
                                    la lógica para evitar realizar el getData si el valor de estado no ha cambiado realmente, a través del valor oldEstado
    - items												: Se encarga de realizar el get de datos para el listado de informes incidentes, con paginación, filtro de
                                    busqueda y estado, a través de la escucha de cambios en el valor de items, y estableciendo el valor de page.
*/	
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
      }                        
    }, 		
    methods    : {
/*	🚀 Methods			
    • 
*/			
/* Funciones relacionadas con la búsqueda, cambio de estado y personalización de la visualización de los ítems */
      async getData() {
        await this.getListInformesIncidentesCdte({
          page                : this.page,
          items               : this.items,
          search              : this.search,
          unidadId            : this.currentUser.Unidad,
          tipoEstadoIngresado : this.estado					
        })
      },
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
      closePreviewReport() {
        this.returnIncidentDialog    = false
        this.createFinalReportDialog = false
      },      
/* Complementos */
      async disciplinaryMeasures (item) {
        this.resetValidation();
        this.editedIndex               = this.informes.indexOf(item);
        this.editedItem                = Object.assign({}, item);
        this.disciplinaryMeasureDialog = true;
      },
      async returnIncident(item) {
        this.editedIndex          = item.id;	
        this.editedItem           = Object.assign({}, item);
        this.returnIncidentDialog = true;
      },    
      async createFinalReportItem(item) {
        this.editedIndex             = item.id;	
        this.editedItem              = Object.assign({}, item);
        this.createFinalReportDialog = true;
      },        
/* Transaccionales */      
      async disciplinaryMeasuresItem () {
        this.buttonClicked = true;
        try {
          const	resp = await this.putMedidasDisciplinariasInformesIncidentes({
              incidentesId           : this.editedItem.id,
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
            await this.closeDisciplinaryMeasureDialog()
            return
          
        } catch (error) {
          toastr.error("Ha ocurrido un error al guardar el informe", "Error!");
          this.buttonClicked = false
          await this.closeDisciplinaryMeasureDialog()          
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
      async returnIncidentItem() {
        this.buttonClicked = true
        await this.putDevolucionInformesIncidentes({
              incidentesId     : this.editedItem.id,
              preliminaresId   : this.editedItem.preliminaresid,
              motivoDevolucion : this.editedItem.motivoDevolucion,
              ...this.editedItem,
        })
        .then(async resp => {
          if (resp.status == 200) {
            toastr.success("Se ha tramitado correctamente el incidente", "Éxito!");
            this.buttonClicked = false
            this.page = 1
            await this.getData()
          } else {
            toastr.error("Ha ocurrido un error al tramitar el incidente", "Error!");
            this.buttonClicked = false
            return;
          }
        });
        this.returnIncidentDialog = false
      },
      async createFinalReport() {
        this.buttonClicked = true
        await this.putCreaInformeFinal({
              incidentesId   : this.editedItem.id,
              preliminaresId : this.editedItem.preliminaresid,
              ...this.editedItem,
        })
        .then(async resp => {
          if (resp.status == 200) {
            toastr.success("Se ha creado correctamente el informe final", "Éxito!");
            this.buttonClicked                  = false
            this.confirmCreateFinalReportDialog = false            
            this.page                           = 1
            await this.getData()
          } else {
            toastr.error("Ha ocurrido un error al crear el informe final", "Error!");
            this.buttonClicked                  = false
            this.confirmCreateFinalReportDialog = false            
            return;
          }
        });
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
      resetValidation(){
        if ( this.$refs.form ) this.$refs.form.resetValidation();
      },
      formatDate (date) {
        if (!date) return null
        const [year, month, day] = date.split('-')
        return `${day}/${month}/${year}`
      },
      getFormatDateTime(datetime) {
        if (!datetime) return null	
        const datetimeParts = datetime.split(/[ T]/)
        const [year, month, day] = datetimeParts[0].split('-')
        const time = datetimeParts[1]
        return { dateFormatted: `${day}/${month}/${year}`, time: time.slice(0,5) , timeFormatted: time.slice(0,5) }
      },
      ...mapActions("incidentesStore", [	"getListInformesIncidentesCdte"   , "putMedidasDisciplinariasInformesIncidentes", 
                                          "putDevolucionInformesIncidentes" , "putCreaInformeFinal" , ]),            
    }							
  }
</script>
<style scoped>
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
  /* Barra de herramientas */
  .incidentes-toolbar {
    padding: 10px 2px 12px;
    align-items: flex-start;
    gap: 10px;
    border-bottom: 1px solid #d8e4f0;
  }
  .incidentes-toolbar .toolbar-control {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  .incidentes-toolbar .toolbar-chips {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 40px;
  }

  .incidentes-toolbar ::v-deep .v-spacer {
    max-width: 10px;
    flex: 0 0 10px;
  }

  .incidentes-toolbar ::v-deep .toolbar-search {
    max-width: 430px;
    min-width: 330px;
  }

  .incidentes-toolbar ::v-deep .toolbar-items {
    max-width: 250px;
    min-width: 220px;
  }

  .incidentes-toolbar ::v-deep .toolbar-search .v-input__slot,
  .incidentes-toolbar ::v-deep .toolbar-items .v-input__slot {
    border-radius: 10px !important;
  }

  .incidentes-toolbar ::v-deep .toolbar-search.v-input--is-focused .v-input__slot,
  .incidentes-toolbar ::v-deep .toolbar-items.v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
  }

  .incidentes-toolbar ::v-deep .toolbar-search .v-label,
  .incidentes-toolbar ::v-deep .toolbar-items .v-label,
  .incidentes-toolbar ::v-deep .toolbar-search input,
  .incidentes-toolbar ::v-deep .toolbar-items input,
  .incidentes-toolbar ::v-deep .toolbar-items .v-select__selection {
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.015em;
  }

  .incidentes-toolbar ::v-deep .toolbar-search .v-input__append-inner .v-icon,
  .incidentes-toolbar ::v-deep .toolbar-items .v-input__append-inner .v-icon {
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

/* Row table display off */	
  ::v-deep .row-table-display-off {
    background-color: transparent !important;
  }

  ::v-deep .row-table-display-off td {
    color: #6d8093 !important;
  }
/* Row table display success */	
  ::v-deep .row-table-display-success {
    background-color: #f2faf4 !important;	
  }		
/* Row table display info */	
  ::v-deep .row-table-display-info {
    background-color: #f2f8ff !important;
  }
/* Multilinea para encabezados de tabla */
  .multiline-header {
    display: inline-block;
    white-space: normal;
    line-height: 1.25;
    text-align: center;
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

  .cdte-dark {
    min-height: 100%;
    color: #e6edf3;
    background: #111820;
  }

  .cdte-dark ::v-deep > .v-card {
    color: #e6edf3;
    background: #18232e;
  }

  .cdte-dark ::v-deep .incidentes-toolbar {
    border-bottom-color: #405364;
  }

  .cdte-dark ::v-deep .incidentes-toolbar .v-input__slot {
    background-color: #202d39;
  }

  .cdte-dark ::v-deep .incidentes-toolbar .v-label,
  .cdte-dark ::v-deep .incidentes-toolbar input,
  .cdte-dark ::v-deep .incidentes-toolbar .v-select__selection,
  .cdte-dark ::v-deep .incidentes-toolbar .v-icon {
    color: #c9d5df;
  }

  .cdte-dark ::v-deep .tabla,
  .cdte-dark ::v-deep .tabla .v-data-table__wrapper,
  .cdte-dark ::v-deep .tabla table {
    color: #e6edf3;
    background-color: #18232e !important;
    border-color: #405364 !important;
  }

  .cdte-dark ::v-deep .tabla thead tr,
  .cdte-dark ::v-deep .tabla thead th {
    color: #d6e0e8 !important;
    background: #263542 !important;
    border-color: #405364 !important;
  }

  .cdte-dark ::v-deep .tabla tbody tr,
  .cdte-dark ::v-deep .tabla tbody td {
    color: #e6edf3 !important;
    background-color: #18232e !important;
    border-color: #30404e !important;
  }

  .cdte-dark ::v-deep .tabla tbody tr:nth-child(even),
  .cdte-dark ::v-deep .tabla tbody tr:nth-child(even) > td {
    background-color: #202d39 !important;
  }

  .cdte-dark ::v-deep .tabla tbody tr:hover,
  .cdte-dark ::v-deep .tabla tbody tr:hover > td {
    background-color: #2a3947 !important;
  }

  .cdte-dark ::v-deep .row-table-display-success {
    background-color: #1d3025 !important;
  }

  .cdte-dark ::v-deep .row-table-display-info {
    background-color: #1e2d3a !important;
  }

  .cdte-dark ::v-deep .row-table-display-off td {
    color: #aebdca !important;
  }

  .cdte-dark ::v-deep .accion-btn {
    border-color: #51575c;
    background: linear-gradient(180deg, #34383b 0%, #292c2f 100%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .cdte-dark ::v-deep .accion-btn:hover {
    border-color: #89959e;
    background: #3b4247;
  }

  .cdte-dark ::v-deep .accion-btn--view .v-icon {
    color: #94c4ee;
  }

  .cdte-dark ::v-deep .accion-btn--disciplinary-measures .v-icon {
    color: #d5b491;
  }

  .cdte-dark ::v-deep .accion-btn.v-btn--disabled {
    border-color: #45494d;
  }

  .cdte-dark ::v-deep .accion-chip.v-chip--outlined {
    background: #292c2f !important;
    border-color: #7ba0b3;
    color: #a6c9dc !important;
  }

  .cdte-dark ::v-deep .accion-chip:not(.v-chip--outlined) {
    background: #42687b !important;
    border-color: #7ba0b3;
  }

  .cdte-dark ::v-deep .accion-chip:hover {
    background: #3b4247 !important;
  }

  .cdte-dialog--dark {
    color: #e6edf3;
    background: linear-gradient(180deg, #202d39 0%, #18232e 100%) !important;
  }

  .cdte-dialog--dark ::v-deep .v-card__text,
  .cdte-dialog--dark ::v-deep .v-card__actions {
    color: #e6edf3;
  }

  .cdte-dialog--dark ::v-deep .panel {
    background: linear-gradient(136deg, #263542 0%, #202d39 58%, #263542 100%);
    border-color: #405364;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
  }

  .cdte-dialog--dark ::v-deep .panel-title,
  .cdte-dialog--dark ::v-deep .panel .v-label,
  .cdte-dialog--dark ::v-deep .panel .v-counter {
    color: #c9d5df;
  }

  .cdte-dialog--dark ::v-deep .panel-subtitle {
    color: #aebdca;
  }

  .cdte-dialog--dark ::v-deep .panel .v-input__slot,
  .cdte-dialog--dark ::v-deep .final-resolution-textarea .v-input__slot {
    background-color: #18232e !important;
  }

  .cdte-dialog--dark ::v-deep .panel .v-input input,
  .cdte-dialog--dark ::v-deep .panel .v-input textarea,
  .cdte-dialog--dark ::v-deep .final-resolution-textarea .v-input input,
  .cdte-dialog--dark ::v-deep .final-resolution-textarea .v-input textarea {
    color: #e6edf3;
  }

  .cdte-dialog--dark ::v-deep .panel .v-text-field--outlined fieldset {
    border-color: #526576;
  }

  .cdte-dialog--dark ::v-deep .v-icon {
    color: #aebdca;
  }

  .cdte-dialog--dark ::v-deep .v-alert {
    background-color: #35252a;
    color: #f3dce0;
  }
</style>