<template>
  <div class="empty-state" :class="{ 'empty-state--compact': compact }">
    <v-icon
      v-if="icon"
      :size="compact ? 48 : 80"
      :color="iconColor"
      class="empty-state__icon mb-4"
    >
      {{ icon }}
    </v-icon>
    <h3 v-if="title" class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.actions || actionText" class="empty-state__actions mt-4">
      <slot name="actions">
        <v-btn v-if="actionText" :color="actionColor" @click="$emit('action')">
          {{ actionText }}
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "EmptyState",
  props: {
    icon: {
      type: String,
      default: "mdi-inbox-outline",
    },
    iconColor: {
      type: String,
      default: "grey lighten-1",
    },
    title: {
      type: String,
      default: "No data available",
    },
    description: {
      type: String,
      default: "",
    },
    actionText: {
      type: String,
      default: "",
    },
    actionColor: {
      type: String,
      default: "primary",
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state--compact {
  padding: 24px 16px;
}

.empty-state__title {
  color: #333;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-state--compact .empty-state__title {
  font-size: 16px;
}

.empty-state__description {
  color: #666;
  font-size: 14px;
  max-width: 400px;
  margin: 0;
}

.empty-state__actions {
  margin-top: 16px;
}
</style>
