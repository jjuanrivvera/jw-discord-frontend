<template>
  <div
    class="loading-spinner"
    :class="{ 'loading-spinner--fullscreen': fullscreen }"
  >
    <v-progress-circular
      :size="size"
      :width="width"
      :color="color"
      indeterminate
    />
    <p v-if="text" class="loading-spinner__text mt-3">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
  props: {
    size: {
      type: [Number, String],
      default: 50,
    },
    width: {
      type: [Number, String],
      default: 4,
    },
    color: {
      type: String,
      default: "primary",
    },
    text: {
      type: String,
      default: "",
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-spinner__text {
  color: #666;
  font-size: 14px;
  text-align: center;
}
</style>
