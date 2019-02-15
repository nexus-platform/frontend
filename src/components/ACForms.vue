<template>
  <v-container fluid mt-5 class="animated fadeIn">
    <v-layout row wrap mt-4>
      <v-flex sm10 offset-sm1>
        <!--Viewing a specific form-->
        <template v-if="acAction !== 'index'">
          <v-card-text v-if="loadingSubmittedForm">
            <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
          </v-card-text>
          <ac-submitted-form v-else :items="acSubmittedFormItems"></ac-submitted-form>
        </template>

        <!--Viewing all forms-->
        <template v-else>
          <v-card>
            <ac-submitted-forms
              :slug="acSlug"
              v-on:show-ac-submitted-form="showACSubmittedForm($event)"
            ></ac-submitted-forms>
          </v-card>
        </template>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ACSubmittedForms from "@/components/ACSubmittedForms";
import ACSubmittedForm from "@/components/ACSubmittedForm";

export default {
  data() {
    return {
      acSlug: null,
      acAction: null,
      loadingSubmittedForm: false,
      acSubmittedFormItems: []
    };
  },
  components: {
    ACSubmittedForm,
    ACSubmittedForms,
  },
  mounted() {
    this.acSlug = this.$store.state.registrations[0].slug;
    this.acAction = this.$route.params.action;
  },
  methods: {
    
  }
};
</script>
