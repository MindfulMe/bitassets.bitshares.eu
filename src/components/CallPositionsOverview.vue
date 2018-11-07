<template>
  <v-card>
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
  export default {
    name: 'CallPositionsOverview',
    props: ["callPositions", "asset", "collateral_asset", "ticker", "settlementPrice"],
    methods: {
      formatPrice(value, precision, currency) {
        var formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          maximumFractionDigits: precision,
          minimumFractionDigits: 2
        });
        return formatter.format(value);
      }
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
          value: this.formatSettlementPrice
        }, {
          name: "Backing ratio",
          value: this.averageRatio
        }];
      },
      totalCollateral() {
        if (!this.collateral_asset) return;
        if (!this.callPositions) return;
        let value = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.collateral), 0.0)
          / (10 ** this.collateral_asset.precision);
          return this.formatPrice(value, this.collateral_asset.precision, this.collateral_asset.symbol)
      },
      totalDebt() {
        if (!this.asset) return;
        if (!this.callPositions) return;
        let value = this.callPositions.reduce(
          (state, x) => state + parseFloat(x.debt), 0.0)
          / (10 ** this.asset.precision);
        return this.formatPrice(value, this.asset.precision, this.asset.symbol)
      },
      averageRatio() {
        if (!this.asset) return;
        if (!this.callPositions) return;
        if (!this.collateral_asset) return;
        let price = parseFloat(this.settlementPrice);
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
        if (!this.collateral_asset) return;
        return this.callPositions.length;
      },
      formatSettlementPrice() {
        if (!this.asset) return;
        if (!this.collateral_asset) return;
        let price = this.settlementPrice;
        return price.toFixed(4) + " " + this.asset.symbol + "/" + this.collateral_asset.symbol;
      },
      lastPrice() {
        if (!this.asset) return;
        if (!this.collateral_asset) return;
        if (!this.ticker) return;
        let price = parseFloat(this.ticker.latest);
        return price.toFixed(4) + " " + this.asset.symbol + "/" + this.collateral_asset.symbol;
      }
    }
  }
</script>

<style>
</style>
