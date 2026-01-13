import ApiService from "@/core/services/api.service";

// Action types
export const GET_GUILDS_ACTION = "getGuilds";
export const GET_GUILD_ACTION = "getGuild";
export const GET_GUILD_CHANNELS_ACTION = "getGuildChannels";
export const UPDATE_GUILD_CONFIG_ACTION = "updateGuildConfig";
export const GET_GUILD_SCHEDULES_ACTION = "getGuildSchedules";
export const CREATE_SCHEDULE_ACTION = "createSchedule";
export const UPDATE_SCHEDULE_ACTION = "updateSchedule";
export const DELETE_SCHEDULE_ACTION = "deleteSchedule";

// Mutation types
export const SET_GUILDS = "setGuilds";
export const SET_CURRENT_GUILD = "setCurrentGuild";
export const SET_GUILD_CHANNELS = "setGuildChannels";
export const SET_GUILD_SCHEDULES = "setGuildSchedules";
export const SET_GUILD_LOADING = "setGuildLoading";
export const SET_GUILD_ERROR = "setGuildError";
export const ADD_SCHEDULE = "addSchedule";
export const UPDATE_SCHEDULE = "updateSchedule";
export const REMOVE_SCHEDULE = "removeSchedule";

const state = {
  guilds: [],
  currentGuild: null,
  channels: [],
  schedules: [],
  loading: false,
  error: null,
};

const getters = {
  guilds: (state) => state.guilds,
  currentGuild: (state) => state.currentGuild,
  guildChannels: (state) => state.channels,
  guildSchedules: (state) => state.schedules,
  guildLoading: (state) => state.loading,
  guildError: (state) => state.error,
  getGuildById: (state) => (id) => state.guilds.find((g) => g.id === id),
};

const actions = {
  async [GET_GUILDS_ACTION]({ commit }) {
    commit(SET_GUILD_LOADING, true);
    commit(SET_GUILD_ERROR, null);

    try {
      ApiService.setHeader();
      const response = await ApiService.get("/api/v1/guilds");
      let guilds = response.data;

      guilds = guilds.filter(
        (guild) => guild.owner === true || (guild.permissions & 0x20) !== 0
      );

      commit(SET_GUILDS, guilds);
      return guilds;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load guilds";
      commit(SET_GUILD_ERROR, message);
      throw error;
    } finally {
      commit(SET_GUILD_LOADING, false);
    }
  },

  async [GET_GUILD_ACTION]({ commit, state }, guildId) {
    commit(SET_GUILD_LOADING, true);
    commit(SET_GUILD_ERROR, null);

    try {
      let guild = state.guilds.find((g) => g.id === guildId);

      if (!guild) {
        ApiService.setHeader();
        const response = await ApiService.get(`/api/v1/guilds/${guildId}`);
        guild = response.data;
      }

      ApiService.setHeader();
      const configResponse = await ApiService.get(
        `/api/v1/guilds/${guildId}/config`
      );
      const config = configResponse.data;

      const mergedGuild = { ...guild, ...config };
      commit(SET_CURRENT_GUILD, mergedGuild);
      return mergedGuild;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load guild";
      commit(SET_GUILD_ERROR, message);
      throw error;
    } finally {
      commit(SET_GUILD_LOADING, false);
    }
  },

  async [GET_GUILD_CHANNELS_ACTION]({ commit }, guildId) {
    try {
      ApiService.setHeader();
      const response = await ApiService.get(
        `/api/v1/guilds/${guildId}/channels`
      );
      commit(SET_GUILD_CHANNELS, response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load channels";
      commit(SET_GUILD_ERROR, message);
      throw error;
    }
  },

  async [UPDATE_GUILD_CONFIG_ACTION]({ commit, state }, { guildId, config }) {
    commit(SET_GUILD_LOADING, true);
    commit(SET_GUILD_ERROR, null);

    try {
      ApiService.setHeader();
      const response = await ApiService.put(
        `/api/v1/guilds/${guildId}/config`,
        config
      );
      const updatedGuild = { ...state.currentGuild, ...response.data };
      commit(SET_CURRENT_GUILD, updatedGuild);
      return updatedGuild;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update configuration";
      commit(SET_GUILD_ERROR, message);
      throw error;
    } finally {
      commit(SET_GUILD_LOADING, false);
    }
  },

  async [GET_GUILD_SCHEDULES_ACTION]({ commit }, guildId) {
    try {
      ApiService.setHeader();
      const response = await ApiService.get(
        `/api/v1/schedules?guild=${guildId}`
      );
      commit(SET_GUILD_SCHEDULES, response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load schedules";
      commit(SET_GUILD_ERROR, message);
      throw error;
    }
  },

  async [CREATE_SCHEDULE_ACTION]({ commit }, scheduleData) {
    try {
      ApiService.setHeader();
      const response = await ApiService.post("/api/v1/schedules", scheduleData);
      commit(ADD_SCHEDULE, response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create schedule";
      commit(SET_GUILD_ERROR, message);
      throw error;
    }
  },

  async [UPDATE_SCHEDULE_ACTION]({ commit }, { scheduleId, data }) {
    try {
      ApiService.setHeader();
      const response = await ApiService.put(
        `/api/v1/schedules/${scheduleId}`,
        data
      );
      commit(UPDATE_SCHEDULE, response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update schedule";
      commit(SET_GUILD_ERROR, message);
      throw error;
    }
  },

  async [DELETE_SCHEDULE_ACTION]({ commit }, scheduleId) {
    try {
      ApiService.setHeader();
      await ApiService.delete(`/api/v1/schedules/${scheduleId}`);
      commit(REMOVE_SCHEDULE, scheduleId);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete schedule";
      commit(SET_GUILD_ERROR, message);
      throw error;
    }
  },
};

const mutations = {
  [SET_GUILDS](state, guilds) {
    state.guilds = guilds;
  },
  [SET_CURRENT_GUILD](state, guild) {
    state.currentGuild = guild;
  },
  [SET_GUILD_CHANNELS](state, channels) {
    state.channels = channels;
  },
  [SET_GUILD_SCHEDULES](state, schedules) {
    state.schedules = schedules;
  },
  [SET_GUILD_LOADING](state, loading) {
    state.loading = loading;
  },
  [SET_GUILD_ERROR](state, error) {
    state.error = error;
  },
  [ADD_SCHEDULE](state, schedule) {
    state.schedules.push(schedule);
  },
  [UPDATE_SCHEDULE](state, updatedSchedule) {
    const index = state.schedules.findIndex(
      (s) => s._id === updatedSchedule._id
    );
    if (index !== -1) {
      state.schedules.splice(index, 1, updatedSchedule);
    }
  },
  [REMOVE_SCHEDULE](state, scheduleId) {
    state.schedules = state.schedules.filter((s) => s._id !== scheduleId);
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
