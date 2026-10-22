<template>
  <v-container fluid>
    <v-card class="report-preview-card">
      <v-toolbar dark class="report-toolbar px-2">
        <div class="d-flex align-center">
          <v-avatar size="34" class="mr-3 report-toolbar-avatar">
            <v-icon small>mdi-file-document-check-outline</v-icon>
          </v-avatar>
          <div>
            <v-toolbar-title class="report-toolbar-title">{{ titles.title }}</v-toolbar-title>
            <div class="report-toolbar-subtitle">{{ titles.subtitle }}</div>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          small
          class  = "report-close-btn"
          @click = "emitClose()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="report-content">
<!-- Informante -->					
        <v-card flat class="report-section mb-4">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.informante }}</v-chip>
            <span class="report-section-title">Informante</span>
          </div>
          <v-row dense class="mt-2">
            <v-col cols="12" md="3" class="report-label">Nombre</v-col>
            <v-col cols="12" md="9" class="report-value">
              {{ informanteNombre }}
            </v-col>
            <v-col cols="12" md="3" class="report-label">Unidad</v-col>
            <v-col cols="12" md="9" class="report-value">{{ informanteUnidad }}</v-col>
            <v-col cols="12" md="3" class="report-label">Fecha y hora</v-col>
            <v-col cols="12" md="9" class="report-value">{{ getFormatDateTime(item.fechA_INFORMANTE,'date') }} {{ getFormatDateTime(item.fechA_INFORMANTE,'time') }}</v-col>
          </v-row>
        </v-card>
<!-- Hechos -->
        <v-card flat class="report-section report-additional mb-4">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.hechos }}</v-chip>
            <span class="report-section-title">Hechos</span>
          </div>
          <v-row dense class="mt-1 report-additional-row">
            <v-col cols="12" md="4" class="report-section-label">INGESTA DE BEBIDAS ALCOHÓLICAS</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ safeDescripcion(item.tipO_INGESTA) }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">TIPO INCIDENTE</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ safeDescripcion(item.tipO_INCIDENTE) }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">UNIDAD AFECTADA</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ safeDescripcion(item.u_AFECTADA) }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">FECHA Y HORA DEL HECHO</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ getFormatDateTime(item.fechA_HECHO,'date') }} {{ getFormatDateTime(item.fechA_HECHO,'time') }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">LUGAR</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ item.lugaR_HECHO }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">CIRCUNSTANCIAS</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ item.circunstanciA_HECHO }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">DAÑOS AL PERSONAL</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ item.danoS_PERSONALES }}</v-col>
            <v-col cols="12" md="4" class="report-section-label">MEDIDAS ADOPTADAS</v-col>
            <v-col cols="12" md="8" class="report-section-value">{{ item.medidaS_ADOPTADAS }}</v-col>
          </v-row>
        </v-card>
