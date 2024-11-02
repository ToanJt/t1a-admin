import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Projects from "./pages/Projects.vue";
import AboutUs from "./pages/AboutUs.vue";
import Contact from "./pages/Contact.vue";
import Feedback from "./pages/Feedback.vue";
import UpdateProject from "./pages/UpdateProject.vue";
import NewProject from "./pages/NewProject.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/projects",
    children: [
      {
        path: "",
        name: "projects",
        component: Projects,
      },
      {
        path: ":id",
        name: "update-project",
        component: UpdateProject,
        props: true,
      },
      {
        path: "/new-project",
        name: "new-project",
        component: NewProject,
      },
    ],
  },
  {
    path: "/about-us",
    name: "about-us",
    component: AboutUs,
  },
  {
    path: "/contact",
    name: "contact",
    component: Contact,
  },
  {
    path: "/feedback",
    name: "feedback",
    component: Feedback,
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

export { router };
