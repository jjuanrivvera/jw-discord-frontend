import contentModule, {
  GET_DAILY_TEXT_ACTION,
  GET_NEWS_ACTION,
  GET_TOPICS_ACTION,
  SEARCH_TOPICS_ACTION,
  SET_DAILY_TEXT,
  SET_NEWS,
  SET_TOPICS,
  SET_CONTENT_LOADING,
  SET_CONTENT_ERROR,
} from "@/core/services/store/content.module";

jest.mock("@/core/services/api.service", () => ({
  setHeader: jest.fn(),
  get: jest.fn(),
}));

import ApiService from "@/core/services/api.service";

describe("Content Module", () => {
  let state;

  beforeEach(() => {
    state = {
      dailyText: null,
      news: [],
      topics: [],
      loading: false,
      error: null,
    };
    jest.clearAllMocks();
  });

  describe("Getters", () => {
    it("should return dailyText", () => {
      state.dailyText = { date: "2024-01-01", text: "Test verse" };
      expect(contentModule.getters.dailyText(state)).toEqual(state.dailyText);
    });

    it("should return news", () => {
      state.news = [{ title: "News 1" }, { title: "News 2" }];
      expect(contentModule.getters.news(state)).toEqual(state.news);
    });

    it("should return topics", () => {
      state.topics = [{ title: "Topic 1" }, { title: "Topic 2" }];
      expect(contentModule.getters.topics(state)).toEqual(state.topics);
    });

    it("should return contentLoading", () => {
      state.loading = true;
      expect(contentModule.getters.contentLoading(state)).toBe(true);
    });

    it("should return contentError", () => {
      state.error = "Test error";
      expect(contentModule.getters.contentError(state)).toBe("Test error");
    });
  });

  describe("Mutations", () => {
    it("SET_DAILY_TEXT should update dailyText", () => {
      const text = { date: "2024-01-01", text: "Test verse" };
      contentModule.mutations[SET_DAILY_TEXT](state, text);
      expect(state.dailyText).toEqual(text);
    });

    it("SET_NEWS should update news", () => {
      const news = [{ title: "News 1" }];
      contentModule.mutations[SET_NEWS](state, news);
      expect(state.news).toEqual(news);
    });

    it("SET_TOPICS should update topics", () => {
      const topics = [{ title: "Topic 1" }];
      contentModule.mutations[SET_TOPICS](state, topics);
      expect(state.topics).toEqual(topics);
    });

    it("SET_CONTENT_LOADING should update loading", () => {
      contentModule.mutations[SET_CONTENT_LOADING](state, true);
      expect(state.loading).toBe(true);
    });

    it("SET_CONTENT_ERROR should update error", () => {
      contentModule.mutations[SET_CONTENT_ERROR](state, "Error message");
      expect(state.error).toBe("Error message");
    });
  });

  describe("Actions", () => {
    let commit;

    beforeEach(() => {
      commit = jest.fn();
    });

    describe("GET_DAILY_TEXT_ACTION", () => {
      it("should fetch daily text without params", async () => {
        const dailyText = { date: "2024-01-01", text: "Test verse" };
        ApiService.get.mockResolvedValue({ data: dailyText });

        const result = await contentModule.actions[GET_DAILY_TEXT_ACTION]({
          commit,
        });

        expect(commit).toHaveBeenCalledWith(SET_CONTENT_LOADING, true);
        expect(ApiService.get).toHaveBeenCalledWith("/api/v1/texts/today");
        expect(commit).toHaveBeenCalledWith(SET_DAILY_TEXT, dailyText);
        expect(commit).toHaveBeenCalledWith(SET_CONTENT_LOADING, false);
        expect(result).toEqual(dailyText);
      });

      it("should fetch daily text with date and language params", async () => {
        const dailyText = { date: "2024-01-15", text: "Test verse" };
        ApiService.get.mockResolvedValue({ data: dailyText });

        await contentModule.actions[GET_DAILY_TEXT_ACTION](
          { commit },
          { date: "2024-01-15", language: "es" }
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/texts/today?date=2024-01-15&language=es"
        );
      });

      it("should handle errors", async () => {
        const error = { response: { data: { message: "Not found" } } };
        ApiService.get.mockRejectedValue(error);

        await expect(
          contentModule.actions[GET_DAILY_TEXT_ACTION]({ commit })
        ).rejects.toEqual(error);

        expect(commit).toHaveBeenCalledWith(SET_CONTENT_ERROR, "Not found");
      });
    });

    describe("GET_NEWS_ACTION", () => {
      it("should fetch news with default params", async () => {
        const news = [{ title: "News 1" }, { title: "News 2" }];
        ApiService.get.mockResolvedValue({ data: news });

        const result = await contentModule.actions[GET_NEWS_ACTION]({ commit });

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/news?page=1&limit=10"
        );
        expect(commit).toHaveBeenCalledWith(SET_NEWS, news);
        expect(result).toEqual(news);
      });

      it("should fetch news with custom params", async () => {
        const news = [{ title: "News 1" }];
        ApiService.get.mockResolvedValue({ data: news });

        await contentModule.actions[GET_NEWS_ACTION](
          { commit },
          { page: 2, limit: 5, language: "en" }
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/news?page=2&limit=5&language=en"
        );
      });
    });

    describe("GET_TOPICS_ACTION", () => {
      it("should fetch topics with default params", async () => {
        const topics = [{ title: "Topic 1" }];
        ApiService.get.mockResolvedValue({ data: topics });

        const result = await contentModule.actions[GET_TOPICS_ACTION]({
          commit,
        });

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/topics?page=1&limit=20"
        );
        expect(commit).toHaveBeenCalledWith(SET_TOPICS, topics);
        expect(result).toEqual(topics);
      });

      it("should fetch topics with custom params", async () => {
        const topics = [{ title: "Topic 1" }];
        ApiService.get.mockResolvedValue({ data: topics });

        await contentModule.actions[GET_TOPICS_ACTION](
          { commit },
          { page: 3, limit: 10 }
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/topics?page=3&limit=10"
        );
      });
    });

    describe("SEARCH_TOPICS_ACTION", () => {
      it("should search topics by query", async () => {
        const topics = [{ title: "Bible Study" }];
        ApiService.get.mockResolvedValue({ data: topics });

        const result = await contentModule.actions[SEARCH_TOPICS_ACTION](
          { commit },
          "bible"
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/topics/search?q=bible"
        );
        expect(commit).toHaveBeenCalledWith(SET_TOPICS, topics);
        expect(result).toEqual(topics);
      });

      it("should encode special characters in query", async () => {
        ApiService.get.mockResolvedValue({ data: [] });

        await contentModule.actions[SEARCH_TOPICS_ACTION](
          { commit },
          "bible study & prayer"
        );

        expect(ApiService.get).toHaveBeenCalledWith(
          "/api/v1/topics/search?q=bible%20study%20%26%20prayer"
        );
      });

      it("should handle errors", async () => {
        const error = { response: { data: { message: "Search failed" } } };
        ApiService.get.mockRejectedValue(error);

        await expect(
          contentModule.actions[SEARCH_TOPICS_ACTION]({ commit }, "test")
        ).rejects.toEqual(error);

        expect(commit).toHaveBeenCalledWith(SET_CONTENT_ERROR, "Search failed");
      });
    });
  });
});
