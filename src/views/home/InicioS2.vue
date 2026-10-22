<template>
  <v-container fluid :class="['dashboard-s2 pa-4 pa-md-6', { 'dashboard-s2--dark': $vuetify.theme.dark }]">
    <v-row>
      <v-col cols="12">
        <div class="hero-panel">
          <div class="hero-copy">
            <p class="hero-eyebrow mb-2">S-2 Inteligencia</p>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-3">
              Informes de Incidentes de Seguridad
            </h1>
            <p class="text-body-2 text-md-subtitle-2 mb-5 hero-description">
              Bienvenido al módulo de gestión de incidentes de seguridad. Aquí podrás ampliar antecedentes, gestionar y analizar los informes preliminares reportados en la institución hacia su unidad.
            </p>            
            <div class="d-flex flex-wrap" style="gap: 12px;">
              <v-btn 
                color ="primary" 
                outlined
                @click ="$router.push({ name: 'incidentesS2' })"
              >
                <v-icon left>mdi-file-replace-outline</v-icon>
                Incidentes
              </v-btn>
							<v-btn 
								color ="primary" 
								outlined
								@click ="$router.push({ name: 'finalesS2' })"
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
              <h3 class="text-subtitle-1 font-weight-light mb-3">
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

    name       : 'InicioS2',
    data       : () => ({
      statsCards           : [],
      shortcuts            : [],
      activity             : { incidentes: [], finales: [] },
      statusBreakdown      : { incidentes: [], finales: [] },
      notifications        : [],
      notificationInterval : null,

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
          { key: 'incidentes', title: 'Incidentes', icon: 'mdi-file-replace-outline', items: this.statusBreakdown.incidentes },
          { key: 'finales', title: 'Informes finales', icon: 'mdi-file-sign', items: this.statusBreakdown.finales },
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
      this.$store.dispatch('clearSnackbars');
      this.notifications = [];

      const respInc = await this.getEstadisticasIncidentesPorEstados({ idUnidad: this.currentUser.Unidad });
      const respFin = await this.getEstadisticasFinalesPorEstados({ idUnidad: this.currentUser.Unidad });      

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
            { title : 'Total a la fecha', value : respFin.data.totalFinalesGeneral },            
            { title : 'Total del año ' + currentYear, value : respFin.data.totalFinalesAgno },
            { title : 'Cerrados temporalmente', value : respFin.data.totalFinalesConCierreTemporal },
            { title : 'Cerrados', value : respFin.data.totalFinalesConCierreDefinitivo },

          ],
        },
      ]
      this.shortcuts = [
        { title : 'Reportes y estadísticas' , subtitle : 'Acceder a reportes y estadísticas del sistema'      , icon : 'mdi-chart-bar-stacked'         , route : { name: 'reportesEstadisticas', params: { tipoInforme: 'Incidente' } }, },
      ]

      if (respFin.data.totalFinalesEnProcesoS2 > 0) {
        this.shortcuts.splice(1, 0, { title : 'Tramitar informes finales' , subtitle : 'Tramitar los informes finales pendientes', icon : 'mdi-file-document-arrow-right-outline', route : { name: 'finalesS2' }, },)
      }
      if (respInc.data.totalIncidentesEnProcesoS2 > 0) {
        this.shortcuts.splice(1, 0, { title : 'Tramitar informes' , subtitle : 'Tramitar los incidentes pendientes', icon : 'mdi-file-document-arrow-right-outline', route : { name: 'incidentesS2' }, },)
      }      

      this.activity.incidentes = (respInc.data.ultimos10Incidentes || []).map((item) => ({
        title  : item.tipO_INCIDENTE.descripcion,
        time   : `Informado al PME hace ${this.caculateTime(item.fechA_INFORMANTE)}`,
        detail : `${item.circunstanciA_HECHO || '-'}`,
        color  : this.customColor(item),
        state  : this.customText(item),
      }));

      const totalIncidentes = respInc.data.totalIncidentesEnProcesoS2 + respInc.data.totalIncidentesTramitadosAlCDTE + respInc.data.totalIncidentesDevueltosPorCDTE;
      this.statusBreakdown.incidentes = [
        { label : 'En proceso S2', count : respInc.data.totalIncidentesEnProcesoS2, value : this.calculatePercentage(respInc.data.totalIncidentesEnProcesoS2, totalIncidentes), color : 'success' },
        { label : 'Tramitados al Cdte.', count : respInc.data.totalIncidentesTramitadosAlCDTE, value : this.calculatePercentage(respInc.data.totalIncidentesTramitadosAlCDTE, totalIncidentes), color : 'info' },
        { label : 'Devueltos por Cdte.', count : respInc.data.totalIncidentesDevueltosPorCDTE, value : this.calculatePercentage(respInc.data.totalIncidentesDevueltosPorCDTE, totalIncidentes), color : 'primary' },
      ];  

      this.activity.finales = (respFin.data.ultimos10Finales || []).map((item) => ({
        title  : item.tipO_INCIDENTE.descripcion,
        time   : `Informado al PME hace ${this.caculateTime(item.fechA_INFORMANTE)}`,
        detail : `${item.circunstanciA_HECHO || '-'}`,
        color  : this.customColor(item),
        state  : this.customText(item),
      }));
        
      const totalFinales = respFin.data.totalFinalesEnProcesoS2 + respFin.data.totalFinalesTramitadosAlCDTE + respFin.data.totalFinalesDevueltosPorCDTE;
      this.statusBreakdown.finales = [
        { label : 'En proceso S2', count : respFin.data.totalFinalesEnProcesoS2, value : this.calculatePercentage(respFin.data.totalFinalesEnProcesoS2, totalFinales), color : 'success' },
        { label : 'Tramitados al Cdte.', count : respFin.data.totalFinalesTramitadosAlCDTE, value : this.calculatePercentage(respFin.data.totalFinalesTramitadosAlCDTE, totalFinales), color : 'info' },
        { label : 'Devueltos por Cdte.', count : respFin.data.totalFinalesDevueltosPorCDTE, value : this.calculatePercentage(respFin.data.totalFinalesDevueltosPorCDTE, totalFinales), color : 'primary' },
      ];   
      await this.updateNotifications();
      this.notificationInterval = setInterval(this.updateNotifications, 60000);

    } catch (error) {
      console.error('Error al obtener informes incidentes:', error);
    }
  },
  beforeDestroy() {
    clearInterval(this.notificationInterval);
    this.$store.dispatch('clearSnackbars');
  },  
  methods: {
    async updateNotifications() {
      this.$store.dispatch('clearSnackbars');
      this.notifications = [];

      try {
        let resp 
        resp = await this.getListIncidentesConAlertas();
        if (resp.data.indicentesConAlertaRoja?.length > 0) {
          for (const informe of resp.data.indicentesConAlertaRoja) {
            this.notifications.push({
              text  : `${informe.incidente.circunstanciA_HECHO.length > 60 ? informe.incidente.circunstanciA_HECHO.substring(0, 60) + '...' : informe.incidente.circunstanciA_HECHO}
                      ( ${informe.incidente.tipO_INCIDENTE.descripcion} ).`,
              color : '#b71c1c',
              title : 'Incidentes: Plazo vencido hace ' + this.formatElapsedTime(informe.diferenciaHoras)
            });
          }
        }
        if (resp.data.incidentesConAlertaAmarilla?.length > 0) {
          for (const informe of resp.data.incidentesConAlertaAmarilla) {
            this.notifications.push({
              text  : `${informe.incidente.tipO_INCIDENTE.descripcion}. ${informe.incidente.circunstanciA_HECHO || '-'}`,
              color : '#f59e0b',
              title : 'Incidentes: Sin tramitar desde hace ' + this.formatElapsedTime(informe.diferenciaHoras)
            });
          }
        }
        resp= await this.getListFinalesConAlertas();
        if (resp.data.finalesConAlertaRoja?.length > 0) {
          for (const informe of resp.data.finalesConAlertaRoja) {
            this.notifications.push({
              text  : `${informe.final.circunstanciA_HECHO.length > 60 ? informe.final.circunstanciA_HECHO.substring(0, 60) + '...' : informe.final.circunstanciA_HECHO}
                      ( ${informe.final.tipO_INCIDENTE.descripcion} ).`,
              color : '#b71c1c',
              title : 'Finales: Plazo vencido hace ' + this.formatElapsedTime(informe.diferenciaHoras)
            });
          }
        }
        if (resp.data.finalesConAlertaAmarilla?.length > 0) {
          for (const informe of resp.data.finalesConAlertaAmarilla) {
            this.notifications.push({
              text  : `${informe.final.tipO_INCIDENTE.descripcion}. ${informe.final.circunstanciA_HECHO || '-'}`,
              color : '#f59e0b',
              title : 'Finales: Sin tramitar desde hace ' + this.formatElapsedTime(informe.diferenciaHoras)
            });
          }
        }
        for (const notificacion of this.notifications) {
          this.$store.dispatch('triggerSnackbar', notificacion);
        }
      } catch (error) {
        console.error('Error al actualizar las alertas:', error);
      }
    },
    goToShortcut(shortcut) {
      if (shortcut.route) {
        this.$router.push(shortcut.route);
      }
    },
    formatElapsedTime(decimalHours) {
      const totalMinutes = Math.round(Number(decimalHours) * 60);
      const hours        = Math.floor(totalMinutes / 60);
      const minutes      = totalMinutes % 60;
      const hourLabel    = hours === 1 ? 'hora' : 'horas';
      const minuteLabel  = minutes === 1 ? 'minuto' : 'minutos';

      if (minutes === 0) {
        return `${hours} ${hourLabel}`;
      }

      return `${hours} ${hourLabel} y ${minutes} ${minuteLabel}`;
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
              item.estado === 4 ? 'secondary' :
              item.estado === 5 ? 'dark' :
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
		...mapActions("estadisticaIncidentesStore",	[	"getEstadisticasIncidentesPorEstados", ]),
    ...mapActions("estadisticaFinalesStore"   ,	[	"getEstadisticasFinalesPorEstados", ]),
    ...mapActions("indiceAlertaStore"	        , [	"getListIncidentesConAlertas", "getListFinalesConAlertas" ]),    
  },
};
</script>

