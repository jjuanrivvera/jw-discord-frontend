<template>
  <v-dialog
    v-model="dialog"
    :max-width="maxWidth"
    :persistent="persistent"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-card-title :class="titleClass">
        <v-icon v-if="icon" left :color="iconColor">{{ icon }}</v-icon>
        {{ title }}
      </v-card-title>
      <v-card-text class="pt-4">
        <slot>{{ message }}</slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text :disabled="loading" @click="cancel">
          {{ cancelText }}
        </v-btn>
        <v-btn :color="confirmColor" :loading="loading" @click="confirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Confirm Action",
    },
    message: {
      type: String,
      default: "Are you sure you want to proceed?",
    },
    confirmText: {
      type: String,
      default: "Confirm",
    },
    cancelText: {
      type: String,
      default: "Cancel",
    },
    confirmColor: {
      type: String,
      default: "primary",
    },
    icon: {
      type: String,
      default: "",
    },
    iconColor: {
      type: String,
      default: "",
    },
    maxWidth: {
      type: [String, Number],
      default: 400,
    },
    persistent: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    dialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    titleClass() {
      if (this.confirmColor === "error") return "error--text";
      if (this.confirmColor === "warning") return "warning--text";
      return "";
    },
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
      this.dialog = false;
    },
  },
};
</script>
