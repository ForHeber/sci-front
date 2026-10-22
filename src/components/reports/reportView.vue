<template>
  <v-container fluid class="pa-0">
    <v-card class="report-preview-card">
      <v-toolbar dark class="report-toolbar px-2">
        <div class="d-flex align-center">
          <v-avatar size="34" class="mr-3 report-toolbar-avatar">
            <v-icon small>{{ resolvedIcon }}</v-icon>
          </v-avatar>
          <div>
            <v-toolbar-title class="report-toolbar-title">{{ resolvedTitles.title }}</v-toolbar-title>
            <div class="report-toolbar-subtitle">{{ resolvedTitles.subtitle }}</div>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          small
          class="report-close-btn"
          @click="$emit('closeReportView')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text
        class  ="report-content"
        :class ="{ 'report-content-with-changes': hasBubbles && showBubbles }"
      >
        <v-btn
          v-if="hasBubbles"
          text
          small
          color="primary"
          class="justify-self-start mb-2"
          :aria-pressed="showBubbles ? 'true' : 'false'"
          @click="showBubbles = !showBubbles"
        >
          <v-icon left small>{{ showBubbles ? 'mdi-message-off-outline' : 'mdi-message-outline' }}</v-icon>
          {{ showBubbles ? 'Ocultar' : 'Mostrar' }}
        </v-btn>
<!-- Report Section: Datos Generales -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section">
            <v-row dense class="mt-2">
              <v-col cols="12" md="3" class="report-label">TIPO DE INCIDENTE</v-col>
              <v-col cols="12" md="9" class="report-value">
                <span class="report-value-text">{{ safeDescripcion(resolvedItem.tipO_INCIDENTE) }}</span>
              </v-col>
              <v-col cols="12" md="3" class="report-label">UNIDAD DEL INCIDENTE</v-col>
              <v-col cols="12" md="9" class="report-value">{{ safeDescripcion(resolvedItem.u_AFECTADA) }}</v-col>
              <v-col cols="12" md="3" class="report-label">FECHA Y HORA DEL HECHO</v-col>
              <v-col cols="12" md="9" class="report-value">
                {{ getFormatDateTime(resolvedItem.fechA_HECHO, 'date') }}
                {{ getFormatDateTime(resolvedItem.fechA_HECHO, 'time') }}
              </v-col>
              <v-col cols="12" md="3" class="report-label">INGESTA DE ALCOHOL</v-col>
              <v-col cols="12" md="9" class="report-value">{{ safeDescripcion(resolvedItem.tipO_INGESTA) }}</v-col>
              <v-col cols="12" md="3" class="report-label">INFORMADO POR</v-col>
              <v-col cols="12" md="9" class="report-value">{{ informanteCompleto }}</v-col>
              <v-col cols="12" md="3" class="report-label">FECHA Y HORA DE INFORME</v-col>
              <v-col cols="12" md="9" class="report-value">
                {{ getFormatDateTime(resolvedItem.fechA_INFORMANTE, 'date') }}
                {{ getFormatDateTime(resolvedItem.fechA_INFORMANTE, 'time') }}
              </v-col>
            </v-row>
          </v-card>
          <aside v-if="getBubbles('00').length" class="report" :class="{ 'report-single': isSingleBubble('00') }">
            <v-card
              v-for="bubble in getBubbles('00')"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.entries[index].title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Resolución -->
