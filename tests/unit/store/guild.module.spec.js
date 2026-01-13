import guildModule, {
  GET_GUILDS_ACTION,
  GET_GUILD_ACTION,
  GET_GUILD_CHANNELS_ACTION,
  UPDATE_GUILD_CONFIG_ACTION,
  GET_GUILD_SCHEDULES_ACTION,
  CREATE_SCHEDULE_ACTION,
  UPDATE_SCHEDULE_ACTION,
  DELETE_SCHEDULE_ACTION,
  SET_GUILDS,
  SET_CURRENT_GUILD,
  SET_GUILD_CHANNELS,
  SET_GUILD_SCHEDULES,
  SET_GUILD_LOADING,
  SET_GUILD_ERROR,
  ADD_SCHEDULE,
  UPDATE_SCHEDULE,
  REMOVE_SCHEDULE,
} from "@/core/services/store/guild.module";

jest.mock("@/core/services/api.service", () => ({
  setHeader: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

import ApiService from "@/core/services/api.service";

describe("Guild Module", () => {
  let state;

  beforeEach(() => {
    state = {
      guilds: [],
      currentGuild: null,
      channels: [],
      schedules: [],
      loading: false,
      error: null,
    };
    jest.clearAllMocks();
  });

  describe("Getters", () => {
    it("should return guilds", () => {
      state.guilds = [{ id: "1", name: "Test Guild" }];
      expect(guildModule.getters.guilds(state)).toEqual(state.guilds);
    });

    it("should return currentGuild", () => {
      state.currentGuild = { id: "1", name: "Test Guild" };
      expect(guildModule.getters.currentGuild(state)).toEqual(
        state.currentGuild
      );
    });

    it("should return guildChannels", () => {
      state.channels = [{ id: "1", name: "general" }];
      expect(guildModule.getters.guildChannels(state)).toEqual(state.channels);
    });

    it("should return guildSchedules", () => {
      state.schedules = [{ _id: "1", action: "sendDailyText" }];
      expect(guildModule.getters.guildSchedules(state)).toEqual(
        state.schedules
      );
    });

    it("should return guildLoading", () => {
      state.loading = true;
      expect(guildModule.getters.guildLoading(state)).toBe(true);
    });

    it("should return guildError", () => {
      state.error = "Test error";
      expect(guildModule.getters.guildError(state)).toBe("Test error");
    });

    it("should return getGuildById function", () => {
      state.guilds = [
        { id: "1", name: "Guild 1" },
        { id: "2", name: "Guild 2" },
      ];
      const getter = guildModule.getters.getGuildById(state);
      expect(getter("1")).toEqual({ id: "1", name: "Guild 1" });
      expect(getter("3")).toBeUndefined();
    });
  });

  describe("Mutations", () => {
    it("SET_GUILDS should update guilds", () => {
      const guilds = [{ id: "1", name: "Test" }];
      guildModule.mutations[SET_GUILDS](state, guilds);
      expect(state.guilds).toEqual(guilds);
    });

    it("SET_CURRENT_GUILD should update currentGuild", () => {
      const guild = { id: "1", name: "Test" };
      guildModule.mutations[SET_CURRENT_GUILD](state, guild);
      expect(state.currentGuild).toEqual(guild);
    });

    it("SET_GUILD_CHANNELS should update channels", () => {
      const channels = [{ id: "1", name: "general" }];
      guildModule.mutations[SET_GUILD_CHANNELS](state, channels);
      expect(state.channels).toEqual(channels);
    });

    it("SET_GUILD_SCHEDULES should update schedules", () => {
      const schedules = [{ _id: "1", action: "sendDailyText" }];
      guildModule.mutations[SET_GUILD_SCHEDULES](state, schedules);
      expect(state.schedules).toEqual(schedules);
    });

    it("SET_GUILD_LOADING should update loading", () => {
      guildModule.mutations[SET_GUILD_LOADING](state, true);
      expect(state.loading).toBe(true);
    });

    it("SET_GUILD_ERROR should update error", () => {
      guildModule.mutations[SET_GUILD_ERROR](state, "Error message");
      expect(state.error).toBe("Error message");
    });

    it("ADD_SCHEDULE should add schedule to array", () => {
      const schedule = { _id: "1", action: "sendDailyText" };
      guildModule.mutations[ADD_SCHEDULE](state, schedule);
      expect(state.schedules).toContainEqual(schedule);
    });

    it("UPDATE_SCHEDULE should update existing schedule", () => {
      state.schedules = [{ _id: "1", action: "sendDailyText", time: "07" }];
      const updated = { _id: "1", action: "sendDailyText", time: "08" };
      guildModule.mutations[UPDATE_SCHEDULE](state, updated);
      expect(state.schedules[0].time).toBe("08");
    });

    it("REMOVE_SCHEDULE should remove schedule by id", () => {
      state.schedules = [
        { _id: "1", action: "sendDailyText" },
        { _id: "2", action: "sendRandomTopic" },
      ];
      guildModule.mutations[REMOVE_SCHEDULE](state, "1");
      expect(state.schedules).toHaveLength(1);
      expect(state.schedules[0]._id).toBe("2");
    });
  });

  describe("Actions", () => {
    let commit;

    beforeEach(() => {
      commit = jest.fn();
    });

    describe("GET_GUILDS_ACTION", () => {
      it("should fetch and filter guilds", async () => {
        const guilds = [
          { id: "1", name: "Guild 1", owner: true, permissions: 0 },
          { id: "2", name: "Guild 2", owner: false, permissions: 0x20 },
          { id: "3", name: "Guild 3", owner: false, permissions: 0 },
        ];
        ApiService.get.mockResolvedValue({ data: guilds });

        const result = await guildModule.actions[GET_GUILDS_ACTION]({ commit });

        expect(commit).toHaveBeenCalledWith(SET_GUILD_LOADING, true);
        expect(commit).toHaveBeenCalledWith(SET_GUILD_ERROR, null);
        expect(result).toHaveLength(2);
        expect(commit).toHaveBeenCalledWith(SET_GUILD_LOADING, false);
      });

      it("should handle errors", async () => {
        const error = { response: { data: { message: "Server error" } } };
        ApiService.get.mockRejectedValue(error);

        await expect(
          guildModule.actions[GET_GUILDS_ACTION]({ commit })
        ).rejects.toEqual(error);

        expect(commit).toHaveBeenCalledWith(SET_GUILD_ERROR, "Server error");
      });
    });

    describe("GET_GUILD_ACTION", () => {
      it("should fetch guild from state if exists", async () => {
        const mockState = {
          guilds: [{ id: "1", name: "Existing Guild" }],
        };
        ApiService.get.mockResolvedValue({
          data: { language: "es", newsNotificationChannelId: "123" },
        });

        await guildModule.actions[GET_GUILD_ACTION](
          { commit, state: mockState },
          "1"
        );

        expect(commit).toHaveBeenCalledWith(
          SET_CURRENT_GUILD,
          expect.objectContaining({ id: "1", name: "Existing Guild" })
        );
      });
    });

    describe("GET_GUILD_CHANNELS_ACTION", () => {
      it("should fetch channels", async () => {
        const channels = [{ id: "1", name: "general" }];
        ApiService.get.mockResolvedValue({ data: channels });

        const result = await guildModule.actions[GET_GUILD_CHANNELS_ACTION](
          { commit },
          "123"
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/guilds/123/channels"
        );
        expect(commit).toHaveBeenCalledWith(SET_GUILD_CHANNELS, channels);
        expect(result).toEqual(channels);
      });
    });

    describe("UPDATE_GUILD_CONFIG_ACTION", () => {
      it("should update guild config", async () => {
        const mockState = { currentGuild: { id: "1", name: "Test" } };
        ApiService.put.mockResolvedValue({
          data: { language: "en" },
        });

        await guildModule.actions[UPDATE_GUILD_CONFIG_ACTION](
          { commit, state: mockState },
          { guildId: "1", config: { language: "en" } }
        );

        expect(ApiService.put).toHaveBeenCalledWith("/api/v1/guilds/1/config", {
          language: "en",
        });
        expect(commit).toHaveBeenCalledWith(
          SET_CURRENT_GUILD,
          expect.objectContaining({ language: "en" })
        );
      });
    });

    describe("GET_GUILD_SCHEDULES_ACTION", () => {
      it("should fetch schedules for guild", async () => {
        const schedules = [{ _id: "1", action: "sendDailyText" }];
        ApiService.get.mockResolvedValue({ data: schedules });

        const result = await guildModule.actions[GET_GUILD_SCHEDULES_ACTION](
          { commit },
          "123"
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/schedules?guild=123"
        );
        expect(commit).toHaveBeenCalledWith(SET_GUILD_SCHEDULES, schedules);
        expect(result).toEqual(schedules);
      });
    });

    describe("CREATE_SCHEDULE_ACTION", () => {
      it("should create new schedule", async () => {
        const newSchedule = {
          guild: "123",
          action: "sendDailyText",
          channelId: "456",
          time: "07",
        };
        const createdSchedule = { _id: "1", ...newSchedule };
        ApiService.post.mockResolvedValue({ data: createdSchedule });

        const result = await guildModule.actions[CREATE_SCHEDULE_ACTION](
          { commit },
          newSchedule
        );

        expect(ApiService.post).toHaveBeenCalledWith(
          "/api/v1/schedules",
          newSchedule
        );
        expect(commit).toHaveBeenCalledWith(ADD_SCHEDULE, createdSchedule);
        expect(result).toEqual(createdSchedule);
      });
    });

    describe("UPDATE_SCHEDULE_ACTION", () => {
      it("should update existing schedule", async () => {
        const updatedData = { action: "sendRandomTopic", time: "08" };
        const updatedSchedule = { _id: "1", ...updatedData };
        ApiService.put.mockResolvedValue({ data: updatedSchedule });

        const result = await guildModule.actions[UPDATE_SCHEDULE_ACTION](
          { commit },
          { scheduleId: "1", data: updatedData }
        );

        expect(ApiService.put).toHaveBeenCalledWith(
          "/api/v1/schedules/1",
          updatedData
        );
        expect(commit).toHaveBeenCalledWith(UPDATE_SCHEDULE, updatedSchedule);
        expect(result).toEqual(updatedSchedule);
      });
    });

    describe("DELETE_SCHEDULE_ACTION", () => {
      it("should delete schedule", async () => {
        ApiService.delete.mockResolvedValue({});

        await guildModule.actions[DELETE_SCHEDULE_ACTION]({ commit }, "1");

        expect(ApiService.delete).toHaveBeenCalledWith("/api/v1/schedules/1");
        expect(commit).toHaveBeenCalledWith(REMOVE_SCHEDULE, "1");
      });
    });
  });
});
