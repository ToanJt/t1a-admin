import { createApp } from "vue";
import "./style.css";
import App from "./../src/App.vue";
import { router } from "./router.ts";

const app = createApp(App);
app.use(router);
app.mount("#app");
