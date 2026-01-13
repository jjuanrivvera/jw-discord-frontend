<template>
  <div class="daily-texts">
    <v-card>
      <v-card-title>
        <v-icon left>mdi-book-open-page-variant</v-icon>
        Daily Texts
      </v-card-title>
      <v-card-subtitle> Browse and view daily texts by date </v-card-subtitle>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-date-picker
              v-model="selectedDate"
              full-width
              color="primary"
              :max="today"
              @input="loadText"
            />
          </v-col>

          <v-col cols="12" md="8">
            <LoadingSpinner v-if="loading" text="Loading text..." />

            <ErrorAlert
              v-else-if="error"
              :message="error"
              retryable
              @retry="loadText"
            />

            <EmptyState
              v-else-if="!dailyText"
              icon="mdi-calendar-remove"
              title="No text available"
              description="There is no daily text available for the selected date."
            />

            <v-card v-else outlined>
              <v-card-title class="primary white--text">
                {{ formatDate(selectedDate) }}
              </v-card-title>
              <v-card-subtitle class="primary white--text pb-3">
                {{ dailyText.text }}
              </v-card-subtitle>
              <v-card-text class="pt-4">
                <blockquote class="text-h6 font-italic mb-4 scripture-quote">
                  "{{ dailyText.textContent }}"
                </blockquote>
                <v-divider class="my-4" />
                <div
                  class="explanation-text"
                  v-html="formatExplanation(dailyText.explanation)"
                />
              </v-card-text>
              <v-card-actions>
                <v-btn text color="primary" @click="copyLink">
                  <v-icon left>mdi-link</v-icon>
                  Copy Link
                </v-btn>
                <v-spacer />
                <v-btn text :disabled="!canGoPrevious" @click="previousDay">
                  <v-icon left>mdi-chevron-left</v-icon>
                  Previous
                </v-btn>
                <v-btn text :disabled="!canGoNext" @click="nextDay">
                  Next
                  <v-icon right>mdi-chevron-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="showCopied" color="success" timeout="2000">
      Link copied to clipboard!
    </v-snackbar>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { SET_BREADCRUMB } from "@/core/services/store/breadcrumbs.module";
import { GET_DAILY_TEXT_ACTION } from "@/core/services/store/content.module";
import {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
} from "@/view/components/common";

export default {
  name: "DailyTexts",
  components: {
    LoadingSpinner,
    ErrorAlert,
    EmptyState,
  },
  data() {
    return {
      selectedDate: new Date().toISOString().substr(0, 10),
      showCopied: false,
    };
  },
  computed: {
    ...mapGetters({
      dailyText: "dailyText",
      loading: "contentLoading",
      error: "contentError",
    }),
    today() {
      return new Date().toISOString().substr(0, 10);
    },
    canGoPrevious() {
      return true;
    },
    canGoNext() {
      return this.selectedDate < this.today;
    },
  },
  mounted() {
    this.$store.dispatch(SET_BREADCRUMB, [
      { title: "Dashboard", route: "/dashboard" },
      { title: "Daily Texts" },
    ]);
    this.loadText();
  },
  methods: {
    ...mapActions({
      fetchDailyText: GET_DAILY_TEXT_ACTION,
    }),
    async loadText() {
      try {
        await this.fetchDailyText({ date: this.selectedDate });
      } catch (error) {
        // Error is handled by the store
        void error;
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr + "T12:00:00");
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatExplanation(text) {
      if (!text) return "";
      return text
        .split("\n\n")
        .map((p) => `<p>${p}</p>`)
        .join("");
    },
    previousDay() {
      const date = new Date(this.selectedDate);
      date.setDate(date.getDate() - 1);
      this.selectedDate = date.toISOString().substr(0, 10);
      this.loadText();
    },
    nextDay() {
      const date = new Date(this.selectedDate);
      date.setDate(date.getDate() + 1);
      this.selectedDate = date.toISOString().substr(0, 10);
      this.loadText();
    },
    copyLink() {
      const url = `${window.location.origin}/content/texts?date=${this.selectedDate}`;
      navigator.clipboard.writeText(url);
      this.showCopied = true;
    },
  },
};
</script>

<style scoped>
.daily-texts {
  max-width: 1200px;
  margin: 0 auto;
}

.scripture-quote {
  border-left: 4px solid var(--v-primary-base, #1976d2);
  padding-left: 16px;
  margin-left: 0;
  color: #555;
}

.explanation-text {
  line-height: 1.8;
}

.explanation-text >>> p {
  margin-bottom: 16px;
}

.explanation-text >>> p:last-child {
  margin-bottom: 0;
}
</style>
