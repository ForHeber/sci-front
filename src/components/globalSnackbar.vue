<template>
	<div class="snackbar-container">
    <v-snackbar
      :value    = "snackbars.length > 0"
      :timeout  = "-1"
      top
      right
      elevation = "0"
      class     = "custom-snackbar"
    >
      <div class="snackbar-card">
        <div class="snackbar-list-header">
          <span class="snackbar-list-title">Notificaciones</span>
          <v-tooltip bottom content-class="snackbar-tooltip-content">
            <template #activator="{ on, attrs }">
              <v-btn
                v-if="snackbars.length > 1"
                v-bind="attrs"
                v-on="on"
                icon
                x-small
                class="snackbar-clear-all"
                depressed
                elevation="0"
                @click="closeAll"
                aria-label="Cerrar todas"
              >
                <v-icon size="16" class="snackbar-clear-all-icon">mdi-bell-remove-outline</v-icon>
              </v-btn>
            </template>
            <span>Cerrar todas</span>
          </v-tooltip>
        </div>

        <div
          v-for="(snack, index) in snackbars"
          :key="snack.id"
          class="snackbar-item"
          :class="{ 'snackbar-item--divider': index > 0 }"
        >
          <div class="snackbar-header">
            <v-icon size="18" :color="snack.color">
              mdi-bell-outline
            </v-icon>
            <span v-if="snack.title" class="snackbar-title"  :style="{ color: snack.color }">
              {{ snack.title }}
            </span>
            <v-btn
              icon
              x-small
              class="snackbar-close-btn"
              aria-label="Cerrar notificación"
              @click="closeSnackbar(snack.id)"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Contenido / Texto del mensaje -->
          <div v-if="snack.text" class="snackbar-body">
            <span class="snackbar-text">
              {{ snack.text }}
            </span>
          </div>
        </div>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'GlobalSnackbar',
    computed: {
      ...mapState(['snackbars'])
    },
    methods: {
      closeSnackbar(id) {
        this.$store.commit('REMOVE_SNACKBAR', id);
      },
      closeAll() {
        this.snackbars.forEach(snack => this.closeSnackbar(snack.id));
      },
    }
  }
</script>

<style scoped>
.snackbar-container {
  position: fixed;
  top: 90px;
  right: 25px;
  z-index: 9999;
  pointer-events: none;
}

.snackbar-container ::v-deep .v-snack {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  left: auto !important;
  bottom: auto !important;
  pointer-events: auto;
}

.snackbar-container ::v-deep .v-snack__wrapper {
  background-color: transparent !important;
  box-shadow: none !important;
  width: min(1000px, calc(100vw - 50px));
  min-width: 320px;
  max-width: 1000px;
  padding: 0 !important;
  margin: 0 !important;
}

.snackbar-container ::v-deep .v-snack__content {
  padding: 0 !important;
  width: 100%;
}

.snackbar-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  /* border-top: 2px solid #104bb9; */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  padding: 10px 14px 12px 14px;
  gap: 6px;
  background-color:#F3F4F6;
  max-height: 60vh;
  overflow-y: auto;
}

.snackbar-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
  margin-bottom: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  background-color: #F3F4F6;
  z-index: 1;
}

.snackbar-list-title {
  font-size: 0.8rem;
  font-weight: 300;
  color: #121314;
  letter-spacing: 0.03em;
}

.snackbar-clear-all {
  font-size: 0.72rem;
  text-transform: none;
  min-width: 0 !important;
  width: 26px !important;
  height: 26px !important;
  padding: 0 !important;
  border-radius: 6px !important;
  border: 1px solid rgba(15, 23, 42, 0.12) !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
  color: #111827 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.snackbar-clear-all:hover {
  background-color: #f8fafc !important;
}

.snackbar-clear-all .v-btn__content {
  display: flex !important;
  align-items: center;
  justify-content: center;
  color: #111827 !important;
}

.snackbar-clear-all .v-icon,
.snackbar-clear-all-icon {
  color: #111827 !important;
  opacity: 1 !important;
}

.snackbar-tooltip-content {
  z-index: 2147483647 !important;
  background-color: #ffffff !important;
  color: #111827 !important;
  font-weight: 300 !important;
  letter-spacing: 0.01em;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12) !important;
}

.snackbar-tooltip-content .v-tooltip__content {
  background-color: #ffffff !important;
}

.snackbar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.snackbar-item--divider {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.snackbar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}


.snackbar-icon-box {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.snackbar-title {
  font-size: 0.8rem;
  font-weight: 300;
  color: #1E293B;
  line-height: 1.2;
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}

.snackbar-close-btn {
  color: #94A3B8 !important;
  margin-left: auto;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.snackbar-close-btn:hover {
  color: #475569 !important;
  background-color: #F1F5F9 !important;
}

.snackbar-body {
  padding-left: 38px;
  display: flex;
  flex-direction: column;
}

.snackbar-text {
  font-size: 0.84rem;
  font-weight: 400;
  color: #475569;
  line-height: 1.4;
  word-break: break-word;
}
</style>