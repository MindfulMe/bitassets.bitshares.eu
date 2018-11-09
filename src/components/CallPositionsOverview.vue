<template>
  <v-card class="card">
    <v-list dense class="content">
      <template v-for="(item) in mainitems">
        <div class="item" :key="item.name">
          <div>{{ item.name }}</div>
          <div class="item-value">{{ item.value }}</div>
        </div>
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

<style scoped>
.card {
  height: 2%;
  width: 104%;
  margin: -2% 0 0 -2%;
}

.content {
  background-color: #055288;
  display: flex;
  padding-left: 1%;
}

.item {
  display: flex;
  flex-direction: column;
  margin: 10px 20px 10px 20px;
  color: white;
}

.item-value {
  color: #03A4DC;
}

@media only screen and (max-width: 950px) {
  .card {
    height: 100%;
    width: 104%;
    border-radius: 10px;
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .item-value {
    font-size: 15px;
  }
}
</style>