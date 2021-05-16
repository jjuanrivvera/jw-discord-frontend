<template>
  <div>
    <!--begin::Dashboard-->
    <!--begin::Row-->
    <div class="row">
      <div class="col-xl-4"></div>
      <div class="col-xl-8"></div>
    </div>
    <!--end::Row-->
    <div class="row"></div>
    <!--end::Row-->
    <div class="row"></div>
    <!--end::Row-->
    <!--begin::Row-->
    <div class="row"></div>
    <!--end::Row-->
    <!--end::Dashboard-->
  </div>
</template>

<script>
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import axios from "axios";

export default {
  name: "auth",
  data() {
    return {
      code: null,
      user: null
    };
  },
  mounted() {
    this.$store.dispatch(SET_BREADCRUMB, [{ title: "Auth" }]);
    this.code = this.$route.query.code;
  },
  methods: {
    setActiveTab1(event) {
      this.tabIndex = this.setActiveTab(event);
    },
    setActiveTab2(event) {
      this.tabIndex2 = this.setActiveTab(event);
    },
    /**
     * Set current active on click
     * @param event
     */
    setActiveTab(event) {
      // get all tab links
      const tab = event.target.closest('[role="tablist"]');
      const links = tab.querySelectorAll(".nav-link");
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove("active");
      }

      // set current active tab
      event.target.classList.add("active");

      // set clicked tab index to bootstrap tab
      return parseInt(event.target.getAttribute("data-tab"));
    },

    async loginWithDiscord() {
      const url = "https://b25afed0ec5f.ngrok.io/api/v1/auth/login";

      this.user = await axios({
        method: "POST",
        url: url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
          code: this.code
        }
      });
    }
  }
};
</script>
