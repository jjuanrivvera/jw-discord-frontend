<template>
  <div class="server-settings">
    <LoadingSpinner v-if="loading && !guild" text="Loading settings..." />

    <ErrorAlert
      v-else-if="error && !guild"
      :message="error"
      retryable
      @retry="loadGuild"
    />

    <template v-else-if="guild">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-cog</v-icon>
          Server Settings
        </v-card-title>
        <v-card-subtitle>
          Configure bot settings for {{ guild.name }}
        </v-card-subtitle>

        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="saveSettings">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.language"
                  :items="languageOptions"
                  item-text="label"
                  item-value="value"
                  label="Bot Language"
                  hint="Language for bot responses and daily texts"
                  persistent-hint
                  outlined
                  dense
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.newsNotificationChannelId"
                  :items="channelOptions"
                  item-text="name"
                  item-value="id"
                  label="News Notification Channel"
                  hint="Channel where news updates will be posted"
                  persistent-hint
                  outlined
                  dense
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.prefix"
                  label="Command Prefix"
                  hint="Custom prefix for bot commands (default: jw!)"
                  persistent-hint
                  outlined
                  dense
                  :rules="prefixRules"
                  placeholder="jw!"
                />
              </v-col>
            </v-row>

            <ErrorAlert
              v-if="saveError"
              :message="saveError"
              type="error"
              class="mt-4"
              @dismiss="saveError = null"
            />

            <v-alert
              v-if="saveSuccess"
              type="success"
              dismissible
              class="mt-4"
              @input="saveSuccess = false"
            >
              Settings saved successfully!
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn text color="grey" :to="`/server/${guildId}`">
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
          <v-spacer />
          <v-btn text @click="resetForm"> Reset </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!valid || !hasChanges"
            @click="saveSettings"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import {
  GET_GUILD_ACTION,
  GET_GUILD_CHANNELS_ACTION,
  UPDATE_GUILD_CONFIG_ACTION,
} from "@/core/services/store/guild.module";
import { LoadingSpinner, ErrorAlert } from "@/view/components/common";

export default {
  name: "ServerSettings",
  components: {
    LoadingSpinner,
    ErrorAlert,
  },
  data() {
    return {
      guildId: null,
      valid: true,
      saving: false,
      saveError: null,
      saveSuccess: false,
      form: {
        language: null,
        newsNotificationChannelId: null,
        prefix: "",
      },
      originalForm: {},
      languageOptions: [
        { label: "Spanish", value: "es" },
        { label: "English", value: "en" },
        { label: "Portuguese", value: "pt" },
      ],
      prefixRules: [
        (v) => !v || v.length <= 10 || "Prefix must be 10 characters or less",
        (v) => !v || /^[^\s]+$/.test(v) || "Prefix cannot contain spaces",
      ],
    };
  },
  computed: {
    ...mapGetters({
      guild: "currentGuild",
      channels: "guildChannels",
      loading: "guildLoading",
      error: "guildError",
    }),
    channelOptions() {
      return this.channels.map((ch) => ({
        id: ch.id,
        name: `#${ch.name}`,
      }));
    },
    hasChanges() {
      return (
        this.form.language !== this.originalForm.language ||
        this.form.newsNotificationChannelId !==
          this.originalForm.newsNotificationChannelId ||
        this.form.prefix !== this.originalForm.prefix
      );
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
      updateConfig: UPDATE_GUILD_CONFIG_ACTION,
    }),
    async loadGuild() {
      try {
        await this.fetchGuild(this.guildId);
        await this.fetchChannels(this.guildId);

        this.populateForm();

        this.$store.dispatch(SET_BREADCRUMB, [
          { title: "Dashboard", route: "/dashboard" },
          {
            title: this.guild?.name || "Server",
            route: `/server/${this.guildId}`,
          },
          { title: "Settings" },
        ]);
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    populateForm() {
      if (this.guild) {
        this.form = {
          language: this.guild.language || null,
          newsNotificationChannelId:
            this.guild.newsNotificationChannelId || null,
          prefix: this.guild.prefix || "",
        };
        this.originalForm = { ...this.form };
      }
    },
    resetForm() {
      this.form = { ...this.originalForm };
      this.saveError = null;
      this.saveSuccess = false;
    },
    async saveSettings() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;
      this.saveError = null;
      this.saveSuccess = false;

      try {
        await this.updateConfig({
          guildId: this.guildId,
          config: {
            language: this.form.language || null,
            newsNotificationChannelId:
              this.form.newsNotificationChannelId || null,
            prefix: this.form.prefix || null,
          },
        });

        this.originalForm = { ...this.form };
        this.saveSuccess = true;
      } catch (error) {
        this.saveError =
          error.response?.data?.message || "Failed to save settings";
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.server-settings {
  max-width: 800px;
  margin: 0 auto;
}
</style>
