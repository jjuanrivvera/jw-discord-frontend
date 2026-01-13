import Vue from "vue";
import Vuetify from "vuetify";

Vue.use(Vuetify);

Vue.config.productionTip = false;

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