<div class="report-section-with-changes mb-4">
        <v-card v-if="resolutionText" flat class="report-section report-resolution mb-4">
          <div class="report-section-header report-resolution-header">
            <div class="report-resolution-heading">
              <span class="report-section-title report-resolution-title">RESOLUCIÓN</span>
            </div>
          </div>
          <div class="report-resolution-subtitle mt-3">Medidas disciplinarias adoptadas por el Comandante de la Unidad</div>          
          <div class="report-resolution-body">
            <!-- <v-icon x-small class="report-resolution-quote">mdi-format-quote-open</v-icon> -->
            <p class="report-value report-resolution-value mb-0">{{ resolutionText }}</p>
          </div>
          <div class="report-resolution-subtitle mt-3">Medidas adoptadas</div>
          <div class="report-resolution-body report-measures-body">
            <v-list v-if="itemsDisciplinaryMeasures && itemsDisciplinaryMeasures.length" dense class="disciplinary-measures-list">
              <v-list-item
                v-for="(measure, index) in itemsDisciplinaryMeasures"
                :key="index"
                class="disciplinary-measure-item"
              >
                <v-list-item-avatar size="28" class="disciplinary-measure-avatar">
                  <v-icon x-small>mdi-check</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="disciplinary-measure-title">
                    {{ safeDescripcion(measure.medidaS_ADOPTADAS) || 'Descripción no disponible' }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <div v-else class="disciplinary-measures-empty">No hay medidas adoptadas registradas.</div>
          </div>
        </v-card>          
          <aside v-if="getBubbles('R').length" class="report" :class="{ 'report-single': isSingleBubble('R') }">
            <v-card
              v-for="bubble in getBubbles('R')"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.entries[index].title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
        <!-- Report Section: Lugar de los Hechos -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.lugar }}</v-chip>
              <span class="report-section-title">LUGAR DE LOS HECHOS</span>
            </div>
            <v-row dense class="mt-2">
              <v-col cols="12" class="report-value">{{ resolvedItem.lugaR_HECHO || resolvedItem.lugar_hecho || '' }}</v-col>
            </v-row>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.lugar).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.lugar) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.lugar)"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], 'LUGAR DE LOS HECHOS')"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Circunstancias en la que ocurrió el hecho -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.circunstancias }}</v-chip>
              <span class="report-section-title">CIRCUNSTANCIAS EN LA QUE OCURRIÓ EL HECHO</span>
            </div>
            <v-row dense class="mt-2">
              <v-col cols="12" class="report-value">{{ resolvedItem.circunstanciA_HECHO || resolvedItem.circunstancias || '' }}</v-col>
            </v-row>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.circunstancias).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.circunstancias) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.circunstancias  )"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], 'CIRCUNSTANCIAS EN LA QUE OCURRIÓ EL HECHO')"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Daños al personal, equipo o material involucrado -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.danos }}</v-chip>
              <span class="report-section-title">DAÑOS AL PERSONAL, EQUIPO O MATERIAL INVOLUCRADO</span>
            </div>
            <v-row dense class="mt-2">
              <v-col cols="12" class="report-value">{{ resolvedItem.danoS_PERSONALES || resolvedItem.danos || '' }}</v-col>
            </v-row>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.danos).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.danos) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.danos  )"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], 'DAÑOS AL PERSONAL, EQUIPO O MATERIAL INVOLUCRADO')"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Medidas adoptadas por la autoridad que informa -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.medidas }}</v-chip>
              <span class="report-section-title">MEDIDAS ADOPTADAS POR LA AUTORIDAD QUE INFORMA</span>
            </div>
            <v-row dense class="mt-2">
              <v-col cols="12" class="report-value">{{ resolvedItem.medidaS_ADOPTADAS || resolvedItem.medidas || '' }}</v-col>
            </v-row>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.medidas).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.medidas) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.medidas)"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], 'MEDIDAS ADOPTADAS POR LA AUTORIDAD QUE INFORMA')"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Datos Adicionales -->
        <div class="report-section-with-changes mb-4">
          <div v-show="tipoInforme === 'Incidente' || tipoInforme === 'Final'">
            <v-card flat class="report-section report-additional mb-4">
              <div class="report-section-header">
                <v-chip small label class="report-chip">{{ sectionOrdinals.datosAdicionales }}</v-chip>
                <span class="report-section-title">DATOS ADICIONALES</span>
              </div>
              <v-row dense class="mt-1 report-additional-row">
                <v-col cols="12" md="4" class="report-section-label">VESTUARIO</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.especificacioN_VESTUARIO }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">TIPO DE IDENTIFICACION QUE PORTABA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ safeDescripcion(resolvedItem.tipO_IDENTIFICACION) }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">UNIDAD DE INTELIGENCIA QUE ADOPTA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.unidaD_INTELIGENCIA_ADOPTA }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">DETALLE DEL MATERIAL COMPROMETIDO</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.caracteristicaS_MATERIAL }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">DETALLE DEL RESULTADO DE MUERTE</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.detallE_RESULTADO_MUERTE }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">DETALLE DE DOCUMENTACIÓN PERDIDA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.detallE_DOCUMENTACION_PERDIDA }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">AUTORIDAD EXTERNA QUE REQUIERE INFORMACION</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.autoridaD_REQUIERE_INFO }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">MEDIDAS ADOPTADAS RESPECTO A FAMILIARES</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.medidaS_ADOPTADAS_FAMILIARES }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">SINTESIS DE LOS MEDIOS DE PRENSA</v-col>
                <v-col cols="12" md="8" class="report-section-value">{{ resolvedItem.sintesiS_MEDIOS_PRENSA }}</v-col>
                <v-col cols="12" md="4" class="report-section-label">ARMAMENTO</v-col>
                <v-col cols="12" md="8" class="report-section-value">
                  {{ resolvedItem.portabA_ARMA === 'S' ? 'Portaba ' : resolvedItem.portabA_ARMA === 'N' ? 'No portaba arma' : '' }}
                  {{ safeDescripcion(resolvedItem.tipO_ARMAMENTO) }}
                  {{ resolvedItem.armA_FISCAL_PARTICULAR === 'F' ? 'Fiscal' : resolvedItem.armA_FISCAL_PARTICULAR === 'P' ? 'Particular' : '' }}
                  {{ resolvedItem.detallE_PORTE_ARMA }}
                </v-col>
                <v-col cols="12" md="4" class="report-section-label">INVESTIGACIÓN</v-col>
                <v-col cols="12" md="8" class="report-section-value">
                  {{ resolvedItem.realizA_INVESTIGACION === 'S' ? 'Se realiza investigación : ' : resolvedItem.realizA_INVESTIGACION === 'N' ? 'No se realiza investigación : ' : '' }}
                  {{ safeDescripcion(resolvedItem.tipO_INVESTIGACION) }}
                  {{ resolvedItem.detallE_INVESTIGACION }}
                </v-col>
              </v-row>
            </v-card>
          </div>
          <aside v-if="getBubbles(sectionOrdinals.datosAdicionales).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.datosAdicionales) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.datosAdicionales)"
              :key  = "bubble.key"
              outlined
              class = "report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.entries[index].title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.entries[index].cantidad > 1 ? bubble.entries[index].cantidad : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>          
        </div>
<!-- Report Section: Involucrados -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.involucrados }}</v-chip>
              <span class="report-section-title">INVOLUCRADOS</span>
            </div>
            <v-data-table
              :headers="headersInvolved"
              :items="itemsInvolved"
              class="report-table elevation-0 mt-3"
              disable-pagination
              hide-default-footer
              hide-default-header
            >
              <template v-slot:header="{ props: { headers } }">
                <thead class="report-table-head">
                  <tr>
                    <th v-for="h in headers" :key="h.value" :class="h.class">
                      <span>{{ h.text }}</span>
                    </th>
                  </tr>
                </thead>
              </template>
              <template v-slot:item.nombre="{ item }">
                {{ getInvolvedName(item) }}
              </template>
              <template v-slot:no-data>
                <div class="report-empty-state">
                  <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado involucrados registrados en el sistema
                </div>
              </template>
            </v-data-table>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.involucrados).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.involucrados) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.involucrados)"
              :key="bubble.key"
              outlined
              class="report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span >{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.quantity > 1 ? bubble.quantity : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Procedimiento Policial -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.procedimientoPolicial }}</v-chip>
              <span class="report-section-title">PROCEDIMIENTO POLICIAL</span>
            </div>
            <v-data-table
              :headers="headersPoliceProcedure"
              :items="itemsPoliceProcedure"
              class="report-table elevation-0 mt-3"
              disable-pagination
              hide-default-footer
              hide-default-header
            >
              <template v-slot:header="{ props: { headers } }">
                <thead class="report-table-head">
                  <tr>
                    <th v-for="h in headers" :key="h.value" :class="h.class">
                      <span>{{ h.text }}</span>
                    </th>
                  </tr>
                </thead>
              </template>
              <template v-slot:item.fechA_PROCEDIMIENTO_POL="{ item }">
                {{ getFormatDateTime(item.fechA_PROCEDIMIENTO_POL, 'date') }}
              </template>
              <template v-slot:no-data>
                <div class="report-empty-state">
                  <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado procedimientos policiales registrados en el sistema
                </div>
              </template>
            </v-data-table>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.procedimientoPolicial ).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.procedimientoPolicial) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.procedimientoPolicial)"
              :key="bubble.key"
              outlined
              class="report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.quantity > 1 ? bubble.quantity : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Antecedentes Judiciales -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.antecedentesJudiciales }}</v-chip>
              <span class="report-section-title">ANTECEDENTES JUDICIALES</span>
            </div>
            <v-data-table
              :headers="headersJudicialRecord"
              :items="itemsJudicialRecord"
              class="report-table elevation-0 mt-3"
              disable-pagination
              hide-default-footer
              hide-default-header
            >
              <template v-slot:header="{ props: { headers } }">
                <thead class="report-table-head">
                  <tr>
                    <th v-for="h in headers" :key="h.value" :class="h.class">
                      <span>{{ h.text }}</span>
                    </th>
                  </tr>
                </thead>
              </template>
              <template v-slot:item.fechA_ANTECEDENTES_JUD="{ item }">
                {{ getFormatDateTime(item.fechA_ANTECEDENTES_JUD, 'date') }}
              </template>
              <template v-slot:no-data>
                <div class="report-empty-state">
                  <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado antecedentes judiciales registrados en el sistema
                </div>
              </template>
            </v-data-table>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.antecedentesJudiciales ).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.antecedentesJudiciales) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.antecedentesJudiciales)"
              :key="bubble.key"
              outlined
              class="report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.quantity > 1 ? bubble.quantity : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Archivos Informes -->
        <div class="report-section-with-changes mb-4">
          <v-card flat class="report-section mb-4">
            <div class="report-section-header">
              <v-chip small label class="report-chip">{{ sectionOrdinals.archivosInformes }}</v-chip>
              <span class="report-section-title">ARCHIVOS INFORMES</span>
            </div>
            <v-data-table
              :headers="headersReportFolders"
              :items="itemsReportFolders"
              class="report-table elevation-0 mt-3"
              disable-pagination
              hide-default-footer
              hide-default-header
            >
              <template v-slot:header="{ props: { headers } }">
                <thead class="report-table-head">
                  <tr>
                    <th v-for="h in headers" :key="h.value" :class="h.class">
                      <span>{{ h.text }}</span>
                    </th>
                  </tr>
                </thead>
              </template>
              <template v-slot:item.fechA_ARCHIVO="{ item }">
                {{ getFormatDateTime(item.fechA_ARCHIVO, 'date') }}
              </template>
              <template v-slot:no-data>
                <div class="report-empty-state">
                  <v-icon small class="mr-2">mdi-information-outline</v-icon>
                  No se han encontrado archivos de informes registrados en el sistema
                </div>
              </template>
            </v-data-table>
          </v-card>
          <aside v-if="getBubbles(sectionOrdinals.archivosInformes ).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.archivosInformes) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.archivosInformes)"
              :key="bubble.key"
              outlined
              class="report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.quantity > 1 ? bubble.quantity : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>
        </div>
