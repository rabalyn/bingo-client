<template>
  <div class="card m-5">
    <header class="card-header">
      <p class="card-header-title">
        {{ word.name }}
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <ul v-if="word.topics">
          <li
            v-for="word in sortedWordTopics"
            :key="word.id"
          >
            {{ word.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Word',
  props: {
    word: {
      type: Object,
      default: function () {
        const { Words } = this.$FeathersVuex.api
        return new Words()
      }
    }
  },
  computed: {
    sortedWordTopics () {
      const wordTopics = this.word.topics
      return wordTopics.sort((x, y) => {
        return x.name.toLowerCase() > y.name.toLowerCase() ? 1 : -1
      })
    }
  }

}
</script>

<style>

</style>
