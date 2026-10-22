<template>
	<v-container fluid>
		<v-col cols="12" class="text-center">
			<h2>
				<v-icon>mdi-liquor</v-icon>
				Gestión de Tipos de Ingesta
			</h2>
		</v-col>
		<tipoIngesta />
	</v-container>
</template>

<script>
	import tipoIngesta from "@/components/maintainers/tipoIngesta.vue" 

	export default {
		name: "TipoIngesta",
		components: {
			tipoIngesta
		},
	};
</script>