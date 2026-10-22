<template>
  <v-container fluid :class="{ 'statistics-view--dark': $vuetify.theme.dark }">
    <div v-if="tipoInforme === 'Preliminar'" >
      <estadisticaPreliminares />
    </div>
    <div v-else-if="tipoInforme === 'Incidente' || tipoInforme === 'Final'">
      <div class="statistics-tabs-shell">
        <v-tabs
          v-model="tabEstadisticas"
          class="statistics-tabs"
          background-color="transparent"
          color="primary"
          slider-color="primary"
        >
          <v-tab>
            <v-icon left small>mdi-file-replace-outline</v-icon>
            Incidentes
          </v-tab>
          <v-tab>
            <v-icon left small>mdi-file-sign</v-icon>
            Finales
          </v-tab>
        </v-tabs>
      </div>
      <v-tabs-items v-model="tabEstadisticas" class="statistics-tab-content">
        <v-tab-item>
          <estadisticaIncidentes />
        </v-tab-item>
        <v-tab-item>
          <estadisticaFinales />
        </v-tab-item>
      </v-tabs-items>
    </div>
    <div v-else-if="tipoInforme === 'BINTE'">

      <div class="year-filter">
        <div class="year-filter-control">
          <v-select
            v-if="agnosInformes.length"
            v-model = "selectedAgno"
            :items  = "agnosInformes"
            label   = "Año"
            dense
            outlined
            hide-details
          />
            <span v-else class="year-filter-empty">No hay años disponibles</span>
          </div>
        </div>
      <div class="statistics-tabs-shell">
        <v-tabs
          v-model="tabEstadisticas"
          class="statistics-tabs"
          background-color="transparent"
          color="primary"
          slider-color="primary"
        >
          <v-tab>
            <v-icon left small>mdi-file-replace-outline</v-icon>
            Incidentes
          </v-tab>
          <v-tab>
            <v-icon left small>mdi-file-sign</v-icon>
            Finales
          </v-tab>
        </v-tabs>
      </div>
      <v-tabs-items v-model="tabEstadisticas" class="statistics-tab-content">
        <v-tab-item>
          <estadisticaBINTE 
            tipoInforme = "I"
            :agno       = "selectedAgno" />
        </v-tab-item>
        <v-tab-item>
          <estadisticaBINTE 
            tipoInforme = "F" 
            :agno       = "selectedAgno" />
        </v-tab-item>
      </v-tabs-items>
    </div>
    <div v-else class="text-center">
      No hay estadisticas disponibles.
    </div>
  </v-container>  
</template>

<script>
  import estadisticaPreliminares from "@/components/statistics/estadisticaPreliminares.vue"
  import estadisticaIncidentes   from "@/components/statistics/estadisticaIncidentes.vue"
  import estadisticaFinales      from "@/components/statistics/estadisticaFinales.vue"
  import estadisticaBINTE        from "@/components/statistics/estadisticaBINTE.vue"
  import { mapActions }          from "vuex";

  export default {
    name      : "ReportesEstadisticas",
    components: {
      estadisticaPreliminares,
      estadisticaIncidentes,
      estadisticaFinales,
      estadisticaBINTE
    },
    data      : () => ({
      tabEstadisticas : 0,
      agnosInformes   : [],      
      selectedAgno    : 0, 
    }),
    props     : {
      tipoInforme: { type : String,	default : "" }
    },
    async mounted() {
      try {
        const resp = await this.getListAgnosInformesIncidentesFinales({ store: false });
        if (resp.status === 403) {
          router.push({ name: "UnAuthorized" });
          return;
        }
        this.agnosInformes = resp.data?.respuesta || [];
        this.selectedAgno  = this.agnosInformes[0] || null;
      } catch (error) {
        console.error('Error al obtener los años de informes:', error);
      } 
    },
    methods: {
      ...mapActions('estadisticaBINTEStore', ['getListAgnosInformesIncidentesFinales'])
    }
  };

</script>

<style scoped>
.statistics-tabs-shell {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.statistics-tabs {
  max-width: 440px;
}

.statistics-tabs ::v-deep .v-tabs-bar {
  height: 56px;
}

.statistics-tabs ::v-deep .v-tab {
  min-width: 160px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.statistics-tabs ::v-deep .v-tab--active {
  background-color: rgba(183, 28, 28, 0.06);
}

.statistics-tabs ::v-deep .v-tabs-slider {
  height: 3px;
}

.statistics-tab-content {
  background: transparent;
  padding-top: 20px;
}

.statistics-view--dark .statistics-tabs-shell {
  border-bottom-color: #45494d;
}

.statistics-view--dark ::v-deep .statistics-tabs .v-tab {
  color: #c9d5df;
}

.statistics-view--dark ::v-deep .statistics-tabs .v-tab--active {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
}

.statistics-view--dark .statistics-tab-content {
  color: #e2e7eb;
}

/* Filtro de año */
.year-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.year-filter-copy {
  display: grid;
  gap: 3px;
}

.year-filter-meta,
.year-filter-empty {
  color: #68798a;
  font-size: 0.78rem;
}

.year-filter-control {
  width: 240px;
  max-width: 100%;
  margin-left: auto;
}

.year-filter-control ::v-deep .v-input__slot {
  background-color: #ffffff;
}
</style>