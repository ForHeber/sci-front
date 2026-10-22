<template>
  <v-container fluid :class="['dashboard-pme pa-4 pa-md-6', { 'dashboard-pme--dark': $vuetify.theme.dark }]">
    <v-row>
      <v-col cols="12">
        <div class="hero-panel">
          <div class="hero-copy">
            <p class="hero-eyebrow mb-2">Comandante</p>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-3">
              Informes Finales de incidentes de seguridad
            </h1>
            <p class="text-body-2 text-md-subtitle-2 mb-5 hero-description">
              Bienvenido al módulo de gestión de incidentes de seguridad. Aquí podrás gestionar los incidentes reportados en la institución hacia su unidad, determinando las acciones correspondientes.
            </p>            
            <div class="d-flex flex-wrap" style="gap: 12px;">
              <v-btn 
                color ="primary" 
                outlined
                @click ="$router.push({ name: 'incidentesCDTE' })"
              >
                <v-icon left>mdi-file-replace-outline</v-icon>
                Incidentes
              </v-btn>							
              <v-btn 
                color ="primary" 
                outlined
                @click ="$router.push({ name: 'finalesCDTE' })"
              >
                <v-icon left>mdi-file-sign</v-icon>
                Finales
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="card in statsCards"
        :key="card.title"
        cols="12"
        md="6"
        class="d-flex"
      >
        <v-card class="stats-card stats-group" outlined>
          <v-card-text class="stats-content">
            <div class="stats-header mb-3">
              <v-avatar size="32" :color="card.iconBg">
                <v-icon size="18" :color="card.iconColor">{{ card.icon }}</v-icon>
              </v-avatar>
              <h2 class="stats-group-title">{{ card.title }}</h2>
              <div class="stats-header-summary">
                <strong class="stats-header-value">{{ card.items[0].value }}</strong>
                <span class="stats-header-label">A la fecha</span>
              </div>
            </div>
            <v-divider />
            <div class="stats-highlight my-2">
              <span class="stats-highlight-label">{{ card.items[1].title }}</span>
              <span class="stats-value stats-value-total">{{ card.items[1].value }}</span>
            </div>
            <v-divider />
            <div v-for="item in card.items.slice(2)" :key="item.title" class="stats-metric">
              <span class="stats-metric-label text--secondary">{{ item.title }}</span>
              <span class="text--primary stats-value">{{ item.value }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="main-card mb-4" outlined>
          <v-card-title>
            <p class="text-h6 mb-0">Actividad reciente</p>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div class="activity-columns">
            <div v-for="list in activityLists" :key="list.key" class="activity-column">
              <h3 class="text-subtitle-1 font-weight-medium mb-3">
                Últimos {{ list.items.length }} {{ list.title }}
              </h3>
            <p v-if="!list.items.length" class="text-body-2 text--secondary mb-0">
              No hay {{ list.title }} recientes.
            </p>
            <v-timeline v-else dense align-top>
              <v-timeline-item
                v-for="(event, index) in list.items"
                :key="index"
                :color="event.color"
                small
              >

                <div class="font-weight-medium activity-title">{{ event.title }}</div>
                <div class="text-caption text--secondary">{{ event.time }} 
                  <span :class="`${event.color}--text`"></span>
                  <v-chip
                    :color="event.color"
                    outlined
                    pill
                    small
                    >
                    {{ event.state }}
                  </v-chip>
                </div>
                <div class="mt-1 activity-detail">{{ event.detail }}</div>
                <v-divider class="my-2" />
              </v-timeline-item>
            </v-timeline>
            </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="main-card mb-4" outlined>
          <v-card-title>
            <p class="text-h6 mb-0">Accesos rápidos</p>
          </v-card-title>
          <v-divider />
          <v-list dense>
            <v-list-item
              v-for="shortcut in shortcuts"
              :key="shortcut.title"
              class="shortcut-item"
              @click="goToShortcut(shortcut)"
            >
              <v-list-item-icon>
                <v-icon color="primary">{{ shortcut.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ shortcut.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ shortcut.subtitle }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon>
                  <v-icon small>mdi-arrow-right</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="main-card" outlined>
          <v-card-title>
            <p class="text-h6 mb-0">Distribucion por estado</p>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div class="status-table-wrapper">
              <table class="status-table" aria-label="Distribución por estado">
                <thead>
                  <tr>
                    <th scope="col">Estado</th>
                    <th v-for="group in statusGroups" :key="group.key" scope="col">{{ group.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in statusRows" :key="row.label">
                    <th scope="row">{{ row.label }}</th>
                    <td v-for="cell in row.cells" :key="cell.key">
                      <template v-if="cell.item">
                        <div class="status-cell-values">
                          <span class="status-count">{{ cell.item.count }}</span>
                          <span class="status-percentage">({{ cell.item.value }}%)</span>
                        </div>
                        <v-progress-linear
                          :value="cell.item.value"
                          :color="cell.item.color"
                          :aria-label="`${row.label}: ${cell.title}`"
                          rounded
                          height="4"
                        />
                      </template>
                      <span v-else class="text--secondary">-</span>
                    </td>
                  </tr>
                  <tr v-if="!statusRows.length">
                    <td colspan="3" class="text--secondary">Sin datos de distribución.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters } from "vuex"
  export default {

    name       : 'InicioComandancia',
    data       : () => ({
      statsCards      : [],
      shortcuts       : [],
      activity        : { incidentes: [], finales: [] },
      statusBreakdown : { incidentes: [], finales: [] },
    }),
    computed   : {
      ...mapGetters(['currentUser']), 
      activityLists() {
        return [
          { key: 'incidentes', title: 'informes incidentes', items: this.activity.incidentes },
          { key: 'finales', title: 'informes finales', items: this.activity.finales },
        ];
      },
      statusGroups() {
        return [
          { key: 'incidentes', title: 'Incidentes', items: this.statusBreakdown.incidentes },
          { key: 'finales', title: 'Informes finales', items: this.statusBreakdown.finales },
        ];
      },
      statusRows() {
        const labels = [...new Set([
          ...this.statusBreakdown.incidentes,
          ...this.statusBreakdown.finales,
        ].map(item => item.label))];

        return labels.map(label => ({
          label,
          cells: this.statusGroups.map(group => ({
            key: group.key,
            title: group.title,
            item: group.items.find(item => item.label === label),
          })),
        }));
      },
    },
  async mounted() {
    try {
      const respInc     = await this.getEstadisticasIncidentesPorEstados({ idUnidad: this.currentUser.Unidad });
      const resp        = await this.getEstadisticasFinalesPorEstados({ idUnidad: this.currentUser.Unidad });
      const currentYear = new Date().getFullYear();
      this.statsCards = [
        {
          title : 'Incidentes', icon : 'mdi-file-replace-outline', iconBg : '#e8f0fe', iconColor : '#2457a6',
          items : [
            { title : 'Total a la fecha', value : respInc.data.totalIncidentesGeneral },
            { title : 'Total del año ' + currentYear, value : respInc.data.totalIncidentesAgno },
            { title : 'Con informe final del Cdte.', value : respInc.data.totalIncidentesConInformeFinal },
          ],
        },
        {
          title : 'Informes finales', icon : 'mdi-file-sign', iconBg : '#e7f3ec', iconColor : '#28724d',
          items : [
            { title : 'Total a la fecha'            , value : resp.data.totalFinalesGeneral },
            { title : 'Total del año ' + currentYear, value : resp.data.totalFinalesAgno },
            { title : 'Cerrados temporalmente'      , value : resp.data.totalFinalesConCierreTemporal },
            { title : 'Cerrados'                    , value : resp.data.totalFinalesConCierreDefinitivo },
          ],
        },
      ]
      this.shortcuts = [
        { title : 'Reportes y estadísticas' , subtitle : 'Acceder a reportes y estadísticas del sistema'      , icon : 'mdi-chart-bar-stacked'         , route : { name: 'reportesEstadisticas', params: { tipoInforme: 'Final' } }, },
      ]
      if (respInc.data.totalFinalesTramitadosAlCDTE > 0) {
        this.shortcuts.splice(1, 0, { title : 'Gestionar' , subtitle : 'Acceder a los incidentes para su devolución o tramite final', icon : 'mdi-file-undo-outline', route : { name: 'incidentesCDTE' }, },)
      }
      if (respInc.data.totalIncidentesTramitadosAlCDTE > 0) {
        this.shortcuts.splice(1, 0, { title : 'Gestionar' , subtitle : 'Acceder a los informes finales para su devolución o tramite final', icon : 'mdi-file-undo-outline', route : { name: 'incidentesCDTE' }, },)
      }

      this.activity.incidentes = (respInc.data.ultimos10Incidentes || []).map((item) => ({
        title  : item.tipO_INCIDENTE.descripcion,
        time   : `Informado al PME hace ${this.caculateTime(item.fechA_INFORMANTE)}`,
        detail : `${item.circunstanciA_HECHO || '-'}`,
        color  : this.customColor(item),
        state  : this.customText(item),
      }));

      this.activity.finales = (resp.data.ultimos10Finales || []).map((item) => ({
        title  : item.tipO_INCIDENTE.descripcion,
        time   : `Informado al PME hace ${this.caculateTime(item.fechA_INFORMANTE)}`,
        detail : `${item.circunstanciA_HECHO || '-'}`,
        color  : this.customColor(item),
        state  : this.customText(item),
      }));
        
      const totalIncidentes = respInc.data.totalIncidentesEnProcesoS2 + respInc.data.totalIncidentesTramitadosAlCDTE + respInc.data.totalIncidentesDevueltosPorCDTE
      this.statusBreakdown.incidentes = [
        { label : 'En proceso S2', count : respInc.data.totalIncidentesEnProcesoS2, value : this.calculatePercentage(respInc.data.totalIncidentesEnProcesoS2, totalIncidentes), color : 'success' },
        { label : 'Tramitados al Cdte.', count : respInc.data.totalIncidentesTramitadosAlCDTE, value : this.calculatePercentage(respInc.data.totalIncidentesTramitadosAlCDTE, totalIncidentes), color : 'info' },
        { label : 'Devueltos por Cdte.', count : respInc.data.totalIncidentesDevueltosPorCDTE, value : this.calculatePercentage(respInc.data.totalIncidentesDevueltosPorCDTE, totalIncidentes), color : 'primary' },
      ];

      const totalFinales = resp.data.totalFinalesEnProcesoS2 + resp.data.totalFinalesTramitadosAlCDTE + resp.data.totalFinalesDevueltosPorCDTE
      this.statusBreakdown.finales = [
        { label : 'En proceso S2', count : resp.data.totalFinalesEnProcesoS2, value : this.calculatePercentage(resp.data.totalFinalesEnProcesoS2, totalFinales), color : 'success' },
        { label : 'Tramitados al Cdte.', count : resp.data.totalFinalesTramitadosAlCDTE, value : this.calculatePercentage(resp.data.totalFinalesTramitadosAlCDTE, totalFinales), color : 'info' },
        { label : 'Devueltos por Cdte.', count : resp.data.totalFinalesDevueltosPorCDTE, value : this.calculatePercentage(resp.data.totalFinalesDevueltosPorCDTE, totalFinales), color : 'primary' },
      ];   
    } catch (error) {
      console.error('Error al obtener informes incidentes:', error);
    }
  },
  methods: {
    goToShortcut(shortcut) {
      if (shortcut.route) {
        this.$router.push(shortcut.route);
      }
    },
    caculateTime(timestamp) {
      const now = new Date();
      const eventTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now - eventTime) / (1000 * 60));

      if (diffInMinutes < 60) {
        return `${diffInMinutes} minutos`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} ${hours > 1 ? 'horas' : 'hora'}`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} ${days > 1 ? 'días' : 'día'}`;
      }
    },
    calculatePercentage(value, total) {
      return total > 0 ? ((value / total) * 100).toFixed(2) : 0;
    },
    customColor(item) {
      return  item.estado === 1 ? 'info' :
              item.estado === 2 && item.devuelto === 'N' ? 'success' : 
              item.estado === 2 && item.devuelto === 'S' ? 'primary' : 
              item.estado === 3 ? 'warning' :
              item.estado === 4 ? '#9e9e9e' :
              item.estado === 5 ? 'secondary' :
              '';
    },
    customText(item) {
      return  item.estado === 1 ? 'Tramitado al Cdte.' :
              item.estado === 2 && item.devuelto === 'N' ? 'En proceso por S2' : 
              item.estado === 2 && item.devuelto === 'S' ? 'Devuelto por Cdte.' : 
              item.estado === 3 ? 'Con informe final' :
              item.estado === 4 ? 'Cierre temporal' :
              item.estado === 5 ? 'Cerrado' :
              '';
    },     
    ...mapActions("estadisticaIncidentesStore", [ "getEstadisticasIncidentesPorEstados", ]),
    ...mapActions("estadisticaFinalesStore"   ,	[	"getEstadisticasFinalesPorEstados", ]),
  },
};
</script>

