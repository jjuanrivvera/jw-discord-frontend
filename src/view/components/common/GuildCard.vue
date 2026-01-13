<template>
  <v-card
    class="guild-card"
    :class="{ 'guild-card--clickable': clickable }"
    :elevation="hover ? 8 : 2"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="handleClick"
  >
    <div class="guild-card__content">
      <v-avatar :size="avatarSize" class="guild-card__avatar">
        <img :src="avatarUrl" :alt="guild.name" />
      </v-avatar>
      <div class="guild-card__info">
        <h3 class="guild-card__name">{{ guild.name }}</h3>
        <div class="guild-card__meta">
          <v-chip v-if="guild.owner" x-small color="primary" class="mr-1">
            Owner
          </v-chip>
          <v-chip
            v-else-if="hasAdminPermission"
            x-small
            color="secondary"
            class="mr-1"
          >
            Admin
          </v-chip>
          <span v-if="guild.language" class="guild-card__language">
            {{ getLanguageLabel(guild.language) }}
          </span>
        </div>
      </div>
      <v-icon v-if="clickable" class="guild-card__arrow">
        mdi-chevron-right
      </v-icon>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "GuildCard",
  props: {
    guild: {
      type: Object,
      required: true,
    },
    avatarSize: {
      type: [Number, String],
      default: 64,
    },
    clickable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    avatarUrl() {
      if (this.guild.icon) {
        return `https://cdn.discordapp.com/icons/${this.guild.id}/${this.guild.icon}.png`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.guild.name
      )}&background=5865F2&color=fff`;
    },
    hasAdminPermission() {
      return this.guild.permissions && (this.guild.permissions & 0x8) !== 0;
    },
  },
  methods: {
    handleClick() {
      if (this.clickable) {
        this.$emit("click", this.guild);
      }
    },
    getLanguageLabel(code) {
      const languages = {
        es: "Español",
        en: "English",
        pt: "Português",
      };
      return languages[code] || code;
    },
  },
};
</script>

<style scoped>
.guild-card {
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.guild-card--clickable {
  cursor: pointer;
}

.guild-card--clickable:hover {
  transform: translateY(-2px);
}

.guild-card__content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.guild-card__avatar {
  flex-shrink: 0;
}

.guild-card__info {
  flex: 1;
  margin-left: 16px;
  overflow: hidden;
}

.guild-card__name {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.guild-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.guild-card__language {
  font-size: 12px;
  color: #666;
}

.guild-card__arrow {
  flex-shrink: 0;
  color: #999;
}
</style>
