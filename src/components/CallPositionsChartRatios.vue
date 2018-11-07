<template>
  <CallPositionsChart
    v-if="loaded"
    :chartData="chart_ratios"
    :chartLabels="chart_ratios_labels"
    yLabel="# Positions/Histogram"
    />
</template>

<script>
  import CallPositionsChart from './CallPositionsChart'
  import histogram from '../histogram'

  export default {
    name: 'CallPositionsChartRatios',
    props: ["callPositions", "asset", "collateral_asset", "settlementPrice"],
    components: {
      CallPositionsChart,
    },
    data () {
      return {
        chart_ratios: null,
        chart_ratios_labels: null,
        loaded: false
      };
    },
    methods: { },
    mounted() {
      let price = parseFloat(this.settlementPrice);
      let ratios = this.callPositions.map((x) => {
          let debt = parseFloat(x.debt) / (10 ** this.asset.precision);
          let collateral = parseFloat(x.collateral) / (10 ** this.collateral_asset.precision);
          return (collateral * price / debt).toFixed(2);
        });
      ratios.push(0);
      ratios = ratios.filter(x => x <= 10.0);
      let hist = histogram(ratios);
      this.chart_ratios = hist.bins;
      this.chart_ratios_labels = hist.labels;
      this.loaded = true
    }
  }
</script>
<style>
</style>
