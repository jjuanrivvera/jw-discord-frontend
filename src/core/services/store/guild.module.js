import JwtService from "@/core/services/jwt.service";

// action types
export const GET_GUILDS_ACTION = "getGuilds";

// mutation types
export const GET_GUILDS_MUTATION = "getGuilds";
export const SET_GUILDS = "setGuilds";

const state = {
  errors: null,
  guilds: {}
};

const getters = {
  guilds(state) {
    return state.guilds;
  }
};

const actions = {
  async [GET_GUILDS_ACTION](context) {
    const url = `${process.env.VUE_APP_JW_DISCORD_API}/api/v1/guilds`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JwtService.getToken()}`,
        "Access-Control-Allow-Origin": "*"
      }
    });

    if (response.status === 200) {
      let guilds = await response.json();
      guilds = guilds.filter(
        guild => guild.owner === true || (guild.permissions & 0x0000000020) != 0
      );
      context.commit(SET_GUILDS, guilds);
    }
  }
};

const mutations = {
  [SET_GUILDS](state, guilds) {
    state.guilds = guilds;
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
