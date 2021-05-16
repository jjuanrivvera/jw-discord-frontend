<template>
  <div>
    <!--begin::Dashboard-->
    <!--begin::Row-->
    <div class="row">
      <div class="col-md-12">
        <b-card>
          <template v-slot:header>
            <h6 class="mb-0">Guilds</h6>
          </template>
          <v-row class="d-flex justify-content-center">
            <b-link
              v-for="guild in guilds"
              :key="guild.id"
              :href="guild.redirect"
            >
              <v-avatar size="150">
                <img
                  :src="
                    guild.icon ||
                      `https://ui-avatars.com/api/?name=${guild.name.replace(
                        ' ',
                        '+'
                      )}`
                  "
                  :alt="guild.name"
                />
              </v-avatar>
            </b-link>
          </v-row>
        </b-card>
      </div>
    </div>
    <!--end::Row-->
    <!--end::Dashboard-->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import { GET_GUILDS_ACTION } from "@/core/services/store/guild.module";

export default {
  name: "dashboard",
  mounted() {
    this.$store.dispatch(SET_BREADCRUMB, [{ title: "Dashboard" }]);
    this.$store.dispatch(GET_GUILDS_ACTION);
  },
  computed: {
    ...mapGetters(["guilds"])
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
    }
  }
};
</script>
