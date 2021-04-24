<template>
  <FeathersVuexFind
    v-slot="{ items: bingos }"
    service="bingos"
    :params="{ query: { $limit: 15 } }"
    watch="params"
  >
    <div class="container">
      <div class="columns">
        <!-- dummy card -->
        <bingo-form :edit-bingo="editBingo" />
      </div>

      <div
        v-for="bingo in bingos"
        :key="bingo.id"
        class="card mx-3 my-3 column"
      >
        <header class="card-header">
          <p class="card-header-title">
            {{ bingo.name }}
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            Beschreibung: {{ bingo.description }}
            <br>

            Worte: <br>
            <ul>
              <li
                v-for="word in bingo.words"
                :key="word.id"
              >
                {{ word.name }}
              </li>
            </ul>

            Topics: <br>
            <ul>
              <li
                v-for="topic in bingo.topics"
                :key="topic.id"
              >
                {{ topic.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="card-footer">
          <b-button
            class="mx-1 my-2"
            @click="$router.push(`bingos/${bingo.id}`)"
          >
            Lade Bingodetails
          </b-button>
          <scroll-to-top>
            <b-button
              class="mx-1 my-2"
              @click="loadBingoEdit(bingo)"
            >
              Editiere Bingo
            </b-button>
          </scroll-to-top>
          <b-button
            class="mx-1 my-2"
            @click="removeBingo(bingo)"
          >
            Lösche Bingo
          </b-button>
        </div>
      </div>
    </div>
  </FeathersVuexFind>
</template>

<script>
import BingoForm from './BingoForm.vue'
import ScrollToTop from './ScrollToTop.vue'

export default {
  name: 'Bingos',
  components: {
    BingoForm,
    ScrollToTop
  },
  data: function () {
    return {
      editBingo: {
        id: null,
        name: '',
        description: '',
        words: [],
        topics: []
      }
    }
  },
  methods: {
    loadBingoEdit (bingo) {
      this.editBingo.id = bingo.id
      this.editBingo.name = bingo.name
      this.editBingo.description = bingo.description
      this.editBingo.words = bingo.words
      this.editBingo.topics = bingo.topics
    },
    removeBingo (bingo) {
      bingo.words = []
      bingo.topics = []
      this.editBingo.id = null
      this.editBingo.name = ''
      this.editBingo.description = ''
      this.editBingo.words = []
      this.editBingo.topics = []
      bingo.remove()
    }
  }
}
</script>

<style>
</style>
