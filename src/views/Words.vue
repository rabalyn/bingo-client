<template>
  <div class="columns is-multiline">
    <word
      v-for="word in words"
      :key="word.id"
      class="column is-4"
      :word="word"
    />
  </div>
</template>

<script>
import Word from '../components/Word.vue'
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: 'Words',
  components: {
    Word
  },
  mixins: [makeFindMixin({
    service: 'words',
    watch: true,
    qid: 'wordsList'
  })],
  data: function () {
    return {
      order: 1,
      current: 1,
      limit: 15,
      skip: 0
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    },
    qid () {
      return 'wordsList'
    },
    wordsParams () {
      return {
        query: {
          $limit: this.limit,
          $skip: this.skip,
          $sort: {
            name: this.order
          }
        },
        paginate: false
      }
    },
    total () {
      if (!this?.wordsPaginationData[this.qid]?.mostRecent?.total) return -1
      return this.wordsPaginationData[this.qid].mostRecent.total
    }
  },
  watch: {
    current () {
      this.skip = this.limit * (this.current - 1)
    },
    topics () {
      this.findWords()
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
      this.findWords()
    }
  }
}
</script>

<style>
</style>
