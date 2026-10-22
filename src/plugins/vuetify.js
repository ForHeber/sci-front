import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

const light = {
    primary: '#B71C1C',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#008000',
    warning: '#FFC107',
}

const dark = {
    primary: "#f02525",
    secondary: "#808080",
    accent: '#82B1FF',
    error: "#FF5252",
    info: "#D1E4F2",
    success: "#B7D5B8",
    warning: '#FFC107',
}

export default new Vuetify({
    theme: {
        themes: {
            light,
            dark,
        },
    },
});
