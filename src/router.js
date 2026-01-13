import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/view/layout/Code"),
    },
    {
      path: "/",
      redirect: "/dashboard",
      component: () => import("@/view/layout/Layout"),
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("@/view/pages/Dashboard.vue"),
        },
        {
          path: "/server/:id",
          name: "server-overview",
          component: () => import("@/view/pages/server/ServerOverview.vue"),
        },
        {
          path: "/server/:id/settings",
          name: "server-settings",
          component: () => import("@/view/pages/server/ServerSettings.vue"),
        },
        {
          path: "/server/:id/schedules",
          name: "server-schedules",
          component: () => import("@/view/pages/server/ServerSchedules.vue"),
        },
        {
          path: "/content/texts",
          name: "daily-texts",
          component: () => import("@/view/pages/content/DailyTexts.vue"),
        },
        {
          path: "/content/news",
          name: "news-list",
          component: () => import("@/view/pages/content/NewsList.vue"),
        },
        {
          path: "/content/topics",
          name: "topics-list",
          component: () => import("@/view/pages/content/TopicsList.vue"),
        },
      ],
    },
    {
      path: "/custom-error",
      name: "error",
      component: () => import("@/view/pages/error/Error.vue"),
      children: [
        {
          path: "error-1",
          name: "error-1",
          component: () => import("@/view/pages/error/Error-1.vue"),
        },
      ],
    },
    {
      path: "/",
      component: () => import("@/view/pages/auth/login_pages/Login-1"),
      children: [
        {
          name: "login",
          path: "/login",
          component: () => import("@/view/pages/auth/login_pages/Login-1"),
        },
        {
          name: "register",
          path: "/register",
          component: () => import("@/view/pages/auth/login_pages/Login-1"),
        },
      ],
    },
    {
      path: "*",
      redirect: "/404",
    },
    {
      // the 404 route, when none of the above matches
      path: "/404",
      name: "404",
      component: () => import("@/view/pages/error/Error-1.vue"),
    },
  ],
});
