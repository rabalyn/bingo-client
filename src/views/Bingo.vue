<template>
  <div class="container columns">
    <div class="column is-10">
      <bingo-game />
    </div>
    <div class="column is-2 is-size-7">
      <bingo-game-log />
    </div>
  </div>
</template>

<script>
import BingoGame from '../components/BingoGame.vue'
import BingoGameLog from '../components/BingoGameLog.vue'

export default {
  name: 'Bingo',
  components: {
    BingoGame,
    BingoGameLog
  }
}
</script>

<style>

</style>
