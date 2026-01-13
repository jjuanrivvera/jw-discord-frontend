<template>
  <div class="dashboard">
    <LoadingSpinner v-if="loading" text="Loading your servers..." />

    <ErrorAlert
      v-else-if="error"
      :message="error"
      retryable
      @retry="loadGuilds"
    />

    <template v-else>
      <div class="row">
        <div class="col-12">
          <v-card>
            <v-card-title>
              <v-icon left>mdi-server</v-icon>
              Your Servers
            </v-card-title>
            <v-card-subtitle>
              Select a server to manage its bot configuration
            </v-card-subtitle>

            <v-card-text>
              <EmptyState
                v-if="!guilds || guilds.length === 0"
                icon="mdi-server-off"
                title="No servers found"
                description="You don't have admin access to any servers with the JW Bot installed."
              />

              <v-row v-else>
                <v-col
                  v-for="guild in guilds"
                  :key="guild.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <GuildCard :guild="guild" @click="navigateToServer" />
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
import { GET_GUILDS_ACTION } from "@/core/services/store/guild.module";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
  GuildCard,
} from "@/view/components/common";

export default {
  name: "Dashboard",
  components: {
    LoadingSpinner,
    ErrorAlert,
    EmptyState,
    GuildCard,
  },
  computed: {
    ...mapGetters({
      guilds: "guilds",
      loading: "guildLoading",
      error: "guildError",
    }),
  },
  mounted() {
    this.$store.dispatch(SET_BREADCRUMB, [{ title: "Dashboard" }]);
    this.loadGuilds();
  },
  methods: {
    ...mapActions({
      fetchGuilds: GET_GUILDS_ACTION,
    }),
    async loadGuilds() {
      try {
        await this.fetchGuilds();
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    navigateToServer(guild) {
      this.$router.push(`/server/${guild.id}`);
    },
  },
};
</script>

<style scoped>
.dashboard {
  padding-bottom: 20px;
}
</style>
