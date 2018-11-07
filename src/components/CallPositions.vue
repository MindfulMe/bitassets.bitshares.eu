<template>
  <div>
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
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap v-if="chart_ratios">
        <v-flex xs4>
          <CallPositionsChartRatio
            :chartData="chart_ratios"
            :chartLabels="chart_ratios_labels"
            yLabel="# Positions/Histogram"
            />
        </v-flex>
        <v-flex xs4>
          <CallPositionsChartRatio
            :chartData="chart_amount_vs_ratio"
            :chartLabels="chart_amount_vs_ratio_labels"
            yLabel="Amount per Ratio"
            />
        </v-flex>
        <v-flex xs4>
          <CallPositionsChartRatio
            :chartData="chart_amount_vs_ratio_cdf"
            :chartLabels="chart_amount_vs_ratio_cdf_labels"
            yLabel="Amount per Ratio CDF"
            />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  import BitSharesConnect from './BitSharesConnect'
  import LoadingIndicator from './LoadingIndicator'
  import CallPositionsChartRatio from './CallPositionsChartRatio'
  import histogram from '../histogram'

  export default {
    name: 'Backing',
    props: ["symbol"],
    extends: BitSharesConnect,
    components: {
      LoadingIndicator,
      CallPositionsChartRatio
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
        chart_ratios: null,
        chart_ratios_labels: null,
        chart_amount_vs_ratio: null,
        chart_amount_vs_ratio_labels: null,
        chart_amount_vs_ratio_cdf: null,
        chart_amount_vs_ratio_cdf_labels: null,
      };
    },
    computed: {
      mainitems () {
        return [{
          name: "Collateral",
          value: this.totalCollateral
        },{
          name: "Debt",
          value: this.totalDebt
        },{
          name: "Number positions",
          value: this.numberPositions
        },{
          name: "Last Price",
          value: this.lastPrice
        }, {
          name: "Settlement Price",
          value: this.settlementPrice
        }, {
          name: "Backing ratio",
          value: this.averageRatio
        }];
      },
      totalCollateral() {
        if (!this.collateral_asset) return;
        let value = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.collateral), 0.0)
          / (10 ** this.collateral_asset.precision);
          return this.formatPrice(value, this.collateral_asset.precision, this.collateral_asset.symbol)
      },
      totalDebt() {
        if (!this.asset) return;
        let value = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.debt), 0.0)
          / (10 ** this.asset.precision);
        return this.formatPrice(value, this.asset.precision, this.asset.symbol)
      },
      averageRatio() {
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
      numberPositions() {
        return this.callPositions.length;
      },
      settlementPrice() {
        if (!this.asset_bitasset_data) return
        if (!this.asset) return;
        if (!this.collateral_asset) return;
        let price = this._getSettlementPrice();
        return price.toFixed(4) + " " + this.asset.symbol + "/" + this.collateral_asset.symbol;
      },
      lastPrice() {
        if (!this.ticker) return;
        if (!this.collateral_asset) return;
        if (!this.asset) return;
        let price = parseFloat(this.ticker.latest);
        return price.toFixed(4) + " " + this.asset.symbol + "/" + this.collateral_asset.symbol;
      }
    },
    methods: {
      _getSettlementPrice() {
        if (!this.asset_bitasset_data) return
        if (!this.asset) return;
        if (!this.collateral_asset) return;
        let feed = this.asset_bitasset_data.current_feed.settlement_price;
        return (feed.base.amount * 10 ** this.collateral_asset.precision) / (feed.quote.amount * 10 ** this.asset.precision);
      },
      finish_loading() {
        this.prepareChartData();
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
      prepareChartData() {
        if (!this.ticker) return;
        if (!this.asset) return;
        if (!this.collateral_asset) return;
        let price = parseFloat(this._getSettlementPrice());

        // ratios
        let ratios = this.callPositions.map((x) => {
            let debt = parseFloat(x.debt) / (10 ** this.asset.precision);
            let collateral = parseFloat(x.collateral) / (10 ** this.collateral_asset.precision);
            return (collateral * price / debt).toFixed(2);
          });
        // prepare ratios
        ratios.push(0);
        ratios = ratios.filter(x => x <= 10.0);
        // histogram
        let hist = histogram(ratios);
        this.chart_ratios = hist.bins;
        this.chart_ratios_labels = hist.labels;

        // amount per ratio
        let data = this.callPositions.map((x) => {
          let debt = parseFloat(x.debt) / (10 ** this.asset.precision);
          let collateral = parseFloat(x.collateral) / (10 ** this.collateral_asset.precision);
          let ratio = (collateral * price / debt);
          return { ratio, debt, collateral };
        });
        data = data.filter(x => x.ratio < 10);
        data = data.filter(x => x.debt > 1000);
        data.unshift({ratio: 0.0, debt: 0.0, collateral: 0.0});
        let points = data.map(x => x.debt)
        let labels = data.map(x => x.ratio);

        this.chart_amount_vs_ratio = points;
        this.chart_amount_vs_ratio_labels = labels;

        points = this.cumsum(points);
        this.chart_amount_vs_ratio_cdf = points;
        this.chart_amount_vs_ratio_cdf_labels = labels;
      },
      cumsum(x) {
        return x.reduce(function(r, a) {
          r.push((r.length && r[r.length - 1] || 0) + a);
          return r;
        }, []);
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
      }
    }
  }
</script>

<style>
</style>
