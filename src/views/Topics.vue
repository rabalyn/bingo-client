<template>
  <div class="columns is-multiline">
    <topic
      v-for="topic in topics"
      :key="topic.id"
      class="column is-4"
      :topic="topic"
    />
  </div>
</template>

<script>
import Topic from '../components/Topic.vue'
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: 'Topics',
  components: {
    Topic
  },
  mixins: [makeFindMixin({
    service: 'topics',
    watch: true,
    qid: 'topicsList'
  })],
  data: function () {
    return {
      order: -1,
      current: 1,
      limit: 5,
      skip: 0
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    },
    qid () {
      return 'topicsList'
    },
    topicsParams () {
      return {
        query: {
          $limit: this.limit,
          $skip: this.skip,
          $sort: {
            updatedAt: this.order
          }
        },
        paginate: false
      }
    },
    total () {
      if (!this?.topicsPaginationData[this.qid]?.mostRecent?.total) return -1
      return this.topicsPaginationData[this.qid].mostRecent.total
    }
  },
  watch: {
    current () {
      this.skip = this.limit * (this.current - 1)
    },
    topics () {
      this.findTopics()
    }
  },
  mounted () {
    window.onscroll = () => {
      const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight > document.documentElement.offsetHeight

      if (bottomOfWindow) {
        this.limit = this.limit + 5
      }
    }
  },
  methods: {
    refresh () {
      this.findTopics()
    }
  }
}
</script>

<style>
</style>
