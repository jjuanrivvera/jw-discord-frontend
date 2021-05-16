<template>
  <div>
    <div
      class="subheader gutter-b subheader-transparent subheader-background"
      id="kt_subheader"
      v-if="headerMenuEnabled"
    ></div>
    <div v-if="!headerMenuEnabled" class="gutter-b"></div>
  </div>
</template>

<style>
.subheader-background {
  background-color: #663259;
  background-position: right bottom;
  background-size: auto 100%;
  background-repeat: no-repeat;
}
</style>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Subheader",
  computed: {
    ...mapGetters(["layoutConfig"]),

    /**
     * Check if the header menu is enabled
     * @returns {boolean}
     */
    headerMenuEnabled() {
      return !!this.layoutConfig("subheader.display");
    },

    /**
     * Check if subheader width is fluid
     */
    widthFluid() {
      return this.layoutConfig("subheader.width") === "fluid";
    },

    subheaderClasses() {
      const classes = [];
      const style = this.layoutConfig("subheader.style");
      if (style) {
        classes.push(style);

        if (style === "solid") {
          classes.push("bg-white");
        }

        if (this.layoutConfig("subheader.fixed")) {
          classes.push("border-top");
        }
      }
      return classes.join(" ");
    }
  }
};
</script>