<style scoped>
  .dashboard-pme {
    background:
      radial-gradient(circle at 95% 10%, rgba(148, 163, 184, 0.12), transparent 35%),
      radial-gradient(circle at 5% 90%, rgba(25, 118, 210, 0.08), transparent 32%),
      #f8f9fc;
    min-height: calc(100vh - 120px);
  }

  .hero-panel {
    position: relative;
    overflow: hidden;
    background: linear-gradient(120deg, #ffffff 0%, #f3f4f6 100%);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 10px 30px rgba(24, 39, 75, 0.06);
  }

  .hero-panel::after {
    content: '';
    position: absolute;
    right: -48px;
    top: -48px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: none;
  }

  .hero-copy {
    position: relative;
    z-index: 1;
  }

  .hero-eyebrow {
    letter-spacing: 1px;
    font-size: 12px;
    text-transform: uppercase;
    color: #b71c1c;
    font-weight: 500;
  }

  .hero-description {
    color: #4b5563;
    font-weight: 400;
  }

  .hero-badge {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(90deg, #6b7280, #4b5563);
    color: white;
    box-shadow: 0 8px 20px rgba(75, 85, 99, 0.28);
  }

  .stats-card,
  .main-card {
    border-radius: 16px;
    border-color: #e7eaf3 !important;
    box-shadow: 0 6px 22px rgba(20, 38, 70, 0.06);
    background-color: #ffffff;
  }

  .stats-group {
    width: 100%;
  }

  .stats-group .stats-content {
    padding: 16px 20px 10px;
  }

  .stats-group-title {
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .stats-header {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) minmax(0, auto);
    align-items: center;
    gap: 12px;
  }

  .stats-highlight,
  .stats-metric {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, auto);
    align-items: center;
    gap: 12px;
  }

  .stats-metric {
    padding: 6px 0;
  }

  .stats-metric + .stats-metric {
    border-top: 1px solid #eef0f5;
  }

  .stats-metric-label {
    font-size: 0.8125rem;
    font-weight: 300;
    line-height: 1.4;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .stats-value {
    text-align: right;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
    font-size: 1.125rem;
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: 0;
  }

  .stats-metric .stats-value {
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .stats-highlight-label {
    color: #212121;
    font-size: 1.0625rem;
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .stats-header-summary {
    display: grid;
    gap: 2px;
    max-width: 7rem;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .stats-header-label {
    color: #616161;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .stats-header-value {
    color: #212121;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
  }

  .stats-value-total {
    color: #212121;
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .activity-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .activity-column {
    min-width: 0;
  }

  .activity-column + .activity-column {
    border-left: 1px solid #e7eaf3;
    padding-left: 24px;
  }

  @media (max-width: 599px) {
    .activity-columns {
      grid-template-columns: minmax(0, 1fr);
    }

    .activity-column + .activity-column {
      border-left: 0;
      border-top: 1px solid #e7eaf3;
      padding-left: 0;
      padding-top: 24px;
    }
  }

  .shortcut-item {
    border-radius: 10px;
  }

  .shortcut-item:hover {
    background-color: rgba(148, 163, 184, 0.08);
  }

  .shortcut-item .v-list-item-title {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 400 !important;
  }

  .shortcut-item .v-list-item__subtitle {
    font-size: 0.82rem;
    color: #9ca3af;
    font-weight: 400 !important;
  }
  .status-table-wrapper {
    overflow-x: auto;
  }

  .status-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 0.8125rem;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .status-table th,
  .status-table td {
    padding: 12px 6px;
    border-bottom: 1px solid #eef0f5;
    vertical-align: middle;
  }

  .status-table th {
    color: #212121;
    font-weight: 500;
    text-align: right;
  }

  .status-table th:first-child {
    width: 40%;
    padding-left: 0;
    text-align: left;
  }

  .status-table tbody th {
    color: #616161;
    font-weight: 400;
  }

  .status-table tbody tr:last-child td,
  .status-table tbody tr:last-child th {
    border-bottom: 0;
  }

  .status-cell-values {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: baseline;
    gap: 4px 8px;
    margin-bottom: 6px;
  }

  .status-count {
    color: #212121;
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .status-percentage {
    color: #616161;
    font-size: 0.75rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .activity-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1f2937;
  } 
  .activity-detail {
    max-width: 850px;
    white-space: normal;
    word-break: break-word;
    line-height: 1.45;
    text-align: justify;
    text-justify: inter-word;
    font-style: italic;
    font-size: 0.79rem;
  }

  .dashboard-pme--dark {
    background:
      radial-gradient(circle at 95% 10%, rgba(148, 163, 184, 0.08), transparent 35%),
      radial-gradient(circle at 5% 90%, rgba(25, 118, 210, 0.08), transparent 32%),
      #121416;
    color: #e1e5e8;
  }

  .dashboard-pme--dark .hero-panel {
    background: linear-gradient(120deg, #25292c 0%, #1d2023 100%);
    border-color: #41464a;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);
  }

  .dashboard-pme--dark .hero-eyebrow {
    color: #ef8585;
  }

  .dashboard-pme--dark .hero-description {
    color: #c1c8ce;
  }

  .dashboard-pme--dark .stats-card,
  .dashboard-pme--dark .main-card {
    background-color: #202326;
    border-color: #41464a !important;
    color: #e1e5e8;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.2);
  }

  .dashboard-pme--dark .stats-group-title,
  .dashboard-pme--dark .stats-highlight-label,
  .dashboard-pme--dark .stats-header-value,
  .dashboard-pme--dark .stats-value-total,
  .dashboard-pme--dark .status-table th,
  .dashboard-pme--dark .status-count,
  .dashboard-pme--dark .activity-title {
    color: #e1e5e8;
  }

  .dashboard-pme--dark .stats-header-label,
  .dashboard-pme--dark .status-table tbody th,
  .dashboard-pme--dark .status-percentage,
  .dashboard-pme--dark .shortcut-item .v-list-item-title {
    color: #aeb8c0;
  }

  .dashboard-pme--dark .stats-metric + .stats-metric,
  .dashboard-pme--dark .status-table th,
  .dashboard-pme--dark .status-table td,
  .dashboard-pme--dark .activity-column + .activity-column {
    border-color: #41464a;
  }

  .dashboard-pme--dark .shortcut-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  .dashboard-pme--dark .shortcut-item .v-list-item__subtitle {
    color: #aeb8c0;
  }
</style>