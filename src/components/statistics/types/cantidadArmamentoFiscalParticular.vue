
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
    name: "cantidadArmamentoFiscalParticular",
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
        let resp;
        try {
          resp = await this.getEstadisticasBinteCantidadArmaFiscalParticular({ agno, tipoInforme });
          if ( resp.status == '403' ) {
            router.push({ name: "UnAuthorized" });
          } else {
            this.listLabel  = resp.data?.label || [];
            this.listSeries = resp.data?.series || [];
            this.listIcon = this.listLabel.map(label => {
              const normalizedLabel = label.toLowerCase();
              if (normalizedLabel === 'fiscal') return 'mdi-ammunition';
              if (normalizedLabel === 'particular') return 'mdi-pistol';
              return 'mdi-information-off-outline';
            });
            const summaries = this.listLabel
              .map((label, index) => ({ label, count: this.listSeries[index] }))
              .filter(item => item.label && item.count != null)
              .map(item => `${item.count} ${item.label}`);
            this.subtitle = summaries.length
              ? `Existen ${summaries.join(' y ')} en el año ${agno}.`
              : `No hay datos de armas fiscales o particulares en el año ${agno}.`;
          }
        } catch (error) {
          console.error('Error al obtener la cantidad de incidentes y accidentes:', error);
        }
      },
      ...mapActions("estadisticaBINTEStore"   ,	[	"getEstadisticasBinteCantidadArmaFiscalParticular", ]),
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
    border-top: 0;
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

  .kpi-card--particular {
    --kpi-accent: #0f766e;
  }

  .kpi-card--fiscal {
    --kpi-accent: #8b5e34;
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
    background: rgba(15, 118, 110, 0.12);
    border: 1px solid rgba(15, 118, 110, 0.22);
    flex-shrink: 0;
  }

  .kpi-icon {
    font-size: 28px;
    color: #0f766e;
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

  .kpi-card--fiscal .kpi-icon-wrap {
    background: rgba(139, 94, 52, 0.12);
    border-color: rgba(139, 94, 52, 0.22);
  }

  .kpi-card--fiscal .kpi-icon {
    color: #8b5e34;
  }
</style>