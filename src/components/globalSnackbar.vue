<template>
  <div v-if="snackbars.length > 0" class="notif-wrap" :class="{ 'notif-wrap--dark': $vuetify.theme.dark }">

    <!-- Pastilla compacta: siempre visible; plegar/desplegar el contenedor -->
    <div class="notif-pill-row">
      <button type="button" class="notif-pill" :aria-expanded="String(abierto)" @click="alternar">
        <v-icon size="18" class="notif-pill-icon">mdi-bell-outline</v-icon>
        <span class="notif-pill-text">{{ textoPastilla }}</span>
        <v-icon size="18" class="notif-pill-chevron">{{ abierto ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </button>
    </div>

    <!-- Contenedor con todas las notificaciones agrupadas -->
    <div v-show="abierto" class="notif-panel">
      <div class="notif-header">
        <v-icon size="18" class="notif-header-icon">mdi-bell-outline</v-icon>
        <span class="notif-header-title">Notificaciones</span>
        <span class="notif-count">{{ snackbars.length }}</span>
        <span class="notif-spacer"></span>
        <button type="button" class="notif-clear-all" @click="closeAll">
          <v-icon size="14" class="mr-1">mdi-check-all</v-icon>Cerrar todas
        </button>
      </div>

      <div class="notif-list">
        <div
          v-for="snack in snackbars"
          :key="snack.id"
          class="notif-item"
          :style="{ borderLeftColor: colorNivel(snack.color) }"
        >
          <v-icon size="18" class="notif-item-icon" :color="colorNivel(snack.color)">
            {{ esRoja(snack.color) ? 'mdi-alert-circle-outline' : 'mdi-clock-outline' }}
          </v-icon>
          <div class="notif-item-body">
            <div v-if="snack.title" class="notif-item-title">{{ snack.title }}</div>
            <div v-if="snack.text" class="notif-item-text">{{ snack.text }}</div>
          </div>
          <button type="button" class="notif-item-close" aria-label="Cerrar notificación" @click="closeSnackbar(snack.id)">
            <v-icon size="16">mdi-close</v-icon>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapState } from 'vuex';

  const CLAVE_ABIERTO = 'SCINotifAbierto';
  const ROJO          = '#BF3A46';
  const DORADO        = '#EDB730';

  export default {
    name: 'GlobalSnackbar',
    data: () => ({
      // Por defecto plegado: que la pantalla no se llene de avisos. Se recuerda la ultima eleccion.
      abierto: false,
    }),
    computed: {
      ...mapState(['snackbars']),
      textoPastilla() {
        const n = this.snackbars.length;
        return n === 1 ? '1 notificación' : `${n} notificaciones`;
      },
    },
    created() {
      try { this.abierto = localStorage.getItem(CLAVE_ABIERTO) === '1'; } catch (e) { /* sin almacenamiento */ }
    },
    methods: {
      alternar() {
        this.abierto = !this.abierto;
        try { localStorage.setItem(CLAVE_ABIERTO, this.abierto ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
      },
      // Las pantallas envian '#b71c1c' (vencida) o '#f59e0b' (por vencer): se unifican con la paleta del sistema.
      esRoja(color) {
        return String(color || '').toLowerCase() === '#b71c1c';
      },
      colorNivel(color) {
        return this.esRoja(color) ? ROJO : DORADO;
      },
      closeSnackbar(id) {
        this.$store.commit('REMOVE_SNACKBAR', id);
      },
      closeAll() {
        this.$store.commit('CLEAR_SNACKBARS');
      },
    },
  };
</script>

<style scoped>
.notif-wrap {
  position: fixed;
  top: 66px;
  right: 20px;
  z-index: 9999;
  width: 380px;
  max-width: calc(100vw - 40px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: none;
}
.notif-wrap > * { pointer-events: auto; }

/* Pastilla */
.notif-pill-row { display: flex; justify-content: flex-end; width: 100%; }
.notif-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(155, 44, 58, 0.25);
  box-shadow: 0 4px 14px rgba(155, 44, 58, 0.16);
  font-size: 0.8rem;
  font-weight: 700;
  color: #1f1400;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.notif-pill:hover { border-color: #9b2c3a; box-shadow: 0 6px 18px rgba(155, 44, 58, 0.24); }
.notif-pill-icon, .notif-pill-chevron { color: #9b2c3a !important; }

/* Contenedor */
.notif-panel {
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(155, 44, 58, 0.18);
  overflow: hidden;
}
.notif-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f7c65e;
}
.notif-header-icon { color: #1f1400 !important; }
.notif-header-title { font-size: 0.88rem; font-weight: 700; color: #1f1400; }
.notif-count {
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 999px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  background: #9b2c3a;
}
.notif-spacer { flex: 1; }
.notif-clear-all {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid #1f1400;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1f1400;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.notif-clear-all:hover { background: rgba(31, 20, 0, 0.1); }
.notif-clear-all .v-icon { color: #1f1400 !important; }

/* Lista (con scroll interno: no crece sobre la pantalla) */
.notif-list { max-height: 250px; overflow-y: auto; }
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 8px 10px 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-left: 4px solid transparent;
}
.notif-item-icon { margin-top: 1px; }
.notif-item-body { flex: 1; min-width: 0; }
.notif-item-title { font-size: 0.8rem; font-weight: 700; color: #1f1400; line-height: 1.25; overflow-wrap: anywhere; }
.notif-item-text  { margin-top: 2px; font-size: 0.78rem; font-weight: 400; color: #5b6572; line-height: 1.3; overflow-wrap: anywhere; }
.notif-item-close {
  border: none;
  background: transparent;
  padding: 2px;
  border-radius: 6px;
  color: #6b7885;
  cursor: pointer;
}
.notif-item-close:hover { background: rgba(155, 44, 58, 0.1); color: #9b2c3a; }

/* Tema oscuro */
.notif-wrap--dark .notif-pill,
.notif-wrap--dark .notif-panel { background: #2b2f32; border-color: #45494d; }
.notif-wrap--dark .notif-pill { color: #fff4d1; }
.notif-wrap--dark .notif-header { background: #8a6d1d; }
.notif-wrap--dark .notif-header-icon,
.notif-wrap--dark .notif-header-title,
.notif-wrap--dark .notif-clear-all,
.notif-wrap--dark .notif-clear-all .v-icon { color: #fff4d1 !important; }
.notif-wrap--dark .notif-clear-all { border-color: #fff4d1; }
.notif-wrap--dark .notif-item { border-top-color: #45494d; }
.notif-wrap--dark .notif-item-title { color: #fff4d1; }
.notif-wrap--dark .notif-item-text  { color: #c5ccd3; }
</style>
