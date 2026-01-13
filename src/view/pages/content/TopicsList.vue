<template>
  <div class="topics-list">
    <v-card>
      <v-card-title>
        <v-icon left>mdi-comment-question</v-icon>
        Discussion Topics
        <v-spacer />
        <v-btn color="primary" @click="getRandomTopic">
          <v-icon left>mdi-shuffle</v-icon>
          Random Topic
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        Browse discussion topics for your meetings
      </v-card-subtitle>

      <v-card-text>
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search topics..."
          outlined
          dense
          clearable
          class="mb-4"
          @keyup.enter="searchTopics"
          @click:clear="clearSearch"
        />

        <LoadingSpinner v-if="loading" text="Loading topics..." />

        <ErrorAlert
          v-else-if="error"
          :message="error"
          retryable
          @retry="loadTopics"
        />

        <EmptyState
          v-else-if="!topics || topics.length === 0"
          icon="mdi-comment-question-outline"
          title="No topics found"
          :description="
            searchQuery
              ? 'No topics match your search criteria.'
              : 'There are no discussion topics available.'
          "
        />

        <template v-else>
          <v-expansion-panels accordion>
            <v-expansion-panel v-for="topic in topics" :key="topic._id">
              <v-expansion-panel-header>
                <div class="d-flex align-center">
                  <v-icon small class="mr-2">mdi-comment-text-outline</v-icon>
                  {{ topic.name }}
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p class="topic-discussion mb-3">{{ topic.discussion }}</p>
                <v-btn
                  v-if="topic.query"
                  small
                  text
                  color="primary"
                  :href="getWolUrl(topic.query)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <v-icon left small>mdi-open-in-new</v-icon>
                  Search on WOL
                </v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="d-flex justify-center mt-4">
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="7"
              @input="loadTopics"
            />
          </div>
        </template>
      </v-card-text>
    </v-card>

    <!-- Random Topic Dialog -->
    <v-dialog v-model="showRandomDialog" max-width="600">
      <v-card v-if="randomTopic">
        <v-card-title class="primary white--text">
          <v-icon left dark>mdi-shuffle</v-icon>
          Random Topic
        </v-card-title>
        <v-card-text class="pt-4">
          <h3 class="text-h6 mb-3">{{ randomTopic.name }}</h3>
          <p class="topic-discussion">{{ randomTopic.discussion }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="randomTopic.query"
            text
            color="primary"
            :href="getWolUrl(randomTopic.query)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-icon left small>mdi-open-in-new</v-icon>
            Search on WOL
          </v-btn>
          <v-spacer />
          <v-btn text @click="showRandomDialog = false">Close</v-btn>
          <v-btn color="primary" @click="getRandomTopic">
            <v-icon left>mdi-refresh</v-icon>
            Another Topic
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import {
  GET_TOPICS_ACTION,
  SEARCH_TOPICS_ACTION,
} from "@/core/services/store/content.module";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
} from "@/view/components/common";

export default {
  name: "TopicsList",
  components: {
    LoadingSpinner,
    ErrorAlert,
    EmptyState,
  },
  data() {
    return {
      page: 1,
      limit: 20,
      totalPages: 1,
      searchQuery: "",
      showRandomDialog: false,
      randomTopic: null,
    };
  },
  computed: {
    ...mapGetters({
      topics: "topics",
      loading: "contentLoading",
      error: "contentError",
    }),
  },
  mounted() {
    this.$store.dispatch(SET_BREADCRUMB, [
      { title: "Dashboard", route: "/dashboard" },
      { title: "Topics" },
    ]);
    this.loadTopics();
  },
  methods: {
    ...mapActions({
      fetchTopics: GET_TOPICS_ACTION,
      searchTopicsAction: SEARCH_TOPICS_ACTION,
    }),
    async loadTopics() {
      try {
        const result = await this.fetchTopics({
          page: this.page,
          limit: this.limit,
        });
        if (result && result.pagination) {
          this.totalPages = result.pagination.pages || 1;
        }
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    async searchTopics() {
      if (!this.searchQuery || this.searchQuery.length < 2) {
        this.loadTopics();
        return;
      }
      try {
        await this.searchTopicsAction(this.searchQuery);
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    clearSearch() {
      this.searchQuery = "";
      this.page = 1;
      this.loadTopics();
    },
    getRandomTopic() {
      if (this.topics && this.topics.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.topics.length);
        this.randomTopic = this.topics[randomIndex];
        this.showRandomDialog = true;
      }
    },
    getWolUrl(query) {
      return `https://wol.jw.org/es/wol/s/r4/lp-s?q=${encodeURIComponent(
        query
      )}`;
    },
  },
};
</script>

<style scoped>
.topics-list {
  max-width: 1000px;
  margin: 0 auto;
}

.topic-discussion {
  color: #555;
  line-height: 1.6;
  font-size: 15px;
}
</style>