<!-- Datos adicionales -->				
          <div v-show="tipoInforme!=='Preliminar'">
            <v-card flat class="report-section report-additional mb-4">
              <div class="report-section-header">
                <v-chip small label class="report-chip">{{ sectionOrdinals.datosAdicionales }}</v-chip>
                  <span class="report-section-title">DATOS ADICIONALES</span>
              </div>
              <v-row dense class="mt-1 report-additional-row">
                <v-col cols="12" md="4" class="report-section-label">VESTUARIO</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.especificacioN_VESTUARIO }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">TIPO DE IDENTIFICACION QUE PORTABA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ safeDescripcion(item.tipO_IDENTIFICACION) }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">UNIDAD DE INTELIGENCIA QUE ADOPTA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.unidaD_INTELIGENCIA_ADOPTA }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">DETALLE DEL MATERIAL COMPROMETIDO</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.caracteristicaS_MATERIAL }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">DETALLE DEL RESULTADO DE MUERTE</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.detallE_RESULTADO_MUERTE }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">DETALLE DE DOCUMENTACIÓN PERDIDA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.detallE_DOCUMENTACION_PERDIDA }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">AUTORIDAD EXTERNA QUE REQUIERE INFORMACION</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.autoridaD_REQUIERE_INFO }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">MEDIDAS ADOPTADAS RESPECTO A FAMILIARES</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.medidaS_ADOPTADAS_FAMILIARES }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">SINTESIS DE LOS MEDIOS DE PRENSA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ item.sintesiS_MEDIOS_PRENSA }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">ARMAMENTO</v-col>
                <v-col cols="12" md="8" class="report-section-value">
                  {{ item.portabA_ARMA === 'S' ? 'Portaba ' : item.portabA_ARMA === 'N' ? 'No portaba arma' : '' }} 
                  {{ safeDescripcion(item.tipO_ARMAMENTO) }} 
                  {{ item.armA_FISCAL_PARTICULAR === 'F' ? 'Fiscal' : item.armA_FISCAL_PARTICULAR === 'P' ? 'Particular' : '' }} 
                  {{ item.detallE_PORTE_ARMA }}
                </v-col>
                <v-col cols="12" md="4" class="report-section-label">INVESTIGACIÓN</v-col>
                <v-col cols="12" md="8" class="report-section-value">
                  {{ item.realizA_INVESTIGACION === 'S' ? 'Se realiza investigación' : item.realizA_INVESTIGACION === 'N' ? 'No se realiza investigación' : '' }} 
                  {{ safeDescripcion(item.tipO_INVESTIGACION) }} 
                  {{ item.detallE_INVESTIGACION }}
                </v-col>
              </v-row>
            </v-card>
          </div>  				
<!-- Procedimientos policiales -->
        <v-card flat class="report-section mb-4">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.procedimientos }}</v-chip>
            <span class="report-section-title">Procedimientos policiales</span>
          </div>
          <v-data-table
            :headers="headersPoliceProcedure"
            :items="itemsPoliceProcedure"
            class="report-table elevation-0 mt-3"
            disable-pagination
            hide-default-footer
            hide-default-header
          >
            <template v-slot:header="{props: { headers }}">
              <thead class="report-table-head">
                <tr>
                  <th v-for="h in headers" :class="h.class">
                    <span>{{ h.text }}</span>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item.fechA_PROCEDIMIENTO_POL="{ item }">
              {{ getFormatDateTime(item.fechA_PROCEDIMIENTO_POL,'date') }}
            </template>
            <template v-slot:no-data>
              <div class="report-empty-state">
                <v-icon small class="mr-2">mdi-information-outline</v-icon>
                No se ha encontrado procedimientos policiales registrados en el sistema
              </div>
            </template>
          </v-data-table>
        </v-card>
<!-- Antecedentes judiciales -->
        <v-card flat class="report-section mb-4">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.antecedentes }}</v-chip>
            <span class="report-section-title">Antecedentes judiciales</span>
          </div>
          <v-data-table
            :headers="headersJudicialRecord"
            :items="itemsJudicialRecord"
            class="report-table elevation-0 mt-3"
            disable-pagination
            hide-default-footer
            hide-default-header
          >
            <template v-slot:header="{props: { headers }}">
              <thead class="report-table-head">
                <tr>
                  <th v-for="h in headers" :class="h.class">
                    <span>{{ h.text }}</span>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item.fechA_ANTECEDENTES_JUD="{ item }">
              {{ getFormatDateTime(item.fechA_ANTECEDENTES_JUD,'date') }}
            </template>
            <template v-slot:no-data>
              <div class="report-empty-state">
                <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado antecedentes judiciales registrados en el sistema
                </div>
            </template>
          </v-data-table>
        </v-card>
<!-- Involucrados -->
        <v-card flat class="report-section">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.involucrados }}</v-chip>
              <span class="report-section-title">Involucrados</span>
          </div>
          <v-data-table
            :headers="headersInvolved"
            :items="itemsInvolved"
            class="report-table elevation-0 mt-3"
            disable-pagination
            hide-default-footer
            hide-default-header
          >
            <template v-slot:header="{props: { headers }}">
              <thead class="report-table-head">
                <tr>
                  <th v-for="h in headers" :class="h.class">
                    <span>{{ h.text }}</span>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item.nombre="{ item }">
              {{ item.r_INVOLUCRADO.nombres }} {{ item.r_INVOLUCRADO.apellidO_PATERNO }} {{ item.r_INVOLUCRADO.apellidO_MATERNO }}
            </template>
            <template v-slot:no-data>
              <div class="report-empty-state">
                <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado involucrados registrados en el sistema
                </div>
            </template>
          </v-data-table>
        </v-card>
