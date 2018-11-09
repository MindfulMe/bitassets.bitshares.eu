<template>
  <v-app>
    
    <v-toolbar class="header" app>
      <v-toolbar-title class="headline text-uppercase">
        <span>bitAsset</span>
        <span class="font-weight-light">BACKING</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-flex xs12>
        <v-select
          :items="enabled_symbols"
          v-model="symbol"
          class="select"
          solo
          >
          <!-- eslint-disable-next-line -->
          <template slot="selection" slot-scope="data">
            <v-avatar size="32px">
              <svgicon
                :name="symbol"
                width="32"
                height="32"
              />
            </v-avatar>
            &nbsp;&nbsp;{{ symbol }}
          </template>
        </v-select>
        </v-flex>
      <LoadingIndicator v-if="loading" :size=32 :width=3 />
    </v-toolbar>
    <v-content class="body">
      <v-container fluid grid-list-md>
        <v-layout wrap align-center>
          <v-flex xs12>
            <CallPositions :symbol="symbol" v-on:loading="setLoading"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    
  </v-app>
</template>

<script>
import '@/assets/icons/'
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

<style lang="css" scoped>
.body {
	font-family: "Open Sans",sans-serif;
	font-size: 20px; 
}

.header {
  background-color: white;
}

.select {
  margin: -40px 10px 0 auto;
	width: 160px;
	padding: 15px;
	height: 25px;
	cursor: pointer;
  color: #03A4DC;
}

.headline {
  color: #03A4DC;
}
</style>

