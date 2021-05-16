<template>
  <div class="d-flex flex-column flex-root"></div>
</template>

<script>
import { mapGetters } from "vuex";
import { EXCHANGE_CODE } from "@/core/services/store/auth.module";
import {
  ADD_BODY_CLASSNAME,
  REMOVE_BODY_CLASSNAME
} from "@/core/services/store/htmlclass.module.js";

export default {
  name: "Layout",
  data() {
    return {
      user: null
    };
  },
  async mounted() {
    await this.$store.dispatch(ADD_BODY_CLASSNAME, "page-loading");

    await this.$store.dispatch(EXCHANGE_CODE, {
      code: this.$route.query.code,
      redirect_uri: `http://${location.host}/auth`
    });

    if (!this.isAuthenticated) {
      this.$router.push({ name: "login" });
    } else {
      this.$router.push({ name: "dashboard" });
    }
    // Remove page loader after some time
    await this.$store.dispatch(REMOVE_BODY_CLASSNAME, "page-loading");
  },
  computed: {
    ...mapGetters(["isAuthenticated"])
  }
};
</script>
