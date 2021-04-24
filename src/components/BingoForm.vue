<template>
  <div class="card mx-3 my-3 column">
    <div class="card-content">
      <p class="title">
        <b-field label="Bingotitel">
          <b-input v-model="newBingo.name" />
        </b-field>
      </p>
      <p class="subtitle">
        <b-field label="Beschreibung">
          <b-input v-model="newBingo.description" />
        </b-field>
      </p>
      <div class="content">
        <autocomplete
          column="name"
          label="Wort"
          placeholder="neues Bingowort..."
          :query-limit="5"
          service="words"
          :select-action="addWord"
        />
        <h3>Bingowörter</h3>
        <b-taglist>
          <b-tag
            v-for="(word, idx) in newBingo.words"
            :key="word.id"
            type="is-info"
            closable
            @close="newBingo.words.splice(idx, 1)"
          >
            {{ word.name }}
          </b-tag>
        </b-taglist>

        <autocomplete
          column="name"
          label="Kategorie"
          placeholder="neue Kategorie..."
          :query-limit="5"
          service="topics"
          :select-action="addTopic"
        />
        <h3>Kategorien</h3>
        <b-taglist>
          <b-tag
            v-for="(topic, idx) in newBingo.topics"
            :key="topic.id"
            type="is-info"
            closable
            @close="newBingo.topics.splice(idx, 1)"
          >
            {{ topic.name }}
          </b-tag>
        </b-taglist>
      </div>
    </div>

    <div class="card-footer is-pulled-right">
      <b-button
        class="my-4 mx-5 is-success is-light"
        @click="saveBingo"
      >
        Speichern
      </b-button>
    </div>
  </div>
</template>

<script>
import Autocomplete from './Autocomplete.vue'

export default {
  name: 'BingoForm',
  components: {
    Autocomplete
  },
  props: {
    editBingo: {
      type: Object,
      default: function () {
        return {
          id: null,
          name: '',
          description: '',
          words: [],
          topics: []
        }
      }
    }
  },
  data: function () {
    return {
      newBingo: new this.$FeathersVuex.api.Bingos()
    }
  },
  computed: {
    filteredWords () {
      const { Words } = this.$FeathersVuex.api
      const storeWords = Words.findInStore({ query: {} })
      return storeWords.data.filter((x) => {
        return x.name.toLowerCase().includes(this.newWord.name.toLowerCase())
      }).slice(0, 5)
    },
    filteredTopics () {
      const { Topics } = this.$FeathersVuex.api
      const storeTopics = Topics.findInStore({ query: {} })
      return storeTopics.data.filter((x) => {
        return x.name.toLowerCase().includes(this.newTopic.name.toLowerCase())
      }).slice(0, 5)
    }
  },
  watch: {
    editBingo: {
      deep: true,
      handler () {
        this.newBingo.id = this.editBingo.id
        this.newBingo.name = this.editBingo.name
        this.newBingo.description = this.editBingo.description
        this.newBingo.words = this.editBingo.words
        this.newBingo.topics = this.editBingo.topics
      }
    }
  },
  methods: {
    addWord (word) {
      if (!word) return
      if (this.newBingo.words.map(x => x.name).includes(word.name)) {
        return
      }

      const newWord = new this.$FeathersVuex.api.Words({
        id: word.id,
        name: word.name
      })
      this.newBingo.words.push(newWord)
    },
    addTopic (topic) {
      if (!topic) return
      if (this.newBingo.topics.map(x => x.name).includes(topic.name)) {
        return
      }

      const newTopic = new this.$FeathersVuex.api.Topics({
        id: topic.id,
        name: topic.name
      })
      this.newBingo.topics.push(newTopic)
    },
    async saveBingo () {
      const { Bingos, Words, Topics } = this.$FeathersVuex.api
      const existingWords = await Words.find({ query: { $limit: 5000 } })
      const existingTopics = await Topics.find({ query: { $limit: 5000 } })

      for (let i = 0; i < this.newBingo.words.length; i++) {
        delete this.newBingo.words[i].__id
        delete this.newBingo.words[i].__isTemp
        for (let j = 0; j < existingWords.total; j++) {
          const existingWord = existingWords.data[j]
          if (this.newBingo.words[i].name === existingWord.name) {
            this.newBingo.words[i].id = existingWord.id
          }
        }
      }

      for (let i = 0; i < this.newBingo.topics.length; i++) {
        delete this.newBingo.topics[i].__id
        delete this.newBingo.topics[i].__isTemp
        for (let j = 0; j < existingTopics.total; j++) {
          const existingTopic = existingTopics.data[j]
          if (this.newBingo.topics[i].name === existingTopic.name) {
            this.newBingo.topics[i].id = existingTopic.id
          }
        }
      }

      const bingo = new Bingos({
        id: this.newBingo.id,
        name: this.newBingo.name,
        description: this.newBingo.description,
        topics: this.newBingo.topics,
        words: this.newBingo.words
      })

      await bingo.save()
    }
  }

}
</script>

<style>

</style>
