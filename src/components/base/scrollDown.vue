<template>
	<v-row class="scroll-down" />
</template>

<script>

export default {
	name: 'scrollDown',
};
</script>

<style scoped>
	.scroll-down {
		position: absolute;
		left: 50%;
		top: 20px;
		display: block;
		font-size: 20px;
		z-index: 100;
		text-decoration: bold;
		text-shadow: 0;
		width: 13px;
		height: 13px;
		border-bottom: 2px solid #ffffff;
		border-right: 2px solid #ffffff;
		z-index: 9;
		left: 50%;
		-webkit-transform: translate(-50%, 0%) rotate(45deg);
		-moz-transform: translate(-50%, 0%) rotate(45deg);
		transform: translate(-50%, 0%) rotate(45deg);
		-webkit-animation: fade_move_down 4s ease-in-out infinite;
		-moz-animation:    fade_move_down 4s ease-in-out infinite;
		animation:         fade_move_down 4s ease-in-out infinite;
	}


	/*animated scroll arrow animation*/
	@-webkit-keyframes fade_move_down {
		0%   { -webkit-transform:translate(0,-10px) rotate(45deg); opacity: 0;  }
		50%  { opacity: 1;  }
		100% { -webkit-transform:translate(0,10px) rotate(45deg); opacity: 0; }
	}
	@-moz-keyframes fade_move_down {
		0%   { -moz-transform:translate(0,-10px) rotate(45deg); opacity: 0;  }
		50%  { opacity: 1;  }
		100% { -moz-transform:translate(0,10px) rotate(45deg); opacity: 0; }
	}
	@keyframes fade_move_down {
		0%   { transform:translate(0,-10px) rotate(45deg); opacity: 0;  }
		50%  { opacity: 1;  }
		100% { transform:translate(0,10px) rotate(45deg); opacity: 0; }
	}
</style>