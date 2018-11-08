<script>
  import { Line, mixins } from 'vue-chartjs'
  const { reactiveProp } = mixins
  export default {
    extends: Line,
    mixins: [reactiveProp],
    props: {
      chartData: {
        type: Array,
        required: false
      },
      chartLabels: {
        type: Array,
        required: true
      },
      yLabel: {
        type: String,
        default: "",
      }
    },
    data () {
      return {
        options: {
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                  labelString: this.yLabel
              },
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true
              }
            }],
            xAxes: [ {
              scaleLabel: {
                display: true,
                  labelString: "Collateral Ratio"
              },
              ticks: {
                max: 10,
                min: 0,
                userCallback: function(label, index, labels) {
                  return label.toFixed(2);
                },
              },
              gridLines: {
                display: true
              }
            }]
          },
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    mounted () {
      this.renderChart({
        labels: this.chartLabels,
        datasets: [
          {
            borderColor: '#249EBF',
            borderWidth: 0,
            pointBackgroundColor: 'white',
            pointBorderColor: '#249EBF',
            backgroundColor: 'transparent',
            data: this.chartData
          }
        ]
      }, this.options)
    }
  }
</script>

<style>
</style>
