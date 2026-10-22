<template>
	<span>{{ `${min}:${sec}` }}</span>
</template>

<script>

export default {
	name: 'countdown',
	props: {
        segundos: {
            type: Number,
            required: true,
        },
    },
	data() {
		return {
			restante: null,
			time: null,
			min: 0,
			sec: 0,
		};
	},
	async beforeMount() {
		await this.inicializar()
	},
	async mounted() {
		await this.tiempo(this.segundos)
	},
	watch: {
        restante (val) {
			console.log('restante', val)
            if (val === 0) {
				console.log('emite')
                this.$emit('finish')
            }
        },
	},
	methods: {
		
		async tiempo(s) {
			if (s == -1) {
				clearTimeout(this.time)
			}
			else {
				this.time = setTimeout(() => {
					this.min = Math.trunc(s / 60)
					this.sec = s % 60
					this.restante = s

					// recursividad
					this.tiempo(s - 1)
				}, 1000);
			}
		},

		async inicializar() {
			this.min = Math.trunc(this.segundos / 60)
			this.sec = this.segundos % 60
		}
	}
};
</script>