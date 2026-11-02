<template>
	<v-app>
		<component :is="this.$route.meta.layout || 'div'"></component>
		<global-snackbar />
	</v-app>
</template>
<script>
	import GlobalSnackbar from './components/globalSnackbar.vue';

	export default {
	components: {
		GlobalSnackbar
	}
}	
</script>

<!-- Icono del titulo de cada vista (h2 > v-icon): borgona institucional; en tema oscuro, un tono mas claro para que se lea -->
<style>
  .v-application h2 > .v-icon:first-child,
  .v-application .v-main h3 > .v-icon:first-child {
    color: #9b2c3a !important;
  }
  .v-application.theme--dark h2 > .v-icon:first-child,
  .v-application.theme--dark .v-main h3 > .v-icon:first-child {
    color: #e08a95 !important;
  }
</style>

<!-- Buscador de las tablas (clase .toolbar-search): estilo tipo "pastilla" con sombra suave y foco borgoña -->
<style>
  .v-application .v-input.toolbar-search.v-text-field--outlined .v-input__slot {
    border-radius: 999px !important;
    padding-left: 22px !important;
    background-color: #ffffff !important;
    box-shadow: 0 3px 12px rgba(155, 44, 58, 0.10) !important;
    transition: box-shadow 0.2s ease;
  }
  .v-application .v-input.toolbar-search.v-text-field--outlined fieldset {
    border: 1px solid #e8d9b0 !important;
    border-radius: 999px !important;
    transition: border-color 0.2s ease;
  }
  .v-application .v-input.toolbar-search.v-text-field--outlined:hover fieldset {
    border-color: #f7c65e !important;
  }
  .v-application .v-input.toolbar-search.v-text-field--outlined.v-input--is-focused fieldset {
    border: 2px solid #9b2c3a !important;
  }
  .v-application .v-input.toolbar-search.v-text-field--outlined.v-input--is-focused .v-input__slot {
    box-shadow: 0 4px 16px rgba(155, 44, 58, 0.22) !important;
  }
  /* Lupa como boton dorado */
  .v-application .v-input.toolbar-search .v-input__icon--append .v-icon {
    background-color: #f7c65e;
    color: #3d2a00 !important;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 20px;
    margin-right: -10px;
    transition: background-color 0.2s ease, transform 0.15s ease;
  }
  .v-application .v-input.toolbar-search .v-input__icon--append .v-icon:hover {
    background-color: #f2b73a;
    transform: scale(1.06);
  }
  .v-application .v-input.toolbar-search .v-input__icon--clear .v-icon {
    color: #9b2c3a !important;
  }
  .v-application .v-input.toolbar-search .v-label {
    font-weight: 400;
  }
</style>