<!-- Archivos de informe -->
        <v-card flat class="report-section">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.archivos }}</v-chip>
              <span class="report-section-title">Archivos de informe</span>
          </div>
          <v-data-table
            :headers="headersReportFolders"
            :items="itemsReportFolders"
            class="report-table elevation-0 mt-3"
            disable-pagination
            hide-default-footer
            hide-default-header
          >
            <template v-slot:header="{props: { headers }}">
              <thead class="report-table-head">
                <tr>
                  <th v-for="h in headers" :class="h.class">
                    <span>{{ h.text }}</span>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item.fechA_ARCHIVO="{ item }">
              {{ getFormatDateTime(item.fechA_ARCHIVO,'date') }}
            </template>
            <template v-slot:no-data>
              <div class="report-empty-state">
                <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado archivos de informes registrados en el sistema
                </div>
            </template>
          </v-data-table>
        </v-card>			
<!-- Ampliación de informe -->
        <v-card flat class="report-section" v-if="tipoInforme!=='Preliminar'">
          <div class="report-section-header">
            <v-chip small label class="report-chip">{{ sectionOrdinals.ampliaciones }}</v-chip>
              <span class="report-section-title">Ampliación del informe</span>
          </div>
          <v-data-table
            :headers="headersSupplementaryReport"
            :items="itemsSupplementaryReport"
            class="report-table elevation-0 mt-3"
            disable-pagination
            hide-default-footer
            hide-default-header
          >
            <template v-slot:header="{props: { headers }}">
              <thead class="report-table-head">
                <tr>
                  <th v-for="h in headers" :class="h.class">
                    <span>{{ h.text }}</span>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item.fechA_AMPLIACION="{ item }">
              {{ getFormatDateTime(item.fechA_AMPLIACION,'date') }}
            </template>
            <template v-slot:no-data>
              <div class="report-empty-state">
                <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado ampliaciones de informes registradas en el sistema
                </div>
            </template>
          </v-data-table>
        </v-card>						
      </v-card-text>
      <v-divider></v-divider>
      </v-card>		
    </v-container>
  </template>
