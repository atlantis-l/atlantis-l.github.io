import App from "./App.vue";
import { router, replace } from "./routes";
import { createApp } from "vue";
import { en, zh } from "./langs";
import Antd from "ant-design-vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import "ant-design-vue/dist/reset.css";
import GCWorker from "./workers/gcWorker?worker&inline";
import VueCookies from "vue-cookies";

new GCWorker();

const pinia = createPinia();

const i18n = createI18n({
  locale: "en",
  messages: { zh, en },
});

const app = createApp(App)
  .use(i18n)
  .use(Antd)
  .use(pinia)
  .use(router)
  .use(VueCookies, { expires: "1y" });

replace(VueCookies);

app.mount("#app");
