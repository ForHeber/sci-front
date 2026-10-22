<template>
  <v-container fluid :class="{ 'cdte-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="finales-toolbar">
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
<!-- Despliegue de datos -->			
        <v-data-table
          class        = "tabla"
          :dark        = "$vuetify.theme.dark"
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
            <div class="tabla-bloque">{{ item.final.medidaS_DISCIPLINARIAS || '' }}</div>
          </template>
          <template v-slot:item.motivoDevolucionFin = "{ item }">
            <div class="tabla-bloque">{{ item.motivoDevolucionFin.motivO_DEVOLUCION || '' }}</div>
          </template>          
<!--
    Acciones
        - Informe
        - Informe Preliminar
        - Informe Final
        - Medidas disciplinarias
        - Devolver
        - Cerrar informe
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
                    class     = "accion-btn accion-btn--disciplinary-measures"
                    icon 
                    v-on      = "on" 
                    @click    = "disciplinaryMeasures(item.final)"
                    :disabled = "item.final.estado === 2 ? true : false"
                  >
                    <v-icon>mdi-gavel</v-icon>
                  </v-btn>
                </template>
                <span>Medidas disciplinarias</span>
              </v-tooltip>
            <v-chip  v-if="item.final.estado !== 2"
              class      = "ma-2 accion-chip"
              color      = "#0b3c5d"
              @click     = "returnFinal(item.final)"
              outlined
              title      = "Devolver para corrección"
            >
              Devolver a S2
              <v-icon right>mdi-file-document-refresh-outline</v-icon>
            </v-chip>

          <v-chip v-if="item.final.estado !== 2"
            class      = "ma-2 accion-chip"
            color      = "#0b3c5d"
            @click     = "closeFinal(item.final)"
            outlined
            title      = "Cerrar Informe Final"
            >
            Cerrar
            <v-icon right>mdi-file-sign</v-icon>
          </v-chip>         
            </div>
          </template>   
<!-- Mensaje cuando no hay data -->                    
          <template v-slot:no-data>
            No se han encontrado informes de incidentes registrados en el sistema
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
            @click    = "disciplinaryMeasuresItem()"
            :disabled = "buttonClicked"
          >
            Guardar
          </v-btn>
        </v-card-actions>           
      </v-card>            
    </v-dialog>      	
<!-- 
  👉	returnFinalDialog
      • Componente que despliega un diálogo para ingresar el motivo de devolución del informe de incidente final.
-->                        
      <v-dialog
      v-model    = "returnFinalDialog"
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
            @click = "returnFinalDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color     = "primary"
            @click    = "returnFinalItem()"
            :disabled = "buttonClicked"
          >
            Guardar
          </v-btn>
        </v-card-actions>           
      </v-card>            
    </v-dialog>    

<!--		
  👉 closeFinalDialog
      • Componente que despliega mensaje que confirma y cancela el cierre del informe final seleccionado
