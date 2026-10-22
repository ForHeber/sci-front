<template>
  <v-container fluid>
    <v-row dense class="kpi-grid">
      
      <v-col cols="12" lg="12" class="d-flex" v-for="(label, index) in listLabel" :key="index">
        <v-card :class="`kpi-card kpi-card--${label.toLowerCase()}`">
          <v-card-text class="kpi-content">
            <div class="kpi-icon-wrap">
              <v-icon class="kpi-icon">{{ listIcon[index] || 'mdi-chart-box-outline' }}</v-icon>
            </div>
            <div class="kpi-metric">
              <span class="kpi-value">{{ listSeries[index] }}</span> {{ label }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div v-if="listLabel.length === 0" class="empty-state">
      <v-icon size="62" color="grey">mdi-database-off</v-icon>
      <p class="empty-state-text">No hay datos disponibles</p>
  </div>
  </v-container>
</template>
<script>
  import { mapActions } from "vuex";
  export default {
    name: "cantidadIncidenteAccidente",
    props   : {
      tipoInforme : { type: String, required: true },
      agno        : { type: Number, required: true }
    },     
    data       : () => ({
      listLabel  : [],
      listSeries : [],
      listIcon   : [],
      subtitle   : '',
    }),
    watch: {
      subtitle(newSubtitle) {
        this.$emit('update-subtitle', newSubtitle || '');
      },
      tipoInforme(newTipoInforme) {
        this.getData(this.agno,newTipoInforme);
      },
      agno(newAgno) {
        this.getData(newAgno, this.tipoInforme);
      }
    },
    async mounted() {
      this.getData(this.agno, this.tipoInforme);
    },
    methods: {
      async getData(agno, tipoInforme) {
        let   resp
        try {
          resp = await this.getEstadisticasBinteCantidadIncidenteAccidente({ agno, tipoInforme });
          if ( resp.status == '403' ) {
            router.push({ name: "UnAuthorized" });
          } else {
            this.listLabel  = resp.data?.label || [];
            this.listSeries = resp.data?.series || [];
            this.listIcon = this.listLabel.map(label => {
              const normalizedLabel = label.toLowerCase();
              if (normalizedLabel === 'incidente') return 'mdi-alert-circle-outline';
              if (normalizedLabel === 'accidente') return 'mdi-car';
              return 'mdi-information-off-outline';
            });
            const summaries = this.listLabel
              .map((label, index) => ({ label, count: this.listSeries[index] }))
              .filter(item => item.label && item.count != null)
              .map(item => `${item.count} ${item.label}`);
            this.subtitle = summaries.length
              ? `Existen ${summaries.join(' y ')} en el año ${agno}.`
              : `No hay datos de incidentes y accidentes en el año ${agno}.`;
          }
        } catch (error) {
          console.error('Error al obtener la cantidad de incidentes y accidentes:', error);
        }
      },
      ...mapActions("estadisticaBINTEStore"   ,	[	"getEstadisticasBinteCantidadIncidenteAccidente", ]),
    }
  };
</script>
<style scoped>
  .kpi-grid {
    row-gap: 16px;
  }

  .kpi-card {
    position: relative;
    overflow: hidden;
    width: 100%;
    border-radius: 18px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }

  .kpi-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: var(--kpi-accent, #f59e0b);
  }

  .kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.14);
  }

  .kpi-card--incidente {
    --kpi-accent: #f0ad4e;
  }

  .kpi-card--accidente {
    --kpi-accent: #db2727;
  }

  .kpi-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    min-height: 92px;
    padding: 8px 22px 20px;
  }

  .kpi-icon-wrap {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(240, 173, 78, 0.12);
    border: 1px solid rgba(240, 173, 78, 0.22);
    flex-shrink: 0;
  }

  .kpi-icon {
    font-size: 28px;
    color: #f0ad4e;
  }

  .kpi-metric {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .kpi-value {
    font-size: 2.1rem;
    font-weight: 500;
    color: #111827;
    letter-spacing: 0.02em;
  }

  .kpi-card--accidente .kpi-icon-wrap {
    background: rgba(216, 92, 92, 0.12);
    border-color: rgba(216, 92, 92, 0.22);
  }

  .kpi-card--accidente .kpi-icon {
    color: #db2727;
  }
  .empty-state {
    height          : 400px;
    display         : flex;
    align-items     : center;
    justify-content : center;
    flex-direction  : column;
    gap             : 8px;
    color           : #757575;
  }
  .empty-state-text {
    margin    : 0;
    font-size : 0.82rem;
    color     : #757575;
  }
</style>