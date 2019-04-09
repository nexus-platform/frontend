<template>
  <v-flex xs12>
    <DashboardStudent v-if="$store.getters.isStudent"/>
    <DashboardNA v-else-if="$store.getters.isNA"/>
    <DashboardAC v-else-if="$store.getters.isAC"/>
  </v-flex>
</template>

<script>
import ACCalendar from "@/components/ACCalendar";
import DashboardAC from "@/components/DashboardAC";
import DashboardNA from "@/components/DashboardNA";
import DashboardStudent from "@/components/DashboardStudent";

export default {
  components: { ACCalendar, DashboardAC, DashboardNA, DashboardStudent }
};
</script>