-->
    <v-dialog 
      v-model    = "closeFinalDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
    >
      <v-card :class="{ 'cdte-dialog--dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="text-h5 white--text">Cierre de informe final</span>
          <v-spacer />
            <v-btn dark icon @click="closeFinalDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>            
        <v-card-subtitle class="primary">
          <span class="text-h8 white--text">{{  `Id: ${this.editedItem.id}` }}</span>
        </v-card-subtitle>
        <v-card-text class="disciplinary-list-content">
          <div class="disciplinary-list-heading">
            <div class="disciplinary-list-title">
              <v-icon small color="primary">mdi-gavel</v-icon>
              <h3>Medidas disciplinarias</h3>
            </div>
            <span class="disciplinary-list-count" aria-live="polite">
              {{ itemDisciplinaryMeasures.filter(measure => measure.estaAdoptada).length }} de {{ itemDisciplinaryMeasures.length }} seleccionadas
            </span>
          </div>
          <v-row class="panel-fields-row" dense>
            <v-col cols="12">
              <v-checkbox
                v-for="measure in itemDisciplinaryMeasures"
                :key    = "measure.id"
                class   = "disciplinary-list-option"
                :class  = "{ 'disciplinary-list-option--selected': measure.estaAdoptada }"
                v-model = "measure.estaAdoptada"
                :label  = "measure.descripcion"
                color   = "primary"
                dense
                hide-details
              />
              <p v-if="!itemDisciplinaryMeasures.length" class="disciplinary-list-empty">
                No hay medidas disciplinarias disponibles.
              </p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color  = "secondary"
            outlined
            @click = "closeFinalDialog = false"
          >
            No, Cancelar
          </v-btn>
          <v-btn
            color  = "primary"
            @click = "closeFinalItem()"
          >
            Si, Cerrar
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
  import reportView from "@/components/reports/reportView.vue"

  const createDefaultItem = () => ({
    estado                 : null,
    id                     : null,
    incidentes             : {
      tipO_INCIDENTE      : {
        descripcion        : ''
      },
    },
    incidentesid           : null,
    medidaS_DISCIPLINARIAS : '',
  })

  export default {
    name       : "finales",        
    components : {
      reportView
    },
    data() {
      const defaultItem = createDefaultItem()
      return {
        search                      : '',
        oldSearch                   : '',
        page                        : 1,
        oldPage                     : 1,
        items                       : 5,
        estado                      : '00',
        oldEstado                   : '00',
        reportViewMode              : 'Final',
        reportViewDialog            : false,
        disciplinaryMeasureDialog   : false,
        returnFinalDialog           : false,
        confirmReturnIncidentDialog : false,
        closeFinalDialog            : false,
        itemDisciplinaryMeasures    : [],
        buttonClicked               : false,
        defaultItem                 : defaultItem,
        editedItem                  : createDefaultItem(),
        validForm                   : false,
        itemsPerPage                : [ 5, 10, 25, 50 ],
        itemsChip                   : [
        { text: 'Todos'             , value: '00', color: ''  },						
        { text: 'En Proceso', value: '01', color: 'success'   },
        { text: 'Tramitado' , value: '04', color: 'info'      },
        { text: 'Devuelto'  , value: '03', color: 'primary'   },
      ],
        headers                     : [
          { text: "Id"                          , value: "final.id"                                   , groupable: false, sortable: false },
          { text: "Tipo incidente"              , value: "final.incidentes.tipO_INCIDENTE.descripcion", groupable: false, sortable: false },
          { text: "Fecha y hora hecho"          , value: "final.fechA_HECHO"                          , groupable: false, sortable: false },
          { text: "Fecha y hora tramite final"  , value: "final.fechA_TRAMITE"                        , groupable: false, sortable: false },
          { text: "Circunstancias"              , value: "final.incidentes.circunstanciA_HECHO"       , groupable: false, sortable: false },
          { text: "Medidas disciplinarias"      , value: "final.medidaS_DISCIPLINARIAS"               , groupable: false, sortable: false },
          { text: "Motivo de devolución"        , value: "motivoDevolucionFin.motivO_DEVOLUCION"      , groupable: false, sortable: false },          
          { text: "Acciones"                    , value: "acciones"                             , groupable: false, sortable: false },  
        ],        
      rules                        : {
        required      : [
          (v) => !!v || "Este campo es requerido",
        ],
        maxCharacters : [
          (v) => (v ? v.length : 0) <= 2000 || "Máximo 2000 caracteres",
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
      ...mapGetters("finalesStore", [ 'informesFinales', 'pages', 'isLoading', 'medidasDisciplinarias' ]),
      ...mapGetters(['currentUser']), 
    },
    async beforeMount() {
      await this.getData()
    },		    
    watch      : {
/*
    - page  :	Se ejecuta cuando se cambia la página de la tabla de informes finales, y si la página actual 
              es diferente a la página anterior, se llama a la función getData() para obtener los datos de 
              la nueva página y se actualiza oldPage con el valor de page.			
    - estado:	Se ejecuta cuando se cambia el estado de los informes finales, y si el estado actual es diferente al 
              estado anterior, se llama a la función getData() para obtener los datos del nuevo estado y se 
              actualiza oldEstado con el valor de estado.
    - items :	Se ejecuta cuando se cambia la cantidad de items por página, y se reinicia la página a 1 y se llama a 
              la función getData() para obtener los datos de la nueva configuración de items por página.
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
        await this.getListInformesFinalesCdte({
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
      getItemClass(item) {
        return item.estado === 1 ? 'row-table-display-info' : ( item.estado === 4 ? 'row-table-display-success' : '' )
        // return item.estado !== 2 ? 'row-table-display-off' : ''
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
      closePreviewReport() {
        this.transactDialog         = false
        this.temporaryClosureDialog = false
        this.reopeningDialog        = false
      },      
      closeReportView() {
        this.reportViewDialog = false
      },            
/* Complementos */
      async disciplinaryMeasures (item) {
        this.resetValidation();
        this.editedIndex               = this.informesFinales.indexOf(item);
        this.editedItem                = Object.assign({}, item);
        this.disciplinaryMeasureDialog = true;
      },
      async returnFinal(item) {
        this.resetValidation();
        this.editedIndex       = this.informesFinales.indexOf(item);
        this.editedItem        = Object.assign({}, item);
        this.returnFinalDialog = true;
      },
      async closeFinal(item) {    
        this.resetValidation();
        this.editedIndex              = this.informesFinales.indexOf(item);
        this.editedItem               = Object.assign({}, item);
        this.itemDisciplinaryMeasures = [];
        await this.getListMedidasDisciplinariasInformesFinales(this.editedItem.id)
        this.itemDisciplinaryMeasures = (this.medidasDisciplinarias || []).map(medida => ({
          ...medida,
          estaAdoptada: medida.estaAdoptada === true,
        }));
        this.closeFinalDialog = true;
      },
/* Transaccionales */      
      async disciplinaryMeasuresItem () {
        this.buttonClicked = true;
        try {
          const	resp = await this.putMedidasDisciplinariasInformesFinales({
              incidentesId           : this.editedItem.incidentesid,
              finalesId              : this.editedItem.id,
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
      async returnFinalItem() {
        this.buttonClicked = true
        await this.putDevolucionInformesFinales({
          motivoDevolucion : this.editedItem.motivoDevolucion,
          ...this.editedItem,
        })
        .then(async resp => {
          if (resp.status == 200) {
            toastr.success("Se ha devuelto correctamente el incidente", "Éxito!");
            this.buttonClicked = false
            this.page = 1
            await this.getData()
          } else {
            toastr.error("Ha ocurrido un error al devolver el incidente", "Error!");
            this.buttonClicked     = false
            this.returnFinalDialog = false
            return;
          }
        });
        this.returnFinalDialog = false
      },
      async closeFinalItem() {
  

        const res = await this.putCierreInformesFinales({
          incidentesId : this.editedItem.incidentesid,
          finalesId    : this.editedItem.id,
          medidas      : this.itemDisciplinaryMeasures.map(measure => ({
            id            : measure.id,
            estA_ADOPTADA : measure.estaAdoptada === true,
          }))
        })
        if (res.status == 200) {
          toastr.success("Se ha cerrado correctamente el informe final", "Éxito!");
          this.page = 1
          await this.getData()
        } else {
          toastr.error("Se ha producido un error al cerrar el informe final", "Error!");
          this.closeCloseFinalDialog();
          return;
        }
        this.closeCloseFinalDialog(); 
      },
      async closeCloseFinalDialog() {
        this.closeFinalDialog = false
        this.editedItem       = createDefaultItem();
        this.editedIndex      = -1;
        this.resetValidation() 
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },      
/* Funciones de validación y formateo de fechas entre otras */
      validate() {
        this.$refs.form.validate();
      },			
      resetValidation(){
        if ( this.$refs.form ) this.$refs.form.resetValidation();
      },

      getFormatDateTime(datetime) {
        if (!datetime) return null	
        const datetimeParts = datetime.split(/[ T]/)
        const [year, month, day] = datetimeParts[0].split('-')
        const time = datetimeParts[1]
        return { dateFormatted: `${day}/${month}/${year}`, time: time.slice(0,5) , timeFormatted: time.slice(0,5) }
      },
            
      getIncidentTypeDescription(item) {
        if (!item || !item.incidentes || !item.incidentes.tipO_INCIDENTE) {
          return ''
        }
        return item.incidentes.tipO_INCIDENTE.descripcion || ''
      },
			
      ...mapActions("finalesStore",	[	"getListInformesFinalesCdte"             , "getListMedidasDisciplinariasInformesFinales", 
                                      "putMedidasDisciplinariasInformesFinales", "putDevolucionInformesFinales"               ,
                                      "putInformesFinales"                     , "putConclusionInformesFinales"              ,
                                      "putCierreInformesFinales" ]),
    }  
  };
</script>
<style scoped>
  .disciplinary-list-content {
    padding-top: 24px !important;
  }

  .disciplinary-list-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 14px;
  }

  .disciplinary-list-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .disciplinary-list-title h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
    color: #253f57;
    overflow-wrap: anywhere;
  }

  .disciplinary-list-count {
    font-size: 0.75rem;
    line-height: 1.5;
    color: #60758b;
  }

  .disciplinary-list-option {
    margin: 0 !important;
    padding: 12px 14px !important;
    border-bottom: 1px solid #e3e9ed;
    border-left: 3px solid transparent;
    transition: background-color 0.18s ease, border-color 0.18s ease;
  }

  .disciplinary-list-option:hover {
    background-color: #f5f7f9;
  }

  .disciplinary-list-option--selected {
    border-left-color: #0b3c5d;
    background-color: #edf4f8;
  }

  .disciplinary-list-option:focus-within {
    outline: 2px solid #0b3c5d;
    outline-offset: -2px;
  }

  .disciplinary-list-option ::v-deep .v-input__slot {
    align-items: flex-start;
  }

  .disciplinary-list-option ::v-deep .v-label {
    flex: 1;
    min-width: 0;
    height: auto;
    font-size: 0.85rem;
    line-height: 1.5;
    letter-spacing: 0;
    color: #374957;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .disciplinary-list-option--selected ::v-deep .v-label {
    color: #0b3c5d;
    font-weight: 500;
  }

  .disciplinary-list-empty {
    margin: 0;
    padding: 20px 0;
    color: #60758b;
    font-size: 0.85rem;
  }

  .finales-toolbar {
    padding: 10px 2px 12px;
    align-items: flex-start;
    gap: 10px;
    border-bottom: 1px solid #d8e4f0;
  }
  .finales-toolbar .toolbar-control {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  .finales-toolbar .toolbar-chips {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 40px;
  }
  .finales-toolbar ::v-deep .v-spacer {
    max-width: 10px;
    flex: 0 0 10px;
  }

  .finales-toolbar ::v-deep .toolbar-search {
    max-width: 430px;
    min-width: 330px;
  }

  .finales-toolbar ::v-deep .toolbar-items {
    max-width: 250px;
    min-width: 220px;
  }

  .finales-toolbar ::v-deep .toolbar-search .v-input__slot,
  .finales-toolbar ::v-deep .toolbar-items .v-input__slot {
    border-radius: 10px !important;
  }

  .finales-toolbar ::v-deep .toolbar-search.v-input--is-focused .v-input__slot,
  .finales-toolbar ::v-deep .toolbar-items.v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
  }

  .finales-toolbar ::v-deep .toolbar-search .v-label,
  .finales-toolbar ::v-deep .toolbar-items .v-label,
  .finales-toolbar ::v-deep .toolbar-search input,
  .finales-toolbar ::v-deep .toolbar-items input,
  .finales-toolbar ::v-deep .toolbar-items .v-select__selection {
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.015em;
  }

  .finales-toolbar ::v-deep .toolbar-search .v-input__append-inner .v-icon,
  .finales-toolbar ::v-deep .toolbar-items .v-input__append-inner .v-icon {
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

  .tabla-acciones ::v-deep .accion-btn--view .v-icon  { color: #2f5d86; }
  .tabla-acciones ::v-deep .accion-btn--disciplinary-measures .v-icon { color: #7a5230; }
  .tabla-acciones ::v-deep .accion-btn--view:hover    { border-color: #8fb3d3; background: #edf5fc; }
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
    margin: 0 !important;
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
/* color de fondo de las filas según estado */
  ::v-deep .row-table-display-off {
    background-color: transparent !important;
  }
  ::v-deep .row-table-display-off td {
    color: #6b7885 !important;
  }
  
  ::v-deep .row-table-display-info {
    background-color: #f2f8ff !important;
  }
  ::v-deep .row-table-display-success {
    background-color: #f2faf4 !important;	
  }



  .final-resolution-card-text {
    padding-top: 6px;
  }

  .elegant-notes-shell {
    padding: 12px;
    border-radius: 14px;
    background: linear-gradient(145deg, #f8fbff 0%, #eef4ff 100%);
    border: 1px solid #d8e3f2;
    box-shadow: 0 6px 18px rgba(11, 60, 93, 0.08);
  }

  .final-resolution-highlight {
    position: relative;
    padding: 14px;
    border: 1px solid #cbdced;
    background: linear-gradient(148deg, #fbfdff 0%, #eff5fd 52%, #f8fbff 100%);
    box-shadow: 0 10px 24px rgba(11, 60, 93, 0.1);
  }

  .final-resolution-highlight::before {
    content: '';
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 14px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(180deg, #0b3c5d 0%, #2f6f9e 100%);
  }

  .notes-highlight-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    padding-left: 10px;
  }

  .notes-highlight-icon {
    color: #0b3c5d;
  }

  .notes-highlight-title {
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #1f4768;
  }

  .notes-highlight-subtitle {
    padding-left: 10px;
    font-size: 0.78rem;
    line-height: 1.35;
    color: #607890;
  }

  .final-resolution-display {
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid #c6d7e8;
    background: #ffffff;
    min-height: 84px;
    color: #2f4359;
    line-height: 1.48;
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
  /* Multilinea para encabezados de tabla */
    .multiline-header {
    display: inline-block;
    white-space: normal;
    line-height: 1.25;
    text-align: center;
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

    .cdte-dark ::v-deep .finales-toolbar {
      border-bottom-color: #405364;
    }

    .cdte-dark ::v-deep .finales-toolbar .v-input__slot {
      background-color: #202d39;
    }

    .cdte-dark ::v-deep .finales-toolbar .v-label,
    .cdte-dark ::v-deep .finales-toolbar input,
    .cdte-dark ::v-deep .finales-toolbar .v-select__selection,
    .cdte-dark ::v-deep .finales-toolbar .v-icon {
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
    .cdte-dialog--dark ::v-deep .panel .v-counter,
    .cdte-dialog--dark ::v-deep .disciplinary-list-title h3 {
      color: #c9d5df;
    }

    .cdte-dialog--dark ::v-deep .panel-subtitle,
    .cdte-dialog--dark ::v-deep .disciplinary-list-count,
    .cdte-dialog--dark ::v-deep .disciplinary-list-empty {
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

    .cdte-dialog--dark ::v-deep .disciplinary-list-option {
      border-bottom-color: #405364;
    }

    .cdte-dialog--dark ::v-deep .disciplinary-list-option:hover {
      background-color: #263542;
    }

    .cdte-dialog--dark ::v-deep .disciplinary-list-option--selected {
      border-left-color: #4899cd;
      background-color: #263542;
    }

    .cdte-dialog--dark ::v-deep .disciplinary-list-option .v-label {
      color: #c9d5df;
    }

    .cdte-dialog--dark ::v-deep .v-alert {
      background-color: #35252a;
      color: #f3dce0;
    }
</style>