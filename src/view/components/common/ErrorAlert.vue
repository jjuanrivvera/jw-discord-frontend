<template>
  <v-alert
    :type="type"
    :dismissible="dismissible"
    :prominent="prominent"
    :outlined="outlined"
    class="error-alert"
    @input="$emit('dismiss')"
  >
    <template v-slot:prepend v-if="icon">
      <v-icon>{{ icon }}</v-icon>
    </template>
    <div class="error-alert__content">
      <strong v-if="title" class="error-alert__title">{{ title }}</strong>
      <p class="error-alert__message mb-0">{{ message }}</p>
      <slot name="actions">
        <v-btn v-if="retryable" text small class="mt-2" @click="$emit('retry')">
          {{ retryText }}
        </v-btn>
      </slot>
    </div>
  </v-alert>
</template>

<script>
export default {
  name: "ErrorAlert",
  props: {
    type: {
      type: String,
      default: "error",
      validator: (value) =>
        ["error", "warning", "info", "success"].includes(value),
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    dismissible: {
      type: Boolean,
      default: true,
    },
    prominent: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: "",
    },
    retryable: {
      type: Boolean,
      default: false,
    },
    retryText: {
      type: String,
      default: "Try Again",
    },
  },
};
</script>

<style scoped>
.error-alert {
  margin-bottom: 16px;
}

.error-alert__title {
  display: block;
  margin-bottom: 4px;
}

.error-alert__message {
  font-size: 14px;
}
</style>
