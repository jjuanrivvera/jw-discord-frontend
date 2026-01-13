<template>
  <div class="server-schedules">
    <LoadingSpinner v-if="loading && !guild" text="Loading schedules..." />

    <ErrorAlert
      v-else-if="error && !guild"
      :message="error"
      retryable
      @retry="loadData"
    />

    <template v-else-if="guild">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-calendar-clock</v-icon>
          Scheduled Actions
          <v-spacer />
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            Add Schedule
          </v-btn>
        </v-card-title>
        <v-card-subtitle>
          Manage automated daily texts and topic posts for {{ guild.name }}
        </v-card-subtitle>

        <v-card-text>
          <ErrorAlert
            v-if="actionError"
            :message="actionError"
            type="error"
            class="mb-4"
            @dismiss="actionError = null"
          />

          <EmptyState
            v-if="schedules.length === 0"
            icon="mdi-calendar-blank"
            title="No schedules configured"
            description="Set up automated actions to post daily texts or discussion topics at specific times."
            action-text="Create Schedule"
            @action="openCreateDialog"
          />

          <v-data-table
            v-else
            :headers="tableHeaders"
            :items="schedules"
            :loading="tableLoading"
            item-key="_id"
            class="elevation-0"
          >
            <template v-slot:item.action="{ item }">
              <v-chip :color="getActionColor(item.action)" small>
                <v-icon left small>{{ getActionIcon(item.action) }}</v-icon>
                {{ getActionLabel(item.action) }}
              </v-chip>
            </template>

            <template v-slot:item.time="{ item }">
              {{ formatTime(item.time) }}
            </template>

            <template v-slot:item.channelId="{ item }">
              {{ getChannelName(item.channelId) }}
            </template>

            <template v-slot:item.last="{ item }">
              {{ item.last || "Never" }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon small @click="openEditDialog(item)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon small color="error" @click="confirmDelete(item)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-btn text color="grey" :to="`/server/${guildId}`">
            <v-icon left>mdi-arrow-left</v-icon>
            Back to Overview
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Create/Edit Dialog -->
      <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card>
          <v-card-title>
            {{ isEditing ? "Edit Schedule" : "Create Schedule" }}
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="formValid">
              <v-select
                v-model="form.action"
                :items="actionOptions"
                item-text="label"
                item-value="value"
                label="Action Type"
                :rules="[(v) => !!v || 'Action is required']"
                outlined
                dense
              />

              <v-select
                v-model="form.channelId"
                :items="channelOptions"
                item-text="name"
                item-value="id"
                label="Channel"
                :rules="[(v) => !!v || 'Channel is required']"
                outlined
                dense
              />

              <v-select
                v-model="form.time"
                :items="timeOptions"
                label="Time (Hour)"
                :rules="[(v) => v !== null || 'Time is required']"
                outlined
                dense
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="closeDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!formValid"
              @click="saveSchedule"
            >
              {{ isEditing ? "Update" : "Create" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title>Delete Schedule</v-card-title>
          <v-card-text>
            Are you sure you want to delete this schedule? This action cannot be
            undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="deleteDialog = false">Cancel</v-btn>
            <v-btn color="error" :loading="deleting" @click="deleteSchedule">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
  CREATE_SCHEDULE_ACTION,
  UPDATE_SCHEDULE_ACTION,
  DELETE_SCHEDULE_ACTION,
} from "@/core/services/store/guild.module";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
} from "@/view/components/common";

export default {
  name: "ServerSchedules",
  components: {
    LoadingSpinner,
    ErrorAlert,
    EmptyState,
  },
  data() {
    return {
      guildId: null,
      dialog: false,
      deleteDialog: false,
      isEditing: false,
      formValid: true,
      saving: false,
      deleting: false,
      tableLoading: false,
      actionError: null,
      selectedSchedule: null,
      form: {
        action: null,
        channelId: null,
        time: null,
      },
      tableHeaders: [
        { text: "Action", value: "action", sortable: true },
        { text: "Time", value: "time", sortable: true },
        { text: "Channel", value: "channelId", sortable: false },
        { text: "Last Run", value: "last", sortable: true },
        { text: "Actions", value: "actions", sortable: false, align: "end" },
      ],
      actionOptions: [
        { label: "Send Daily Text", value: "sendDailyText" },
        { label: "Send Random Topic", value: "sendRandomTopic" },
      ],
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
    channelOptions() {
      return this.channels.map((ch) => ({
        id: ch.id,
        name: `#${ch.name}`,
      }));
    },
    timeOptions() {
      const options = [];
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, "0");
        options.push({
          text: `${hour}:00`,
          value: hour,
        });
      }
      return options;
    },
  },
  created() {
    this.guildId = this.$route.params.id;
    this.loadData();
  },
  methods: {
    ...mapActions({
      fetchGuild: GET_GUILD_ACTION,
      fetchChannels: GET_GUILD_CHANNELS_ACTION,
      fetchSchedules: GET_GUILD_SCHEDULES_ACTION,
      createSchedule: CREATE_SCHEDULE_ACTION,
      updateSchedule: UPDATE_SCHEDULE_ACTION,
      removeSchedule: DELETE_SCHEDULE_ACTION,
    }),
    async loadData() {
      try {
        await this.fetchGuild(this.guildId);
        await Promise.all([
          this.fetchChannels(this.guildId),
          this.fetchSchedules(this.guildId),
        ]);

        this.$store.dispatch(SET_BREADCRUMB, [
          { title: "Dashboard", route: "/dashboard" },
          {
            title: this.guild?.name || "Server",
            route: `/server/${this.guildId}`,
          },
          { title: "Schedules" },
        ]);
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    openCreateDialog() {
      this.isEditing = false;
      this.form = {
        action: null,
        channelId: null,
        time: null,
      };
      this.dialog = true;
    },
    openEditDialog(schedule) {
      this.isEditing = true;
      this.selectedSchedule = schedule;
      this.form = {
        action: schedule.action,
        channelId: schedule.channelId,
        time: schedule.time,
      };
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.selectedSchedule = null;
      this.$refs.form?.reset();
    },
    confirmDelete(schedule) {
      this.selectedSchedule = schedule;
      this.deleteDialog = true;
    },
    async saveSchedule() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;
      this.actionError = null;

      try {
        if (this.isEditing) {
          await this.updateSchedule({
            scheduleId: this.selectedSchedule._id,
            data: {
              action: this.form.action,
              channelId: this.form.channelId,
              time: this.form.time,
            },
          });
        } else {
          await this.createSchedule({
            guild: this.guildId,
            action: this.form.action,
            channelId: this.form.channelId,
            time: this.form.time,
          });
        }
        this.closeDialog();
      } catch (error) {
        this.actionError =
          error.response?.data?.message || "Failed to save schedule";
      } finally {
        this.saving = false;
      }
    },
    async deleteSchedule() {
      this.deleting = true;
      this.actionError = null;

      try {
        await this.removeSchedule(this.selectedSchedule._id);
        this.deleteDialog = false;
        this.selectedSchedule = null;
      } catch (error) {
        this.actionError =
          error.response?.data?.message || "Failed to delete schedule";
        this.deleteDialog = false;
      } finally {
        this.deleting = false;
      }
    },
    getChannelName(channelId) {
      const channel = this.channels.find((c) => c.id === channelId);
      return channel ? `#${channel.name}` : channelId;
    },
    formatTime(hour) {
      return `${hour}:00`;
    },
    getActionLabel(action) {
      const labels = {
        sendDailyText: "Daily Text",
        sendRandomTopic: "Random Topic",
      };
      return labels[action] || action;
    },
    getActionIcon(action) {
      const icons = {
        sendDailyText: "mdi-book-open-variant",
        sendRandomTopic: "mdi-comment-question",
      };
      return icons[action] || "mdi-calendar";
    },
    getActionColor(action) {
      const colors = {
        sendDailyText: "primary",
        sendRandomTopic: "secondary",
      };
      return colors[action] || "grey";
    },
  },
};
</script>

<style scoped>
.server-schedules {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
