<template>
  <v-flex xs12>
    <ACCalendar/>
    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import ACCalendar from "@/components/ac/ACCalendar";

export default {
  components: { ACCalendar }
};
</script>
