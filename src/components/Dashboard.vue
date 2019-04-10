<template>
  <v-flex xs12>
    <StudentDashboard v-if="$store.getters.isStudent"/>
    <NADashboard v-else-if="$store.getters.isNA"/>
    <ACDashboard v-else-if="$store.getters.isAC"/>
  </v-flex>
</template>

<script>
import ACDashboard from "@/components/ac/ACDashboard";
import NADashboard from "@/components/ac/NADashboard";
import StudentDashboard from "@/components/StudentDashboard";

export default {
  components: { ACDashboard, NADashboard, StudentDashboard }
};
</script>