<script>
  import { mapActions } from 'vuex';	
  export default {
    name    : 'PreviewReport',
    props   : {
      item        : { type: Object,	required: true },
      titles      : { type: Object,	required: true },
      tipoInforme : { type: String, required: true }
    },
    data    : () => ({
      headersPoliceProcedure     : [
        { text : "FECHA"        , value : "fechA_PROCEDIMIENTO_POL"       , groupable : false, sortable : false, class:"my-header-style" },
        { text : "PROCEDIMIENTO", value : "detallE_PROCEDIMIENTO_POL"     , groupable : false, sortable : false, class:"my-header-style" },
        { text : "CONDICION"    , value : "condicioN_POLICIAL.descripcion", groupable : false, sortable : false, class:"my-header-style" },
      ],
      headersJudicialRecord      : [
        { text : "FECHA"      , value : "fechA_ANTECEDENTES_JUD"  , groupable : false, sortable : false, class:"my-header-style" },
        { text : "ANTECEDENTE", value : "detallE_ANTECEDENTES_JUD", groupable : false, sortable : false, class:"my-header-style" },
      ],	
      headersInvolved            : [
        { text: "RUN"           , value: "ruT_INVOLUCRADO"         , groupable: false, sortable: false, class:"my-header-style" },
        { text: "NOMBRE"        , value: "nombre"                  , groupable: false, sortable: false, class:"my-header-style" },
        { text: "ALCOHOL/DROGAS", value: "tipO_CONSUMO.descripcion", groupable: false, sortable: false, class:"my-header-style" },
        { text: "SALUD"         , value: "estadO_SALUD.descripcion", groupable: false, sortable: false, class:"my-header-style" },
        { text: "UNIDAD"        , value: "u_INVOLUCRADO.sigla"     , groupable: false, sortable: false, class:"my-header-style" },
      ],
      headersReportFolders       : [
        { text: "FECHA"      , value: "fechA_ARCHIVO"      , groupable: false, sortable: false, class:"my-header-style" },
        { text: "DESCRIPCIÓN", value: "descripcioN_ARCHIVO", groupable: false, sortable: false, class:"my-header-style" },
      ],
      headersSupplementaryReport : [
        { text: "FECHA"      , value: "fechA_AMPLIACION"      , groupable: false, sortable: false, class:"my-header-style" },
        { text: "DESCRIPCIÓN", value: "detallE_AMPLIACION", groupable: false, sortable: false, class:"my-header-style" },
      ],
      itemsPoliceProcedure       : [],
      itemsJudicialRecord        : [], 
      itemsInvolved              : [],
      itemsReportFolders         : [],	
      itemsSupplementaryReport   : [],
    }),		
    computed : {

      informanteNombre() {
        const informante = this.item && this.item.informante ? this.item.informante : {}
        const fullName = [
          informante.grado,
          informante.nombres,
          informante.apellidO_PATERNO,
          informante.apellidO_MATERNO,
        ].filter(Boolean).join(' ').trim()
        return fullName || '-'
      },
      informanteUnidad() {
        const informante = this.item && this.item.informante ? this.item.informante : {}
        return informante.unidad || '-'
      },
      sectionOrdinals() {
        let ordinal = 1
        const sections = {
          informante     : ordinal++,
          hechos         : ordinal++,
          datosAdicionales: null,
          procedimientos : null,
          antecedentes   : null,
          involucrados   : null,
          archivos       : null,
          ampliaciones   : null,
        }

        if (this.tipoInforme!=='Preliminar') {
          sections.datosAdicionales = ordinal++
        }

        sections.procedimientos = ordinal++
        sections.antecedentes   = ordinal++
        sections.involucrados   = ordinal++
        sections.archivos       = ordinal++
        if (this.tipoInforme!=='Preliminar') {
          sections.ampliaciones = ordinal++
        }

        return sections
      },
    },
    watch	 : {
      item : {
        async handler(newItem) {
          if (newItem && newItem.id) {
            await this.data(newItem.id)
          } else {
            this.resetReportItems()
          }
        },
        immediate: true
      }
    },
    methods : {
/*
  • mounted						: Se ejecuta al montar el componente, realizando llamadas asíncronas para obtener los datos de procedimientos
                        policiales, antecedentes judiciales e involucrados relacionados con el informe. 
  • getFormatDateTime	: Función auxiliar para formatear fechas y horas en el formato deseado (dd/mm/yyyy para fechas y hh:mm para horas).
  
*/			
      async data(idInforme) {
        try {
          let  respPoliceProcedure, respJudicialRecord, respInvolved, respArchivosInformes, respSupplementaryReport

          this.resetReportItems()
          if (!idInforme) {
            return
          }

          if (this.tipoInforme === 'Preliminar') {
            respPoliceProcedure  = await this.getListProcedimientosPolicialesPreliminares( idInforme )
            respJudicialRecord   = await this.getListAntecedentesJudicialesPreliminares(idInforme)
            respInvolved         = await this.getListInvolucradosPreliminares( idInforme )
            respArchivosInformes = await this.getListArchivosInformesPreliminares( idInforme )
          } else if (this.tipoInforme === 'Incidente') {
            respPoliceProcedure     = await this.getListProcedimientosPolicialesIncidentes( idInforme )
            respJudicialRecord      = await this.getListAntecedentesJudicialesIncidentes(idInforme)
            respInvolved            = await this.getListInvolucradosIncidentes( idInforme )
            respArchivosInformes    = await this.getListArchivosInformesIncidentes( idInforme )
            respSupplementaryReport = await this.getListAmpliacionesInformesIncidentes( idInforme )
          } else if (this.tipoInforme === 'Final') {
            respPoliceProcedure     = await this.getListProcedimientosPolicialesFinales( idInforme )
            respJudicialRecord      = await this.getListAntecedentesJudicialesFinales(idInforme)
            respInvolved            = await this.getListInvolucradosFinales( idInforme )
            respArchivosInformes    = await this.getListArchivosInformesFinales( idInforme )
            respSupplementaryReport = await this.getListAmpliacionesInformesFinales( idInforme )
          }

          
          if (respPoliceProcedure?.status === 200) {
            this.itemsPoliceProcedure = respPoliceProcedure.data.respuesta 
          }
          if (respJudicialRecord?.status === 200) {
            this.itemsJudicialRecord = respJudicialRecord.data.respuesta  
          }
          if (respInvolved?.status === 200) {
            this.itemsInvolved = respInvolved.data.respuesta  
          }
          if (respArchivosInformes?.status === 200) {
            this.itemsReportFolders = respArchivosInformes.data.respuesta  
          }
          if (respSupplementaryReport && respSupplementaryReport.status === 200) {
            this.itemsSupplementaryReport = respSupplementaryReport.data.respuesta  
          }
        } catch (error) {
          console.error("Error al cargar datos para el reporte:", error)
        }
      },			
      resetReportItems() {
        this.itemsInvolved = []
        this.itemsPoliceProcedure = []
        this.itemsJudicialRecord = []
        this.itemsReportFolders = []
        this.itemsSupplementaryReport = []
      },
      getFormatDateTime (datetime, token) {
        if (!datetime) return null
        const [date,time] = datetime.split('T')  
        if ( token == 'time' ) {
          const [hour,minute,second] = time.split(':')
          return `${hour}:${minute}`
        } 
        if ( token == 'date') {
          const [year, month, day] = date.split('-')
          return `${day}/${month}/${year}`
        }
      },
      emitClose() {
        this.$emit('closePreviewReport')
        this.$emit('closeReportView')
      },
      safeDescripcion(value) {
        if (!value || typeof value !== 'object') return '-'
        return value.descripcion || '-'
      },
      ...mapActions("procedimientosPolicialesStore",	[ "getListProcedimientosPolicialesPreliminares", "getListProcedimientosPolicialesIncidentes" ,  "getListProcedimientosPolicialesFinales"]),
      ...mapActions("antecedentesJudicialesStore"  ,	[ "getListAntecedentesJudicialesPreliminares"  , "getListAntecedentesJudicialesIncidentes"   , "getListAntecedentesJudicialesFinales" ]),
      ...mapActions("involucradosStore"            ,  [ "getListInvolucradosPreliminares"            , "getListInvolucradosIncidentes"             , "getListInvolucradosFinales" ]),
      ...mapActions("archivosInformesStore"        ,  [ "getListArchivosInformesPreliminares"        , "getListArchivosInformesIncidentes"         , "getListArchivosInformesFinales" ]),
      ...mapActions("ampliacionesInformesStore"    ,  [ "getListAmpliacionesInformesIncidentes"      , "getListAmpliacionesInformesFinales" ]),
    }
  };
