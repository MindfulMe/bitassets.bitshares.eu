<template>
  <div class="text-xs-center">
    <v-progress-circular
      :size="size"
      :width="width"
      color="green"
      indeterminate
    ></v-progress-circular>
  </div>
</template>

<script>
  export default {
    name: 'LoadingIndicator',
    props: {
      size: {
        type: [Number, String],
        default: 70,
        coerce: str => parseFloat(str)
      },
      width: {
        type: [Number, String],
        default: 7,
        coerce: str => parseFloat(str)
      }
    },
  }
</script>

<style>
</style>