<!-- Report Section: Ampliación del Informe -->
        <div class="report-section-with-changes mb-4">
          <div v-show="tipoInforme === 'Incidente' || tipoInforme === 'Final'">
            <v-card flat class="report-section mb-4">
              <div class="report-section-header">
                <v-chip small label class="report-chip">{{ sectionOrdinals.ampliacionInforme }}</v-chip>
                <span class="report-section-title">AMPLIACIÓN DEL INFORME</span>
              </div>
              <v-data-table
                :headers="headersSupplementaryReport"
                :items="itemsSupplementaryReport"
                class="report-table elevation-0 mt-3"
                disable-pagination
                hide-default-footer
                hide-default-header
            >
                <template v-slot:header="{ props: { headers } }">
                  <thead class="report-table-head">
                    <tr>
                      <th v-for="h in headers" :key="h.value" :class="h.class">
                        <span>{{ h.text }}</span>
                      </th>
                    </tr>
                  </thead>
                </template>
                <template v-slot:item.fechA_AMPLIACION="{ item }">
                  {{ getFormatDateTime(item.fechA_AMPLIACION, 'date') }}
                </template>
                <template v-slot:no-data>
                  <div class="report-empty-state">
                    <v-icon small class="mr-2">mdi-information-outline</v-icon>
                    No se han encontrado ampliaciones de informes registradas en el sistema
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </div>
          <aside v-show="['Incidente', 'Final'].includes(tipoInforme)" v-if="getBubbles(sectionOrdinals.ampliacionInforme ).length" class="report" :class="{ 'report-single': isSingleBubble(sectionOrdinals.ampliacionInforme) }">
            <v-card
              v-for="bubble in getBubbles(sectionOrdinals.ampliacionInforme)"
              :key="bubble.key"
              outlined
              class="report-bubble pa-4"
              :class="{ 'report-bubble-multiple': getBubbleParts(bubble).length > 1 }"
            >
              <div class="word-diff-container line-height-relaxed">
                <template v-for="(part, index) in getBubbleParts(bubble)">
                  <hr v-if="index" :key="`separator-${index}`" class="report-separator">
                  <span>{{ part }}</span>
                  <v-btn
                    text
                    small
                    color="primary"
                    class="report-details-link"
                    @click="openEventDetails(bubble.entries[index], bubble.title)"
                  >
                    <v-icon left small>mdi-eye-plus-outline</v-icon>
                    Ver {{ bubble.quantity > 1 ? bubble.quantity : '' }} más
                  </v-btn>
                </template>
              </div>
            </v-card>
          </aside>           
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="eventDialog" max-width="900">
      <v-card class="event-detail-card">
        <v-card-title>
          Historial de cambios
          <v-spacer></v-spacer>
          <v-btn icon aria-label="Cerrar detalle" class="event-detail-close" @click="eventDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle>
          {{ titleEventDetails }}
        </v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text class="event-detail-content">
          <v-container fluid>
          <v-data-table
            :headers = "headersEvent"
            :items   = "itemEventDetails"
            class    = "event-detail-table "
            disable-pagination
            hide-default-footer
          >
          <template v-slot:item.modificadO_FECHA = "{ item }">
            <div> {{ getFormatDateTime(item.modificadO_FECHA, 'date') }}</div>
            <div> {{ getFormatDateTime(item.modificadO_FECHA, 'time') }}</div>
          </template>
          <template v-slot:item.tipO_EVENTO = "{ item }">
            <div>
              <v-chip 
                class  =	"custom-chip my-2"
                outlined
                :color =	"customChipColor(item.tipO_EVENTO)"
              >
                {{customChipText(item.tipO_EVENTO)}}
              </v-chip>
            </div>
          </template>	          
            <template v-slot:item.valoR_ANTERIOR="{ item }">
              <div>{{ customValue(item.valoR_ANTERIOR) }}</div>
            </template>
            <template v-slot:item.valoR_NUEVO="{ item }">
              <div>{{ customValue(item.valoR_NUEVO) }}</div>
            </template>
          </v-data-table>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'reportView',
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    icon: {
      type: String,
      default: ''
    },
    titles: {
      type: Object,
      default: () => ({ title: '', subtitle: '' })
    },
    tipoInforme: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      bubbles                    : [],
      showBubbles                : true,
    
      eventDialog                : false,
      itemEventDetails           : {},
      titleEventDetails          : '',
      sectionOrdinals            : {
        lugar                  : '01',
        circunstancias         : '02',
        danos                  : '03',
        medidas                : '04',
        datosAdicionales       : '05',
        involucrados           : '06',
        procedimientoPolicial  : '07',
        antecedentesJudiciales : '08',
        archivosInformes       : '09',
        ampliacionInforme      : '10'
      },
      fieldOrdinals: {
        LUGAR_HECHO                     : '01',
        CIRCUNSTANCIA_HECHO             : '02',
        DANOS_PERSONALES                : '03',
        MEDIDAS_ADOPTADAS               : '04',

        ESPECIFICACION_VESTUARIO        : '05',
        TIPO_IDENTIFICACIONID           : '05',
        UNIDAD_INTELIGENCIA_ADOPTA      : '05',
        CARACTERISTICAS_MATERIAL        : '05',
        DETALLE_RESULTADO_MUERTE        : '05',
        DETALLE_DOCUMENTACION_PERDIDA   : '05',
        AUTORIDAD_REQUIERE_INFO         : '05',
        MEDIDAS_ADOPTADAS_FAMILIARES    : '05',
        SINTESIS_MEDIOS_PRENSA          : '05',
        PORTABA_ARMA                    : '05',
        TIPO_ARMAMENTOID                : '05',
        ARMA_FISCAL_PARTICULAR          : '05',        
        DETALLE_PORTE_ARMA              : '05',        
        REALIZA_INVESTIGACION           : '05',
        TIPO_INVESTIGACIONID            : '05',
        DETALLE_INVESTIGACION           : '05'
      },
      textSections     : {
        INCIDENTE_ACCIDENTE           : 'INCIDENTE O ACCIDENTE',
        PERSONAL_UNIDAD               : 'PERSONAL O UNIDAD',

        TIPO_INCIDENTEID              : 'TIPO DE INCIDENTE', 
        UNIDAD_AFECTADA               : 'UNIDAD DEL INCIDENTE'  , 
        FECHA_HECHO                   : 'FECHA Y HORA DEL HECHO' , 
        TIPO_INGESTAID                : 'INGESTA DE ALCOHOL', 
        RUT_INFORMANTE                : 'INFORMADO POR', 
        UNIDAD_INFORMANTE             : 'UNIDAD DEL INFORMANTE',
        FECHA_INFORMANTE              : 'FECHA Y HORA DE INFORME',

        ESPECIFICACION_VESTUARIO      : 'VESTUARIO',
        TIPO_IDENTIFICACIONID         : 'TIPO DE IDENTIFICACIÓN QUE PORTABA',
        UNIDAD_INTELIGENCIA_ADOPTA    : 'UNIDAD DE INTELIGENCIA QUE ADOPTA',
        CARACTERISTICAS_MATERIAL      : 'DETALLE DEL MATERIAL COMPROMETIDO',
        DETALLE_RESULTADO_MUERTE      : 'DETALLE DEL RESULTADO DE MUERTE',
        DETALLE_DOCUMENTACION_PERDIDA : 'DETALLE DE  DOCUMENTACIÓN PERDIDA',
        AUTORIDAD_REQUIERE_INFO       : 'AUTORIDAD EXTERNA QUE REQUIERE INFORMACIÓN',
        MEDIDAS_ADOPTADAS_FAMILIARES  : 'MEDIDAS ADOPTADAS RESPECTO A FAMILIARES',
        SINTESIS_MEDIOS_PRENSA        : 'SÍNTESIS DE LOS MEDIOS DE PRENSA',
        PORTABA_ARMA                  : 'ARMAMENTO (portaba)',
        TIPO_ARMAMENTOID              : 'ARMAMENTO (tipo)',
        ARMA_FISCAL_PARTICULAR        : 'ARMAMENTO (fiscal / particular)',
        DETALLE_PORTE_ARMA            : 'ARMAMENTO (detalle)',
        REALIZA_INVESTIGACION         : 'INVESTIGACIÓN (realiza)',
        TIPO_INVESTIGACIONID          : 'INVESTIGACIÓN ',
        DETALLE_INVESTIGACION         : 'INVESTIGACIÓN (detalle)'
      },
      headersInvolved            : [
        { text: 'RUN', value: 'ruT_INVOLUCRADO', groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'NOMBRE', value: 'nombre', groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'ALCOHOL/DROGAS', value: 'tipO_CONSUMO.descripcion', groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'SALUD', value: 'estadO_SALUD.descripcion', groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'UNIDAD', value: 'u_INVOLUCRADO.sigla', groupable: false, sortable: false, class: 'my-header-style' }
      ],
      headersPoliceProcedure     : [
        { text: 'FECHA'        , value: 'fechA_PROCEDIMIENTO_POL'       , groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'PROCEDIMIENTO', value: 'detallE_PROCEDIMIENTO_POL'     , groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'CONDICION'    , value: 'condicioN_POLICIAL.descripcion', groupable: false, sortable: false, class: 'my-header-style' }
      ],
      headersJudicialRecord      : [
        { text: 'FECHA'      , value: 'fechA_ANTECEDENTES_JUD'  , groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'ANTECEDENTE', value: 'detallE_ANTECEDENTES_JUD', groupable: false, sortable: false, class: 'my-header-style' }
      ],
      headersReportFolders       : [
        { text: 'FECHA'      , value: 'fechA_ARCHIVO'      , groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'DESCRIPCIÓN', value: 'descripcioN_ARCHIVO', groupable: false, sortable: false, class: 'my-header-style' }
      ],
      headersSupplementaryReport : [
        { text: 'FECHA'      , value: 'fechA_AMPLIACION', groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'DESCRIPCIÓN', value: 'detallE_AMPLIACION', groupable: false, sortable: false, class: 'my-header-style' }
      ],
      headersEvent               : [
        { text: 'FECHA'         , value: 'modificadO_FECHA', groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'EVENTO'        , value: 'tipO_EVENTO'     , groupable: false, sortable: false, class: 'my-header-style' }, 
        { text: 'VALOR ANTERIOR', value: 'valoR_ANTERIOR'  , groupable: false, sortable: false, class: 'my-header-style' },
        { text: 'NUEVO VALOR'   , value: 'valoR_NUEVO'     , groupable: false, sortable: false, class: 'my-header-style' }

      ],
      itemsInvolved              : [],
      itemsPoliceProcedure       : [],
      itemsJudicialRecord        : [],
      itemsReportFolders         : [],
      itemsSupplementaryReport   : [],
      itemsEventLog              : []
    }
  },
  watch: {
    reportSource: {
      async handler() {
        await this.load()
      },
      immediate: true
    }
  },
  computed: {
    reportSource() {
      return [this.item, this.tipoInforme]
    },
    hasBubbles() {
      return ['00', 'R', ...Object.values(this.sectionOrdinals)].some(section => this.getBubbles(section)?.length > 0)

    },
    resolvedItem() {
      return this.item || {}
    },
    resolvedIcon() {
      if (this.icon) return this.icon
      if (this.tipoInforme === 'Preliminar') return 'mdi-file-powerpoint-outline'
      if (this.tipoInforme === 'Incidente') return 'mdi-file-document-outline'
      return 'mdi-file-sign'
    },
    resolvedTitles() {
      if (this.titles && (this.titles.title || this.titles.subtitle)) {
        return this.titles
      }

      const id = this.resolvedItem.id ? ` ${this.resolvedItem.id}` : ''
      const label = this.tipoInforme === 'Preliminar'
        ? 'Informe Preliminar'
        : this.tipoInforme === 'Incidente'
          ? 'Informe Incidente'
          : 'Informe Final'

      return {
        title: `${label}${id}`,
        subtitle: ''
      }
    },
    informanteCompleto() {
      const informante      = this.resolvedItem.informante || this.resolvedItem.u_INFORMANTE || this.resolvedItem.informantE_PRE || {}
      const nombres         = informante.nombres || informante.nombre || ''
      const apellidoPaterno = informante.apellidO_PATERNO || informante.apellidoPaterno || ''
      const apellidoMaterno = informante.apellidO_MATERNO || informante.apellidoMaterno || ''
      return [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ')
    },
    resolutionText() {
      const finales = this.resolvedItem.finales || {}
      return finales.medidaS_DISCIPLINARIAS || this.resolvedItem.medidaS_DISCIPLINARIAS || ''
    }
  },
  methods: {
    async load() {
      let respPoliceProcedure
      let respJudicialRecord
      let respInvolved
      let respArchivosInformes
      let respSupplementaryReport
      let respDisciplinaryMeasures
      let respEventLog

      this.resetReportItems()
      const idInforme = this.getReportId()
      if (!idInforme) {
        return
      }
      try {
        if (this.tipoInforme === 'Preliminar') {
          respPoliceProcedure  = await this.getListProcedimientosPolicialesPreliminares(idInforme)
          respJudicialRecord   = await this.getListAntecedentesJudicialesPreliminares(idInforme)
          respInvolved         = await this.getListInvolucradosPreliminares(idInforme)
          respArchivosInformes = await this.getListArchivosInformesPreliminares(idInforme)
          respEventLog         = await this.getListRegistrosEventosInformesPreliminares(idInforme)
        } else if (this.tipoInforme === 'Incidente') {
          respPoliceProcedure     = await this.getListProcedimientosPolicialesIncidentes(idInforme)
          respJudicialRecord      = await this.getListAntecedentesJudicialesIncidentes(idInforme)
          respInvolved            = await this.getListInvolucradosIncidentes(idInforme)
          respArchivosInformes    = await this.getListArchivosInformesIncidentes(idInforme)
          respSupplementaryReport = await this.getListAmpliacionesInformesIncidentes(idInforme)
          respEventLog            = await this.getListRegistrosEventosInformesIncidentes(idInforme)
        } else if (this.tipoInforme === 'Final') {
          respPoliceProcedure      = await this.getListProcedimientosPolicialesFinales(idInforme)
          respJudicialRecord       = await this.getListAntecedentesJudicialesFinales(idInforme)
          respInvolved             = await this.getListInvolucradosFinales(idInforme)
          respArchivosInformes     = await this.getListArchivosInformesFinales(idInforme)
          respSupplementaryReport  = await this.getListAmpliacionesInformesFinales(idInforme)
          respDisciplinaryMeasures = await this.getListMedidasDisciplinariasInformesFinalesEspecificas(idInforme)
          respEventLog             = await this.getListRegistrosEventosInformesFinales(idInforme)
        }
        if (respPoliceProcedure?.status === 200) {
          this.itemsPoliceProcedure = this.pickArrayFromResponse(respPoliceProcedure, [
            'procedimientos_policiales_inc',
            'procedimientosPoliciales',
            'procedimientos',
            'procedimiento_policial'
          ])
        }
        if (respJudicialRecord?.status === 200) {
          this.itemsJudicialRecord = this.pickArrayFromResponse(respJudicialRecord, [
            'antecedentes_judiciales_inc',
            'antecedentesJudiciales',
            'antecedentes',
            'antecedentes_judiciales'
          ])
        }
        if (respInvolved?.status === 200) {
          this.itemsInvolved = this.pickArrayFromResponse(respInvolved, [
            'involucrados',
            'involucrados_inc',
            'involucradosInc',
            'r_involucrados'
          ])
        }
        if (respArchivosInformes?.status === 200) {
          this.itemsReportFolders = this.pickArrayFromResponse(respArchivosInformes, [
            'archivos_informes_inc',
            'archivosInformes',
            'archivos',
            'archivos_informes'
          ])
        }
        if (respSupplementaryReport?.status === 200) {
          this.itemsSupplementaryReport = this.pickArrayFromResponse(respSupplementaryReport, [
            'ampliaciones_informe_inc',
            'ampliacionesInforme',
            'ampliaciones',
            'ampliaciones_informe'
          ])
        }
        if (respDisciplinaryMeasures?.status === 200) {
          this.itemsDisciplinaryMeasures = this.pickArrayFromResponse(respDisciplinaryMeasures, [
            'medidasAdoptadasDelInforme',
          ])
        }
        if (respEventLog?.status === 200) {
          if ( respEventLog?.data) {
            this.loadBubbles(respEventLog.data)
          }
        }
      } catch (error) {
        console.error('Error al cargar datos para el reporte:', error)
      }
    },
    loadBubbles (data) {
      this.addBubblesInformes(data.eventosPRELIMINARESPorConcepto,'PRE')
      this.addBubblesInformes(data.eventosINCIDENTESPorConcepto  ,'INC')  
      this.addBubblesInformes(data.eventosFINALESPorConcepto     ,'FIN')

      this.addBubblesSupplementary(data.eventosINVOLUCRADOS, data.cantidadEventosINVOLUCRADOS, '06', 'INV', '000')
      this.addBubblesSupplementary(data.eventosPOLICIALES  , data.cantidadEventosPOLICIALES  , '07', 'POL', '000')
      this.addBubblesSupplementary(data.eventosJUDICIALES  , data.cantidadEventosJUDICIALES  , '08', 'JUD', '000')
      this.addBubblesSupplementary(data.eventosARCHIVOS    , data.cantidadEventosARCHIVOS    , '09', 'ARC', '000')
      this.addBubblesSupplementary(data.eventosARCHIVOS    , data.cantidadEventosARCHIVOS    , '10', 'AMP', '000')
    },    
    pickArrayFromResponse(response, keys = []) {
      if (!response || !response.data) return []
      if (Array.isArray(response.data.respuesta)) {
        return response.data.respuesta
      }
      for (const key of keys) {
        if (Array.isArray(response.data[key])) {
          return response.data[key]
        }
      }
      return []
    },
    getBubbleParts(bubble) {
      if (Array.isArray(bubble.entries)) {
        return bubble.entries.map(entry => entry.text)
      }
      return bubble.text.split('────────────────────────\n')
    },
    getBubbles(section) {
      return this.bubbles.filter(bubble => bubble.section === section)
    },
    isSingleBubble(section) {
      const bubbles = this.getBubbles(section)
      return bubbles.length === 1 && this.getBubbleParts(bubbles[0]).length === 1
    },
    async openEventDetails(entry, title) {
      const resp = await this.getListDetalleRegistrosEventosInformes({
        tipoInforme     : this.tipoInforme.substring(0, 1),
        tipoInformeId   : this.getReportId(),
        tipoAntecedente : entry.tipo,
        concepto        : entry.concepto
      })
      if ( resp?.data.listaDetalleDeEventos ) {

        if ( ['INCIDENTE_ACCIDENTE', 'PERSONAL_UNIDAD', 'PORTABA_ARMA', 'ARMA_FISCAL_PARTICULAR', 'REALIZA_INVESTIGACION'].includes(entry.concepto)) {
        const conceptoMap = {
          '\"I\"' : 'INCIDENTE',
          '\"A\"' : 'ACCIDENTE',
          '\"F\"' : 'FISCAL',
          '\"P\"' : entry.concepto === 'PERSONAL_UNIDAD' ? 'PERSONAL' : 'PARTICULAR',
          '\"U\"' : 'UNIDAD',
          '\"S\"' : 'SI',
          '\"N\"' : 'NO'
        }
        let items
        items = resp.data.listaDetalleDeEventos.map(e => {
          return { ...e, valoR_ANTERIOR: conceptoMap[e.valoR_ANTERIOR], valoR_NUEVO: conceptoMap[e.valoR_NUEVO]  }
        })
        this.itemEventDetails = items
        } else {
          this.itemEventDetails  = resp.data.listaDetalleDeEventos
        }
        this.titleEventDetails = title
        this.eventDialog       = true        
      }
    },
    getEventLabel(eventType) {
      if (eventType === 'I') return 'Ingreso'
      if (eventType === 'M') return 'Modificación'
      if (eventType) return 'Eliminación'
      return 'Sin tipo'
    },
    getReportId() {
      return this.resolvedItem.id || this.resolvedItem.incidentesid || this.resolvedItem.incidentesId || this.resolvedItem.incidenteS_ID || null
    },
    loadBubbles (data) {
      this.addBubblesInformes(data.eventosPRELIMINARESPorConcepto,'PRE')
      this.addBubblesInformes(data.eventosINCIDENTESPorConcepto  ,'INC')  
      this.addBubblesInformes(data.eventosFINALESPorConcepto     ,'FIN')

      this.addBubblesSupplementary(data.eventosINVOLUCRADOS, data.cantidadEventosINVOLUCRADOS, '06', 'INV', '000', 'INVOLUCRADOS')
      this.addBubblesSupplementary(data.eventosPOLICIALES  , data.cantidadEventosPOLICIALES  , '07', 'POL', '000', 'PROCEDIMIENTO POLICIAL')
      this.addBubblesSupplementary(data.eventosJUDICIALES  , data.cantidadEventosJUDICIALES  , '08', 'JUD', '000', 'ANTECEDENTES JUDICIALES')
      this.addBubblesSupplementary(data.eventosARCHIVOS    , data.cantidadEventosARCHIVOS    , '09', 'ARC', '000', 'ARCHIVOS INFORMES')
      this.addBubblesSupplementary(data.eventosAMPLIACIONES, data.cantidadEventosAMPLIACIONES , '10', 'AMP', '000', 'AMPLIACIONES INFORMES')
    },
    addBubblesInformes(data, tipo) {
      if (!data) {
        return  
      }
      let text    = ''    
      let section = ''
      for (const [index, evento] of data.entries()) {
        section = this.fieldOrdinals[evento.concepto] || (evento.concepto === 'MEDIDAS_DISCIPLINARIAS' ? 'R' : '00')
        text    =  ` · Se ${evento.primerRegistro.tipO_EVENTO==='I' ? 'ingresa' : evento.primerRegistro.tipO_EVENTO==='M' ? 'modifica' : 'elimina'} `   
                    + `con fecha ${this.getFormatDateTime(evento.primerRegistro.actualizacion, 'date')} a las ${this.getFormatDateTime(evento.primerRegistro.actualizacion, 'time')} hrs.`
                    + ` ${this.textSections[evento.primerRegistro.concepto] || ''} \n`
        let bubble = this.bubbles.find(item => item.section === section)
        if (!bubble) {
          bubble = {
            key     : section,
            section : section,
            entries : [],
            quantity: 0,
          }
          this.bubbles.push(bubble)
        }
        bubble.quantity += evento.cantidad || 0
        bubble.entries.push({
          key      : `${section}-${index}`,
          text     : text,
          tipo     : tipo,
          concepto : evento.concepto,
          cantidad : evento.cantidad || 0,
          title   : this.textSections[evento.primerRegistro.concepto]             
        })
      }
    },    
    addBubblesSupplementary(data, cantidadEventos, idOrdinal, tipo, concepto, title) {
      if (!data) return
      let text = ''
      if ( tipo === 'INV') {
        text =  ` · Se ${data.tipO_EVENTO==='I' ? 'ingresa' : data.tipO_EVENTO==='M' ? 'modifica' : 'elimina'} `   
                + ` run : ${data.usuario} `
                + `con fecha ${this.getFormatDateTime(data.actualizacion, 'date')} a las ${this.getFormatDateTime(data.actualizacion, 'time')} hrs.\n`
      } else {
        text =  ` · Se ${data.tipO_EVENTO==='I' ? 'ingresa ' + `${data.valoR_NUEVO.replace(/[\\"]/g, '')}` : 
                data.tipO_EVENTO==='M' ? 'modifica ' + `${data.valoR_ANTERIOR.replace(/[\\"]/g, '')}` : 
                'elimina ' + `${data.valoR_NUEVO.replace(/[\\"]/g, '')}` } `   
                + `con fecha ${this.getFormatDateTime(data.actualizacion, 'date')} a las ${this.getFormatDateTime(data.actualizacion, 'time')} hrs.\n`
      }
      let bubble = {
        key     : idOrdinal,
        section : idOrdinal,
        title   : title,
        entries : [{
          key      : `${idOrdinal}-0`,
          text     : text,
          tipo     : tipo,
          concepto : concepto,
        }],
        quantity: cantidadEventos
      }
      this.bubbles.push(bubble)
    },
    resetReportItems() {
      this.itemsInvolved             = []
      this.itemsPoliceProcedure      = []
      this.itemsJudicialRecord       = []
      this.itemsReportFolders        = []
      this.itemsSupplementaryReport  = []
      this.itemsDisciplinaryMeasures = []
      this.itemsEventLog             = []
      this.bubbles                   = []
    },
    getInvolvedName(item) {
      const involved = item && (item.r_INVOLUCRADO || item.involucrado || item.persona || {})
      const nombres = involved.nombres || involved.nombre || ''
      const apellidoPaterno = involved.apellidO_PATERNO || involved.apellidoPaterno || ''
      const apellidoMaterno = involved.apellidO_MATERNO || involved.apellidoMaterno || ''
      return [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ')
    },
    safeDescripcion(value) {
      if (!value) return ''
      if (typeof value === 'string') return value
      return (value.descripcion || value.name || value.nombre || '')
    },
    getFormatDateTime(datetime, part) {
      if (!datetime) return ''
      const normalized = typeof datetime === 'string' ? datetime : String(datetime)
      const [datePart = '', timePart = ''] = normalized.split(/[ T]/)
      if (!datePart) return ''
      const [year = '', month = '', day = ''] = datePart.split('-')
      const dateFormatted = year && month && day ? `${day}/${month}/${year}` : datePart
      const timeFormatted = timePart ? timePart.slice(0, 5) : ''
      if (part === 'date') return dateFormatted
      if (part === 'time') return timeFormatted
      return `${dateFormatted} ${timeFormatted}`.trim()
    },
      customChipColor(value) {
        return value === 'I' ? 'success' : ( value === 'M' ? 'info' : (value === 'E' ? 'primary' : 'secondary'))
      },
      customChipText(value) {
        return value === 'I' ? 'Ingreso' : (value === 'M' ? 'Modificación' : ( value === 'E' ? 'Eliminación' : 'Desconocido'))
      },    
      customValue(value) {
        if (value === null || value === undefined || value === '') return ''
        if (typeof value === 'string') {
          const normalized = value.trim().replace(/^"(.*)"$/, '$1')
          if ( normalized === null || normalized === 'null') return ''
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
            return this.getFormatDateTime(normalized)
          }
          return normalized.replace(/\\n/g, '\n')
        }
        return String(value)
      },
    ...mapActions('procedimientosPolicialesStore', [
      'getListProcedimientosPolicialesPreliminares',
      'getListProcedimientosPolicialesIncidentes',
      'getListProcedimientosPolicialesFinales',
    ]),
    ...mapActions('antecedentesJudicialesStore', [
      'getListAntecedentesJudicialesPreliminares',
      'getListAntecedentesJudicialesIncidentes',
      'getListAntecedentesJudicialesFinales'
    ]),
    ...mapActions('involucradosStore', [
      'getListInvolucradosPreliminares',
      'getListInvolucradosIncidentes',
      'getListInvolucradosFinales'
    ]),
    ...mapActions('archivosInformesStore', [
      'getListArchivosInformesPreliminares',
      'getListArchivosInformesIncidentes',
      'getListArchivosInformesFinales'
    ]),
    ...mapActions('ampliacionesInformesStore', [
      'getListAmpliacionesInformesIncidentes',
      'getListAmpliacionesInformesFinales'
    ]),
    ...mapActions('finalesStore', [
        'getListMedidasDisciplinariasInformesFinalesEspecificas'
    ]),
    ...mapActions('registroEventosStore', [
      'getListRegistrosEventosInformesPreliminares',
      'getListRegistrosEventosInformesIncidentes',
      'getListRegistrosEventosInformesFinales',
      'getListDetalleRegistrosEventosInformes'
    ]),
  }
}
</script>

<style scoped>
.report-preview-card {
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #f2f3f5 0%, #e6e8eb 100%);
}

.report-toolbar {
  background: linear-gradient(120deg, #3b4148 0%, #252a31 100%) !important;
  min-height: 72px;
}

.report-toolbar-avatar {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.report-toolbar-title {
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #f4f6f8;
}

.report-toolbar-subtitle {
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  line-height: 1.2;
}

.report-close-btn {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 10px;
}

.report-content {
  --report-columns: minmax(0, 1fr);
  display: grid;
  grid-template-columns: var(--report-columns);
  align-items: start;
  column-gap: 16px;
  padding: 20px 24px 12px 24px;
}

.report-content-with-changes {
  --report-columns: minmax(0, 1fr) minmax(260px, 300px);
}

.report-content:not(.report-content-with-changes) .report {
  display: none;
}

.report-content > * {
  grid-column: 1;
  min-width: 0;
}

.report-content > .report-section-with-changes {
  position: relative;
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: var(--report-columns);
  align-items: start;
  gap: 16px;
}

.report-section-with-changes > * {
  min-width: 0;
}

.report {
  position: absolute;
  grid-column: 2;
  grid-row: 1;
  inset: 0;
  padding-left: 8px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: hidden;
  overflow-y: auto;
}

.report-single {
  position: static;
  grid-column: 2;
  grid-row: 1;
  inset: auto;
  align-self: start;
  overflow: visible;
}

.report-section {
  background: #f9fafb;
  border: 1px solid #d2d7de;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 6px 20px rgba(29, 33, 37, 0.08);
}

.report-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-chip {
  background: #4a515a !important;
  color: #fff !important;
  font-weight: 700;
  min-width: 28px;
  justify-content: center;
}

.report-section-title {
  color: #2f353d;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.report-section-label {
  color: #5a626c;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.35px;
}

.report-section-value {
  color: #2b3138;
  font-weight: 500;
  line-height: 1.45;
  word-break: break-word;
}

.report-label {
  color: #5a626c;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.35px;
}

.report-value {
  color: #2b3138;
  font-weight: 500;
  line-height: 1.45;
  word-break: break-word;
  white-space: pre-line;
}

.report-value-text {
  min-width: 0;
}

.report-bubble.v-card {
  position: relative;
  z-index: 2;
  width: 100%;
  flex: 0 0 auto;
  box-sizing: border-box;
  min-width: 0;
  overflow: visible;
  border-color: #f0e2a8;
  border-radius: 12px;
  background: rgba(255, 251, 234, 0.65);
  box-shadow: 0 8px 24px rgba(29, 33, 37, 0.18);
}

.report-bubble-multiple.v-card {
  display: flex;
  flex: 1 1 0;
  min-height: 0;
}

.report-bubble-multiple > .word-diff-container {
  flex: 1 1 auto;
  overflow-y: auto;
}

.report-bubble::before {
  content: '';
  position: absolute;
  top: 20px;
  left: -7px;
  width: 12px;
  height: 12px;
  border-left: 1px solid #f0e2a8;
  border-bottom: 1px solid #f0e2a8;
  background: rgba(255, 251, 234, 0.65);
  transform: rotate(45deg);
}
.word-diff-container {
  min-width: 0;
  max-width: 100%;
  font-weight: 300;
  font-size: 0.8rem;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.report-details-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.report-details-link {
  min-width: 0;
  max-width: 100%;
  height: auto;
  margin: 0;
  padding: 0 10px;
  border: 1px solid rgba(117, 99, 31, 0.25);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55) !important;
  box-shadow: none;
  text-transform: none !important;
  letter-spacing: normal;
  font-weight: 400;
  font-size: 0.72rem;
  white-space: normal;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.report-details-link:hover {
  border-color: rgba(117, 99, 31, 0.45);
  background: rgba(255, 248, 220, 0.9) !important;
}

.report-details-link:focus-visible {
  outline: 2px solid rgba(117, 99, 31, 0.55);
  outline-offset: 2px;
}

.report-detail-value {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: inherit;
}

.report-separator {
  border: 0;
  border-top: 1px solid #f0e2a8;
  margin: 8px 0;
}

.report-resolution {
  position: relative;
  padding: 14px 16px 16px;
  border: 1px solid #cfd8b5;
  border-left: 3px solid #6f8440;
  background: linear-gradient(145deg, #fcfdf8 0%, #f3f7e8 100%);
  box-shadow: 0 10px 24px rgba(76, 94, 42, 0.14);
}

.report-resolution-header {
  align-items: center;
  gap: 10px;
}

.report-resolution-avatar {
  background: #6f8440;
  color: #fff;
  box-shadow: 0 6px 14px rgba(76, 94, 42, 0.28);
}

.report-resolution-heading {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.report-resolution-title {
  font-size: 0.80rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #5d7330;
  text-transform: uppercase;
  line-height: 1;
}

.report-resolution-subtitle {
  color: #6d7f46;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.report-measures-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: #5d7330;
  font-size: 0.8rem;
  font-weight: 700;
}

.report-measures-heading-icon {
  color: #6f8440;
}

.report-resolution-body {
  position: relative;
  padding: 10px 12px 10px 28px;
  border: 1px solid #d7e0bf;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
}

.report-measures-body {
  padding: 6px 10px;
}

.disciplinary-measures-list {
  padding: 0;
  background: transparent;
}

.disciplinary-measure-item {
  min-height: 42px;
  padding: 2px 4px;
}

.disciplinary-measure-item:not(:last-child) {
  border-bottom: 1px solid #e5ebd7;
}

.disciplinary-measure-avatar {
  margin: 0 12px 0 0;
  background: #e9efdc;
  color: #66803a;
}

.disciplinary-measure-title {
  color: #4f6330;
  font-size: 0.875rem;
  font-weight: 400 !important;
  line-height: 1.4;
  white-space: normal;
}

.disciplinary-measures-empty {
  padding: 8px 4px;
  color: #74805e;
  font-size: 0.85rem;
}

.report-resolution-quote {
  position: absolute;
  left: 8px;
  top: 9px;
  color: #7d8f53;
}

.report-resolution-value {
  color: #4f6330;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.6;
}

.report-additional {
  padding: 12px 14px;
  background: #f9fafb;
  border-color: #d2d7de;
}

.report-additional .report-section-header {
  margin-bottom: 6px;
}

.report-additional-row {
  row-gap: 2px;
}

.report-additional-row > .col,
.report-additional-row > [class*='col-'] {
  padding-top: 4px;
  padding-bottom: 4px;
}

.report-additional .report-section-label {
  font-size: 10.5px;
  letter-spacing: 0.28px;
  color: #5a626c;
  font-weight: 700;
  align-self: center;
}

.report-additional .report-section-value {
  font-size: 13px;
  line-height: 1.36;
  color: #2b3138;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #d2d7de;
  border-radius: 10px;
  padding: 7px 10px;
  min-height: 34px;
}

.report-table {
  border: 1px solid #d4d9e0;
  border-radius: 10px;
  overflow: hidden;
  background: #f6f8fa;
}

.report-table-head th {
  background: #e7ebf0;
  color: #39424c;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  padding: 10px 12px;
  border-bottom: 1px solid #cfd5dd;
}

.report-table ::v-deep tbody tr:nth-child(even) {
  background: #edf1f5;
}

.report-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a646f;
  padding: 16px;
  font-size: 13px;
}

.event-detail-card {
  border-radius: 12px;
}

.event-detail-content {
  padding: 20px 22px 24px;
}

.event-detail-table {
  overflow: hidden;
  border: 1px solid #d9dee4;
  border-radius: 8px;
}

.event-detail-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
}

.event-detail-table ::v-deep thead th {
  height: 46px;
  padding: 0 14px;
  color: #505a64;
  background: #f0f3f5;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.event-detail-table ::v-deep tbody td {
  min-width: 110px;
  padding: 14px;
  color: #343b43;
  font-size: 0.82rem;
  vertical-align: top;
  white-space: pre-line;
}



.event-value {
  display: block;
  min-width: 120px;
  max-width: 260px;
  padding: 8px 10px;
  border-left: 3px solid;
  border-radius: 3px;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.event-value-previous {
  border-color: #c77970;
  background: #fcf1ef;
}

.event-value-new {
  border-color: #70977b;
  background: #eff6f0;
}

.event-detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  color: #66717c;
  font-size: 0.85rem;
}
/* Custom chip styling */
  .custom-chip {
    font-size: 0.85rem;
    font-weight: 300;
    border-radius: 50px;
    min-width: 120px;
    justify-content: center;
  
}

</style>
