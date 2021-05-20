<template>
  <div class="card m-5">
    <header class="card-header">
      <p class="card-header-title">
        {{ topic.name }}
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <ul>
          <li>
            Begriffe
            <ul v-if="topic.words">
              <li
                v-for="word in sortedTopicWords"
                :key="word.id"
              >
                {{ word.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Topic',
  props: {
    topic: {
      type: Object,
      default: function () {
        const { Topic } = this.$FeathersVuex.api
        return new Topic()
      }
    }
  },
  computed: {
    sortedTopicWords () {
      const topicWords = this.topic.words
      return topicWords.sort((x, y) => {
        return x.name.toLowerCase() > y.name.toLowerCase() ? 1 : -1
      })
    }
  }

}
</script>

<style>

</style>
