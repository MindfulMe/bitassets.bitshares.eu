<template>
  <CallPositionsChart
    v-if="loaded"
    :chartData="chart_amount_vs_ratio"
    :chartLabels="chart_amount_vs_ratio_labels"
    class="chart-body"
    yLabel="Amount per Ratio"
    />
</template>

<script>
  import CallPositionsChart from './CallPositionsChart'

  export default {
    name: 'CallPositionsChartRatioVsAmount',
    props: ["callPositions", "asset", "collateral_asset", "settlementPrice"],
    components: {
      CallPositionsChart,
    },
    data () {
      return {
        chart_amount_vs_ratio: null,
        chart_amount_vs_ratio_labels: null,
        loaded: false
      };
    },
    methods: {},
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
      this.chart_amount_vs_ratio = points;
      this.chart_amount_vs_ratio_labels = labels;
      this.loaded = true
    }
  }
</script>
