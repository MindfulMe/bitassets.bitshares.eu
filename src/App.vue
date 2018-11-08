<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>bitAsset</span>
        <span class="font-weight-light">BACKING</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <LoadingIndicator v-if="loading" :size=16 :width=3 />
    </v-toolbar>
    <v-content>
      <v-container fluid grid-list-md>
        <v-layout wrap align-center>
          <v-flex xs12>
            <v-select
              :items="enabled_symbols"
              v-model="symbol"
              label="Select BitAsset"
              solo
              ></v-select>
          </v-flex>
          <v-flex xs12>
            <CallPositions :symbol="symbol" v-on:loading="setLoading"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import CallPositions from './components/CallPositions'
import LoadingIndicator from './components/LoadingIndicator'

export default {
  name: 'App',
  components: {
    CallPositions,
    LoadingIndicator,
  },
  data () {
    return {
      loading: true,
      symbol: "USD",
      enabled_symbols: ["USD", "CNY", "EUR"]
    }
  },
  methods: {
    setLoading(loading) {
      this.loading = loading;
    }
  }
}
</script>
