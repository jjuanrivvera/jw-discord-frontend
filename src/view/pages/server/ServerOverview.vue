<template>
  <div class="server-overview">
    <LoadingSpinner v-if="loading" text="Loading server details..." />

    <ErrorAlert
      v-else-if="error"
      :message="error"
      retryable
      @retry="loadGuild"
    />

    <template v-else-if="guild">
      <div class="row">
        <div class="col-12">
          <v-card class="mb-4">
            <v-card-text>
              <div class="d-flex align-items-center">
                <v-avatar size="80" class="mr-4">
                  <img :src="avatarUrl" :alt="guild.name" />
                </v-avatar>
                <div>
                  <h2 class="mb-1">{{ guild.name }}</h2>
                  <div class="d-flex align-items-center">
                    <v-chip
                      v-if="guild.owner"
                      small
                      color="primary"
                      class="mr-2"
                    >
                      Owner
                    </v-chip>
                    <span class="text-muted">ID: {{ guild.id }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon left>mdi-cog</v-icon>
              Configuration
            </v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Language</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ getLanguageLabel(guild.language) || "Default" }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>News Channel</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        getChannelName(guild.newsNotificationChannelId) ||
                        "Not set"
                      }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Command Prefix</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ guild.prefix || "jw!" }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" text :to="`/server/${guildId}/settings`">
                Edit Settings
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <div class="col-md-6">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon left>mdi-calendar-clock</v-icon>
              Schedules
            </v-card-title>
            <v-card-text>
              <EmptyState
                v-if="schedules.length === 0"
                icon="mdi-calendar-blank"
                title="No schedules"
                description="Set up automatic daily texts or topic posts"
                action-text="Add Schedule"
                compact
                @action="goToSchedules"
              />
              <v-list v-else dense>
                <v-list-item
                  v-for="schedule in schedules.slice(0, 3)"
                  :key="schedule._id"
                >
                  <v-list-item-icon>
                    <v-icon>{{ getScheduleIcon(schedule.action) }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ getScheduleLabel(schedule.action) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ schedule.time }}:00 -
                      {{ getChannelName(schedule.channelId) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" text :to="`/server/${guildId}/schedules`">
                {{ schedules.length > 0 ? "Manage Schedules" : "Add Schedule" }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <v-card>
            <v-card-title>
              <v-icon left>mdi-lightning-bolt</v-icon>
              Quick Actions
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    outlined
                    block
                    color="primary"
                    :to="`/server/${guildId}/settings`"
                  >
                    <v-icon left>mdi-cog</v-icon>
                    Settings
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    outlined
                    block
                    color="primary"
                    :to="`/server/${guildId}/schedules`"
                  >
                    <v-icon left>mdi-calendar</v-icon>
                    Schedules
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-btn outlined block color="primary" @click="refreshData">
                    <v-icon left>mdi-refresh</v-icon>
                    Refresh
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-btn outlined block color="grey" to="/dashboard">
                    <v-icon left>mdi-arrow-left</v-icon>
                    Back
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import {
  GET_GUILD_ACTION,
  GET_GUILD_CHANNELS_ACTION,
  GET_GUILD_SCHEDULES_ACTION,
} from "@/core/services/store/guild.module";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
} from "@/view/components/common";

export default {
  name: "ServerOverview",
  components: {
    LoadingSpinner,
    ErrorAlert,
    EmptyState,
  },
  data() {
    return {
      guildId: null,
    };
  },
  computed: {
    ...mapGetters({
      guild: "currentGuild",
      channels: "guildChannels",
      schedules: "guildSchedules",
      loading: "guildLoading",
      error: "guildError",
    }),
    avatarUrl() {
      if (!this.guild) return "";
      if (this.guild.icon) {
        return `https://cdn.discordapp.com/icons/${this.guild.id}/${this.guild.icon}.png`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.guild.name
      )}&background=5865F2&color=fff&size=80`;
    },
  },
  created() {
    this.guildId = this.$route.params.id;
    this.loadGuild();
  },
  methods: {
    ...mapActions({
      fetchGuild: GET_GUILD_ACTION,
      fetchChannels: GET_GUILD_CHANNELS_ACTION,
      fetchSchedules: GET_GUILD_SCHEDULES_ACTION,
    }),
    async loadGuild() {
      try {
        await this.fetchGuild(this.guildId);
        await Promise.all([
          this.fetchChannels(this.guildId),
          this.fetchSchedules(this.guildId),
        ]);

        this.$store.dispatch(SET_BREADCRUMB, [
          { title: "Dashboard", route: "/dashboard" },
          { title: this.guild?.name || "Server" },
        ]);
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    refreshData() {
      this.loadGuild();
    },
    goToSchedules() {
      this.$router.push(`/server/${this.guildId}/schedules`);
    },
    getChannelName(channelId) {
      if (!channelId || !this.channels.length) return null;
      const channel = this.channels.find((c) => c.id === channelId);
      return channel ? `#${channel.name}` : null;
    },
    getLanguageLabel(code) {
      const languages = {
        es: "Español",
        en: "English",
        pt: "Português",
      };
      return languages[code] || null;
    },
    getScheduleIcon(action) {
      const icons = {
        sendDailyText: "mdi-book-open-variant",
        sendRandomTopic: "mdi-comment-question",
      };
      return icons[action] || "mdi-calendar";
    },
    getScheduleLabel(action) {
      const labels = {
        sendDailyText: "Daily Text",
        sendRandomTopic: "Random Topic",
      };
      return labels[action] || action;
    },
  },
};
</script>

<style scoped>
.server-overview {
  padding-bottom: 20px;
}
</style>