<style scoped>
  .dashboard-s2 {
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

  .dashboard-s2--dark {
    background:
      radial-gradient(circle at 95% 10%, rgba(148, 163, 184, 0.08), transparent 35%),
      radial-gradient(circle at 5% 90%, rgba(25, 118, 210, 0.08), transparent 32%),
      #121416;
    color: #e1e5e8;
  }

  .dashboard-s2--dark .hero-panel {
    background: linear-gradient(120deg, #25292c 0%, #1d2023 100%);
    border-color: #41464a;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);
  }

  .dashboard-s2--dark .hero-eyebrow {
    color: #ef8585;
  }

  .dashboard-s2--dark .hero-description {
    color: #c1c8ce;
  }

  .dashboard-s2--dark .stats-card,
  .dashboard-s2--dark .main-card {
    background-color: #202326;
    border-color: #41464a !important;
    color: #e1e5e8;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.2);
  }

  .dashboard-s2--dark .stats-group-title,
  .dashboard-s2--dark .stats-highlight-label,
  .dashboard-s2--dark .stats-header-value,
  .dashboard-s2--dark .stats-value-total,
  .dashboard-s2--dark .status-table th,
  .dashboard-s2--dark .status-count,
  .dashboard-s2--dark .activity-title {
    color: #e1e5e8;
  }

  .dashboard-s2--dark .stats-header-label,
  .dashboard-s2--dark .status-table tbody th,
  .dashboard-s2--dark .status-percentage,
  .dashboard-s2--dark .shortcut-item .v-list-item-title {
    color: #aeb8c0;
  }

  .dashboard-s2--dark .stats-metric + .stats-metric,
  .dashboard-s2--dark .status-table th,
  .dashboard-s2--dark .status-table td,
  .dashboard-s2--dark .activity-column + .activity-column {
    border-color: #41464a;
  }

  .dashboard-s2--dark .shortcut-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  .dashboard-s2--dark .shortcut-item .v-list-item__subtitle {
    color: #aeb8c0;
  }
</style>