<template>
	<v-container fluid>
		<v-col cols="12" class="text-center">
			<h2>
				<v-icon>mdi-file-replace-outline</v-icon>
				Informes de Incidentes de Seguridad
			</h2>
		</v-col>
		<incidentesCDTE />
	</v-container>
</template>

<script>
	import incidentesCDTE from "@/components/information/incidentesCDTE.vue" 
	export default {
		name       : "IncidentesCDTE",
		components : {
			incidentesCDTE
		},
	};
</script>