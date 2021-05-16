// action types
import { SET_ERROR } from "./auth.module";
import JwtService from "@/core/services/jwt.service";

export const UPDATE_PERSONAL_INFO = "updateUserPersonalInfo";
export const UPDATE_ACCOUNT_INFO = "updateUserAccountInfo";
export const GET_PERSONAL_INFO = "getPersonalInfo";

// mutation types
export const SET_PERSONAL_INFO = "setPersonalInfo";
export const SET_ACCOUNT_INFO = "setAccountInfo";

const state = {
  user_personal_info: {
    id: "id",
    avatar: "avatar",
    username: "username"
  },
  user_account_info: null
};

const getters = {
  currentUserPersonalInfo(state) {
    return state.user_personal_info;
  },

  currentUserAccountInfo(state) {
    return state.user_account_info;
  },

  currentUserPhoto(state) {
    return state.user_personal_info.avatar;
  }
};

const actions = {
  [UPDATE_PERSONAL_INFO](context, payload) {
    context.commit(SET_PERSONAL_INFO, payload);
  },
  [UPDATE_ACCOUNT_INFO](context, payload) {
    context.commit(SET_ACCOUNT_INFO, payload);
  },
  async [GET_PERSONAL_INFO](context) {
    const url = `${process.env.VUE_APP_JW_DISCORD_API}/api/v1/users/me`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JwtService.getToken()}`,
        "Access-Control-Allow-Origin": "*"
      }
    });

    if (response.status === 200) {
      const user = await response.json();
      context.commit(SET_PERSONAL_INFO, user);
    } else {
      context.commit(SET_ERROR, "Invalid code");
    }
  }
};

const mutations = {
  [SET_PERSONAL_INFO](state, user_personal_info) {
    state.user_personal_info = user_personal_info;
  },
  [SET_ACCOUNT_INFO](state, user_account_info) {
    state.user_account_info = user_account_info;
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
