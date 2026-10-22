<template>
  <v-container fluid :class="['dashboard-pme pa-4 pa-md-6', { 'dashboard-pme--dark': $vuetify.theme.dark }]">
    <v-row>
      <v-col cols="12">
        <div class="hero-panel">
          <div class="hero-copy">
            <p class="hero-eyebrow mb-2">Puesto de Mando del Ejército</p>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-3">
              Informes Preliminares de Seguridad
            </h1>
            <p class="text-body-2 text-md-subtitle-2 mb-5 hero-description">
              Supervise el estado de publicación de los informes preliminares, sea responsable con el registro de información.
            </p>            
            <div class="d-flex flex-wrap" style="gap: 12px;">
              <v-btn 
                color ="primary" 
                outlined
                @click ="$router.push({ name: 'preliminares'})"
              >
                <v-icon left>mdi-file-document-alert-outline</v-icon>
                Preliminares
              </v-btn>
              <v-btn 
                outlined 
                color="primary" 
                @click="$router.push({ name: 'boletin'})"
              >
                <v-icon left>mdi-file-clock-outline</v-icon>
                Boletín
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
        sm="6"
        lg="4"
      >
        <v-card class="stats-card" outlined>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption text-uppercase font-weight-medium text--secondary">
                {{ card.title }}
              </span>
              <v-avatar size="34" :color="card.iconBg">
                <v-icon size="18" color="white">{{ card.icon }}</v-icon>
              </v-avatar>
            </div>
            <div class="text-h5 font-weight-bold mb-1">{{ card.value }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="main-card" outlined>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <p class="text-body-1 mb-0">Actividad reciente</p>
              <p class="text-h6 mb-0">Últimos {{ activity.length }} informes preliminares</p>
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-timeline dense align-top v-if="activity.length > 0">
              <v-timeline-item
                v-for="(event, index) in activity"
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
            <div v-else class="text-caption text--secondary">No hay actividad reciente.</div>
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
            <div v-for="item in statusBreakdown" :key="item.label" class="mb-4">
              <div >
                <span>{{ item.label }}</span>
                <div class="status-cell-values">
                  <span class="status-count">{{ item.count }}</span>
                  <span class="status-percentage">({{ item.value }}%)</span>                
                </div>
              </div>
              <v-progress-linear
                :value="item.value"
                :color="item.color"
                rounded
                height="8"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions } from "vuex"
  export default {

    name       : 'InicioPME',
    data       : () => ({
      statsCards           : [],
      shortcuts            : [],
      activity             : [],
      statusBreakdown      : [],
      notifications        : [],
      notificationInterval : null,
    }),
  
  async mounted() {
    try {
      this.$store.dispatch('clearSnackbars');
      this.notifications = [];
      
      const resp = await this.getEstadisticasPreliminaresPorEstados();

      this.statsCards = [ 
        { title : 'Informes hoy'                , value : resp.data.totalPreliminaresTurno  , icon : 'mdi-file-document-outline'         , iconBg : 'info'     , },
        { title : 'Total de informes del año ' + new Date().getFullYear(), value : resp.data.totalPreliminaresAgno   , icon : 'mdi-file-document-multiple-outline', iconBg : '#ffca28'  , },
        { title : 'Total de informes a la fecha', value : resp.data.totalPreliminaresGeneral, icon : 'mdi-file-document-multiple-outline', iconBg : 'secondary', }        
      ]
      this.shortcuts = [
        { title : 'Nuevo informe preliminar', subtitle : 'Registrar un nuevo incidente/accidente'             , icon : 'mdi-file-document-plus-outline', route : { name: 'preliminares', query: { action: 'newItem' } },          },
        { title : 'Generar boletín'         , subtitle : 'Crear un nuevo boletín de novedades institucionales', icon : 'mdi-file-clock-outline'        , route : { name: 'boletin' }, },
        { title : 'Reportes y estadísticas' , subtitle : 'Acceder a reportes y estadísticas del sistema'      , icon : 'mdi-chart-bar-stacked'         , route : { name: 'reportesEstadisticas', params: { tipoInforme: 'Preliminar' } }, },
      ]
      if (resp.data.totalPreliminaresNoPublicados > 0) {
        this.shortcuts.splice(1, 0, { title : 'Publicar informes' , subtitle : 'Publicar los informes preliminares pendientes', icon : 'mdi-file-document-check-outline', route : { name: 'preliminares' }, },)
      }

      this.activity = resp.data.ultimos10Preliminares.map((item) => ({
        title  : item.tipO_INCIDENTE.descripcion,
        time   : `Informado hace ${this.caculateTime(item.fechA_INFORMANTE)}`,
        detail : `${item.u_INFORMANTE?.descripcion || '-'}`,
        color  : item.estado === 2 ? 'primary' : 'success',
        state  : item.estado === 2 ? 'No publicado' : 'Publicado',
      }));
        
      this.statusBreakdown = [
        { label: 'Preliminares publicados',    count: resp.data.totalPreliminaresPublicados,   value: this.calculatePercentage(resp.data.totalPreliminaresPublicados,   resp.data.totalPreliminaresTurno), color: 'success' },
        { label: 'Preliminares no publicados', count: resp.data.totalPreliminaresNoPublicados, value: this.calculatePercentage(resp.data.totalPreliminaresNoPublicados, resp.data.totalPreliminaresTurno), color: 'primary' },
      ];  

      await this.updateNotifications();
      this.notificationInterval = setInterval(this.updateNotifications, 60000);

    } catch (error) {
      console.error('Error al obtener informes preliminares:', error);
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
        const resp = await this.getListPreliminaresConAlertas();

        for (const informe of resp.data.preliminaresConAlertaRoja) {
          this.notifications.push({
            text  : `${informe.preliminar.circunstanciA_HECHO.length > 60 ? informe.preliminar.circunstanciA_HECHO.substring(0, 60) + '...' : informe.preliminar.circunstanciA_HECHO}
                    ( ${informe.preliminar.tipO_INCIDENTE.descripcion} ).`,
            color : '#b71c1c',
            title : 'Plazo vencido hace ' + this.formatElapsedTime(informe.diferenciaHoras)
          });
        }

        for (const informe of resp.data.preliminaresConAlertaAmarilla) {
          this.notifications.push({
            text  : `${informe.preliminar.tipO_INCIDENTE.descripcion}. ${informe.preliminar.circunstanciA_HECHO || '-'}`,
            color : '#f59e0b',
            title : 'Sin publicar desde hace ' + this.formatElapsedTime(informe.diferenciaHoras)
          });
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
        return `${hours} horas`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} días`;
      }
    },
    calculatePercentage(value, total) {
      return total > 0 ? ((value / total) * 100).toFixed(2) : 0;
    },
		...mapActions("estadisticaPreliminaresStore",	[	"getEstadisticasPreliminaresPorEstados", ]),
    ...mapActions("indiceAlertaStore",	          [	"getListPreliminaresConAlertas", ]),
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

  .dashboard-pme--dark .shortcut-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  .dashboard-pme--dark .shortcut-item .v-list-item-title,
  .dashboard-pme--dark .activity-title,
  .dashboard-pme--dark .status-cell-values {
    color: #e1e5e8;
  }

  .dashboard-pme--dark .status-count {
    color: #e1e5e8;
  }

  .dashboard-pme--dark .shortcut-item .v-list-item__subtitle {
    color: #aeb8c0;
  }

</style>