</script>

<style scoped>
  .report-preview-card {
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(180deg, #f7fafc 0%, #eef3f8 100%);
  }

  .report-toolbar {
    background: linear-gradient(120deg, #0b3c5d 0%, #1f6f8b 100%) !important;
    min-height: 72px;
  }

  .report-toolbar-avatar {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .report-toolbar-title {
    font-weight: 700;
    letter-spacing: .2px;
  }

  .report-toolbar-subtitle {
    color: rgba(255, 255, 255, .85);
    font-size: 12px;
    line-height: 1.2;
  }

  .report-close-btn {
    background: rgba(255, 255, 255, 0.14);
    border-radius: 10px;
  }

  .report-content {
    padding: 20px 24px 12px 24px;
  }

  .report-section {
    background: #ffffff;
    border: 1px solid #dde6ef;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 6px 20px rgba(11, 60, 93, .06);
  }

  .report-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .report-chip {
    background: #0b3c5d !important;
    color: #fff !important;
    font-weight: 700;
    min-width: 28px;
    justify-content: center;
  }

  .report-section-title {
    color: #16324a;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
  }
  .report-section-label {
    color: #506070;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: .35px;
  }

  .report-section-value {
    color: #1f2d3d;
    font-weight: 500;
    line-height: 1.45;
    word-break: break-word;
  }
  .report-label {
    color: #506070;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: .35px;
  }

  .report-value {
    color: #1f2d3d;
    font-weight: 500;
    line-height: 1.45;
    word-break: break-word;
  }


  .report-additional {
    padding: 12px 14px;
    background: linear-gradient(180deg, #f7fafd 0%, #f1f6fb 100%);
    border-color: #cfdbe7;
  }

  .report-additional .report-section-header {
    margin-bottom: 6px;
  }

  .report-additional-row {
    row-gap: 2px;
  }

  .report-additional-row > .col,
  .report-additional-row > [class*="col-"] {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .report-additional .report-section-label {
    font-size: 10.5px;
    letter-spacing: 0.28px;
    color: #607284;
    font-weight: 700;
    align-self: center;
  }

  .report-additional .report-section-value {
    font-size: 13px;
    line-height: 1.36;
    color: #2d3f52;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #d7e3ef;
    border-radius: 10px;
    padding: 7px 10px;
    min-height: 34px;
  }

  .report-table {
    border: 1px solid #e4ebf2;
    border-radius: 10px;
    overflow: hidden;
    background: #fbfdff;
  }

  .report-table-head th {
    background: #eaf1f7;
    color: #274257;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .35px;
    padding: 10px 12px;
    border-bottom: 1px solid #dae5ef;
  }

  .report-table ::v-deep tbody tr:nth-child(even) {
    background: #f6f9fc;
  }

  .report-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5b6f82;
    padding: 16px;
    font-size: 13px;
  }

  .report-confirm-btn {
    box-shadow: 0 6px 14px rgba(11, 60, 93, .28);
  }

  @media (max-width: 960px) {
    .report-content {
        padding: 14px 14px 10px 14px;
    }
    .report-section {
        padding: 12px;
    }
    .report-additional {
      padding: 10px 10px;
    }
    .report-additional .report-section-value {
      min-height: 32px;
      padding: 6px 9px;
    }
  }
  
  /*
  ROJO
  .report-preview-card {
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(180deg, #faf6f6  0%, #f4ecec  100%);
}

.report-toolbar {
    background: linear-gradient(120deg, #b71c1c  0%, #7F0000  100%) !important;
    min-height: 72px;
}

.report-toolbar-avatar {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.report-toolbar-title {
    font-weight: 700;
    letter-spacing: .2px;
}

.report-toolbar-subtitle {
    color: rgba(255, 255, 255, .85);
    font-size: 12px;
    line-height: 1.2;
}

.report-close-btn {
    background: rgba(255, 255, 255, 0.14);
    border-radius: 10px;
}

.report-content {
    padding: 20px 24px 12px 24px;
}

.report-section {
    background: #ffffff;
    border: 1px solid #eadbdb;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 6px 20px rgba(127, 0, 0, .10);
}

.report-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.report-chip {
    background: #b71c1c  !important;
    color: #fff !important;
    font-weight: 700;
    min-width: 28px;
    justify-content: center;
}

.report-section-title {
    color: #7f0000;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
}

.report-label {
    color: #6b4a4a;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: .35px;
}

.report-value {
    color: #1e293b;
    font-weight: 500;
    line-height: 1.45;
    word-break: break-word;
}

.report-table {
    border: 1px solid #ecdede;
    border-radius: 10px;
    overflow: hidden;
    background: #fffafa;
}

.report-table-head th {
    background: #f8ecec;
    color: #7f0000;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .35px;
    padding: 10px 12px;
    border-bottom: 1px solid #ead7d7;
}

.report-table ::v-deep tbody tr:nth-child(even) {
    background: #fcf4f4;
}

.report-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7a5a5a;
    padding: 16px;
    font-size: 13px;
}
@media (max-width: 960px) {
    .report-content {
        padding: 14px 14px 10px 14px;
    }
    .report-section {
        padding: 12px;
    }
    
} */
</style>