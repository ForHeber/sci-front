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
