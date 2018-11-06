<template>
  <v-container>
  </v-container>
</template>

<script>
import chain from '../chain'

export default {
  name: 'AbstractBitSharesWidget',
  props: [],
  data() {
    return {
      // state of this widget (connecting etc.)
      stateName: "Initializing",

      // if any error occured
      errorName: null,

      // installation status
      chainConnected: null,

      // access to blockchain
      chain: chain,
    }
  },
  created: function () {
    setTimeout(()=>{
      this.stateName = "ConnectingToChain";
      this._connectToChainAndStart();
    }, 1);
  },
  methods: {
    errored: function(error, message = "") {
      this.stateName = "Errored";
      this.errorName = error;
    },
      /**
       * connection to bitshares via bitsharesjs
       */
      _connectToChainAndStart: function () {
        // connection and then the ChainStore is initialized
        this.chain.connect().then(() => {
          this.chainConnected = true;
          this.stateName = "ConnectedToChain";
          this.onConnected();
        }).catch((err) => {
          this.errored(err);
          console.log("Connection attempt failed", err);
          this.chainConnected = false;
        });
      },
      onConnected: function(status) {
        // may be overwritten
      }
  }
}
</script>

<style>
</style>
