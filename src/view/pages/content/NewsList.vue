<template>
  <div class="news-list">
    <v-card>
      <v-card-title>
        <v-icon left>mdi-newspaper</v-icon>
        News
        <v-spacer />
        <v-select
          v-model="language"
          :items="languageOptions"
          item-text="label"
          item-value="value"
          label="Language"
          dense
          outlined
          hide-details
          style="max-width: 180px"
          @change="loadNews"
        />
      </v-card-title>
      <v-card-subtitle> Latest news from JW.org </v-card-subtitle>

      <v-card-text>
        <LoadingSpinner v-if="loading" text="Loading news..." />

        <ErrorAlert
          v-else-if="error"
          :message="error"
          retryable
          @retry="loadNews"
        />

        <EmptyState
          v-else-if="!news || news.length === 0"
          icon="mdi-newspaper-variant-outline"
          title="No news available"
          description="There are no news articles available for the selected language."
        />

        <template v-else>
          <v-list three-line>
            <template v-for="(item, index) in news">
              <v-list-item
                :key="item._id || index"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <v-list-item-avatar v-if="item.image">
                  <v-img :src="item.image" />
                </v-list-item-avatar>
                <v-list-item-avatar v-else>
                  <v-icon>mdi-newspaper</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="news-title">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="item.description">
                    {{ truncateText(item.description, 150) }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="mt-1">
                    <v-icon x-small class="mr-1">mdi-clock-outline</v-icon>
                    {{ formatDate(item.isoDate || item.pubDate) }}
                    <v-chip
                      v-if="item.last"
                      x-small
                      color="success"
                      class="ml-2"
                    >
                      Latest
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon small>
                    <v-icon>mdi-open-in-new</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>

              <v-divider
                v-if="index < news.length - 1"
                :key="'div-' + (item._id || index)"
              />
            </template>
          </v-list>

          <div class="d-flex justify-center mt-4">
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="7"
              @input="loadNews"
            />
          </div>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import { GET_NEWS_ACTION } from "@/core/services/store/content.module";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
} from "@/view/components/common";

export default {
  name: "NewsList",
  components: {
    LoadingSpinner,
    ErrorAlert,
    EmptyState,
  },
  data() {
    return {
      page: 1,
      limit: 10,
      totalPages: 1,
      language: "es",
      languageOptions: [
        { label: "Spanish", value: "es" },
        { label: "English", value: "en" },
        { label: "Portuguese", value: "pt" },
      ],
    };
  },
  computed: {
    ...mapGetters({
      news: "news",
      loading: "contentLoading",
      error: "contentError",
    }),
  },
  mounted() {
    this.$store.dispatch(SET_BREADCRUMB, [
      { title: "Dashboard", route: "/dashboard" },
      { title: "News" },
    ]);
    this.loadNews();
  },
  methods: {
    ...mapActions({
      fetchNews: GET_NEWS_ACTION,
    }),
    async loadNews() {
      try {
        const result = await this.fetchNews({
          page: this.page,
          limit: this.limit,
          language: this.language,
        });
        if (result && result.pagination) {
          this.totalPages = result.pagination.pages || 1;
        }
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    truncateText(text, maxLength) {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + "...";
    },
  },
};
</script>

<style scoped>
.news-list {
  max-width: 1000px;
  margin: 0 auto;
}

.news-title {
  font-weight: 500;
  white-space: normal;
  line-height: 1.4;
}
</style>
