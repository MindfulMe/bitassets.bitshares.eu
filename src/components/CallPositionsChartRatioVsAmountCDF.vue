<template>
  <CallPositionsChart
    v-if="loaded"
    :chartData="chart_amount_vs_ratio_cdf"
    :chartLabels="chart_amount_vs_ratio_cdf_labels"
    yLabel="Amount per Ratio"
    />
</template>

<script>
  import CallPositionsChart from './CallPositionsChart'

  export default {
    name: 'CallPositionsChartRatioVsAmountCDF',
    props: ["callPositions", "asset", "collateral_asset", "settlementPrice"],
    components: {
      CallPositionsChart,
    },
    data () {
      return {
        chart_amount_vs_ratio_cdf: null,
        chart_amount_vs_ratio_cdf_labels: null,
        loaded: false
      };
    },
    methods: {
      cumsum(x) {
        return x.reduce(function(r, a) {
          r.push((r.length && r[r.length - 1] || 0) + a);
          return r;
        }, []);
      }
    },
    mounted() {
      let price = parseFloat(this.settlementPrice);
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
      points = this.cumsum(points);
      this.chart_amount_vs_ratio_cdf = points;
      this.chart_amount_vs_ratio_cdf_labels = labels;
      this.loaded = true
    }
  }
</script>

<style>
</style>
