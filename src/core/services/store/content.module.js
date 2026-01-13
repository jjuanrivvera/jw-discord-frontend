import ApiService from "@/core/services/api.service";

// Action types
export const GET_DAILY_TEXT_ACTION = "getDailyText";
export const GET_NEWS_ACTION = "getNews";
export const GET_TOPICS_ACTION = "getTopics";
export const SEARCH_TOPICS_ACTION = "searchTopics";

// Mutation types
export const SET_DAILY_TEXT = "setDailyText";
export const SET_NEWS = "setNews";
export const SET_TOPICS = "setTopics";
export const SET_CONTENT_LOADING = "setContentLoading";
export const SET_CONTENT_ERROR = "setContentError";

const state = {
  dailyText: null,
  news: [],
  topics: [],
  loading: false,
  error: null,
};

const getters = {
  dailyText: (state) => state.dailyText,
  news: (state) => state.news,
  topics: (state) => state.topics,
  contentLoading: (state) => state.loading,
  contentError: (state) => state.error,
};

const actions = {
  async [GET_DAILY_TEXT_ACTION]({ commit }, { date, language } = {}) {
    commit(SET_CONTENT_LOADING, true);
    commit(SET_CONTENT_ERROR, null);

    try {
      ApiService.setHeader();
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      if (language) params.append("language", language);

      const queryString = params.toString();
      const url = queryString
        ? `/api/v1/texts/today?${queryString}`
        : "/api/v1/texts/today";
      const response = await ApiService.get(url);

      commit(SET_DAILY_TEXT, response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load daily text";
      commit(SET_CONTENT_ERROR, message);
      throw error;
    } finally {
      commit(SET_CONTENT_LOADING, false);
    }
  },

  async [GET_NEWS_ACTION]({ commit }, { page = 1, limit = 10, language } = {}) {
    commit(SET_CONTENT_LOADING, true);
    commit(SET_CONTENT_ERROR, null);

    try {
      ApiService.setHeader();
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (language) params.append("language", language);

      const response = await ApiService.get(
        `/api/v1/news?${params.toString()}`
      );
      commit(SET_NEWS, response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load news";
      commit(SET_CONTENT_ERROR, message);
      throw error;
    } finally {
      commit(SET_CONTENT_LOADING, false);
    }
  },

  async [GET_TOPICS_ACTION]({ commit }, { page = 1, limit = 20 } = {}) {
    commit(SET_CONTENT_LOADING, true);
    commit(SET_CONTENT_ERROR, null);

    try {
      ApiService.setHeader();
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const response = await ApiService.get(
        `/api/v1/topics?${params.toString()}`
      );
      commit(SET_TOPICS, response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load topics";
      commit(SET_CONTENT_ERROR, message);
      throw error;
    } finally {
      commit(SET_CONTENT_LOADING, false);
    }
  },

  async [SEARCH_TOPICS_ACTION]({ commit }, query) {
    commit(SET_CONTENT_LOADING, true);
    commit(SET_CONTENT_ERROR, null);

    try {
      ApiService.setHeader();
      const response = await ApiService.get(
        `/api/v1/topics/search?q=${encodeURIComponent(query)}`
      );
      commit(SET_TOPICS, response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to search topics";
      commit(SET_CONTENT_ERROR, message);
      throw error;
    } finally {
      commit(SET_CONTENT_LOADING, false);
    }
  },
};

const mutations = {
  [SET_DAILY_TEXT](state, text) {
    state.dailyText = text;
  },
  [SET_NEWS](state, news) {
    state.news = news;
  },
  [SET_TOPICS](state, topics) {
    state.topics = topics;
  },
  [SET_CONTENT_LOADING](state, loading) {
    state.loading = loading;
  },
  [SET_CONTENT_ERROR](state, error) {
    state.error = error;
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
