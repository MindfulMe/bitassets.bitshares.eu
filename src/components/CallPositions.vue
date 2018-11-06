<template>
  <v-card v-if="is_loaded()">
    <v-card-title><h4>{{ symbol }}</h4></v-card-title>
    <v-divider></v-divider>
    <v-list dense>
      <template v-for="(item, index) in mainitems">
        <v-list-tile :key="index">
          <v-list-tile-content>{{item.name}}</v-list-tile-content>
          <v-list-tile-content :key="item.name" class="align-end">{{ item.value }}</v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </v-card>
</template>

<script>
  import BitSharesConnect from './BitSharesConnect'
  import LoadingIndicator from './LoadingIndicator'

  export default {
    name: 'Backing',
    props: ["symbol"],
    extends: BitSharesConnect,
    components: {
      LoadingIndicator
    },
    data () {
      return {
        callPositions: [],
        ticker: null,
        asset_id: "1.3.121",
        asset: null,
        collateral_asset_id: null,
        collateral_asset: null,
        asset_bitasset_data: null,
      };
    },
    computed: {
      mainitems () {
        return [{
          name: "Collateral",
          value: this.get_total_collateral()
        },{
          name: "Debt",
          value: this.get_total_debt()
        },{
          name: "Number positions",
          value: this.get_number_positions()
        },{
          name: "Last Price",
          value: this.getLatestPrice()
        }, {
          name: "Settlement Price",
          value: this.getSettlementPrice()
        }, {
          name: "Backing ratio",
          value: this.getAverageRatio()
        }];
      },
    },
    methods: {
      finish_loading() {
        if (this.is_loaded())
          this.$emit('loading', false);
      },
      is_loaded() {
        return (
          this.asset &&
          this.collateral_asset &&
          this.ticker &&
          this.asset_bitasset_data
        );
      },
      onConnected() {
        this.getAssets();
      },
      getCallPositions() {
        if (!this.asset_id) return;

        this.chain.getCallOrders(this.asset_id)
          .then(calls => this.callPositions = calls)
          .catch(o => console.error(o))
          .finally(() => {
            this.finish_loading();
          });
      },
      getBackingAsset() {
        if (!this.asset) return;

        this.chain.getObjects([this.asset.bitasset_data_id])
          .then((c) => {
            c = c[0];
            this.asset_bitasset_data = c;
            this.collateral_asset_id = c.options.short_backing_asset;
            this.chain.getObjects([this.collateral_asset_id])
              .then((d) => {
                this.collateral_asset = d[0];
                this.getCallPositions();
                this.getTicker();
              })
              .catch(o => console.error(o))
              .finally(() => {
                this.finish_loading();
              });
          })
          .catch(o => console.error(o));
      },
      getTicker() {
        if (!this.asset_id) return;
        if (!this.collateral_asset_id) return;
        this.chain.getTicker(
          this.asset_id,
          this.collateral_asset_id
        )
          .then(ticker => this.ticker = ticker)
          .catch(o => console.error(o))
          .finally(() => {
            this.finish_loading();
          });
      },
      getAssets() {
        this.chain.getAssetFromSymbols([this.symbol])
          .then(o => {
            o = o[0];
            this.asset = o;
            this.asset_id = o.id;
            this.getBackingAsset();
          })
          .catch(o => console.error(o))
      },
      formatPrice(value, precision, currency) {
        var formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          maximumFractionDigits: precision,
          minimumFractionDigits: 2
        });
        return formatter.format(value);
      },
      get_total_collateral() {
        if (!this.collateral_asset) return;
        let value = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.collateral), 0.0)
          / (10 ** this.collateral_asset.precision);
          return this.formatPrice(value, this.collateral_asset.precision, this.collateral_asset.symbol)
      },
      get_total_debt() {
        if (!this.asset) return;

        let value = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.debt), 0.0)
          / (10 ** this.asset.precision);
        return this.formatPrice(value, this.asset.precision, this.asset.symbol)
      },
      getAverageRatio() {
        if (!this.ticker) return;
        if (!this.asset) return;
        if (!this.collateral_asset) return;

        let price = parseFloat(this._getSettlementPrice());
        let debt = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.debt), 0.0)
          / (10 ** this.asset.precision);
        let collateral = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.collateral), 0.0)
          / (10 ** this.collateral_asset.precision);
        let value = collateral * price / debt;

        return value.toFixed(4) + "x";
      },
      get_number_positions() {
        return this.callPositions.length;
      },
      _getSettlementPrice() {
        if (!this.asset_bitasset_data) return
        if (!this.asset) return;
        if (!this.collateral_asset) return;

        let feed = this.asset_bitasset_data.current_feed.settlement_price;
        return (feed.base.amount * 10 ** this.collateral_asset.precision) / (feed.quote.amount * 10 ** this.asset.precision);
      },
      getSettlementPrice() {
        if (!this.asset_bitasset_data) return
        if (!this.asset) return;
        if (!this.collateral_asset) return;

        let price = this._getSettlementPrice();
        return price.toFixed(4) + " " + this.asset.symbol + "/" + this.collateral_asset.symbol;
      },
      getLatestPrice() {
        if (!this.ticker) return;
        if (!this.collateral_asset) return;
        if (!this.asset) return;

        let price = parseFloat(this.ticker.latest);
        return price.toFixed(4) + " " + this.asset.symbol + "/" + this.collateral_asset.symbol;
      }
    }
  }
</script>

<style>
</style>
