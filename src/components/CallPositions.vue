<template>
  <div v-if="is_loaded()">
    <CallPositionsOverview
      :callPositions="callPositions"
      :asset="asset"
      :collateral_asset="collateral_asset"
      :ticker="ticker"
      :settlementPrice=settlementPrice
    />
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs4>
          <CallPositionsChartRatios
            :callPositions="callPositions"
            :asset="asset"
            :collateral_asset="collateral_asset"
            :settlementPrice=settlementPrice
          />
        </v-flex>
        <v-flex xs4>
          <CallPositionsChartRatioVsAmount
            :callPositions="callPositions"
            :asset="asset"
            :collateral_asset="collateral_asset"
            :settlementPrice=settlementPrice
          />
        </v-flex>
        <v-flex xs4>
          <CallPositionsChartRatioVsAmountCDF
            :callPositions="callPositions"
            :asset="asset"
            :collateral_asset="collateral_asset"
            :settlementPrice=settlementPrice
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  import BitSharesConnect from './BitSharesConnect'
  import LoadingIndicator from './LoadingIndicator'
  import CallPositionsOverview from './CallPositionsOverview'
  import CallPositionsChartRatioVsAmount from './CallPositionsChartRatioVsAmount'
  import CallPositionsChartRatioVsAmountCDF from './CallPositionsChartRatioVsAmountCDF'
  import CallPositionsChartRatios from './CallPositionsChartRatios'
  import histogram from '../histogram'

  export default {
    name: 'Backing',
    props: ["symbol"],
    extends: BitSharesConnect,
    components: {
      LoadingIndicator,
      CallPositionsChartRatioVsAmount,
      CallPositionsChartRatios,
      CallPositionsOverview,
      CallPositionsChartRatioVsAmountCDF
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
        chart_amount_vs_ratio: null,
        chart_amount_vs_ratio_labels: null,
        chart_amount_vs_ratio_cdf: null,
        chart_amount_vs_ratio_cdf_labels: null,
      };
    },
    computed: {
      settlementPrice() {
        if (!this.asset_bitasset_data) return
        if (!this.asset) return;
        if (!this.collateral_asset) return;
        let feed = this.asset_bitasset_data.current_feed.settlement_price;
        return (feed.base.amount * 10 ** this.collateral_asset.precision) / (feed.quote.amount * 10 ** this.asset.precision);
      },
    },
    watch: { 
      symbol: function(newVal, oldVal) { // watch it
        console.log('Prop changed: ', newVal, ' | was: ', oldVal)
        this.$emit('loading', true);
        this.reset();
        this.getAssets();
      }
    },
    methods: {
      finish_loading() {
        if (this.is_loaded())
          this.$emit('loading', false);
      },
      reset() {
          this.asset = null
          this.collateral_asset = null
          this.ticker = null
          this.asset_bitasset_data = null
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
    }
  }
</script>

<style>
</style>
