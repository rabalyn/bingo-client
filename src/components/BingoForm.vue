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
        <b-field label="Worte">
          <FeathersVuexFind
            service="words"
            :params="{
              query: {
                $limit: 5
              }
            }"
            :fetch-params="{
              query: {
                $limit: 5,
                $sort: {
                  name: 1
                },
                'words.name': {
                  $ilike: `%${newWord.name}%`
                }
              }
            }"
            :watch="['fetchParams', 'params']"
          >
            <div>
              <b-dropdown v-model="newWord.name">
                <template #trigger>
                  <b-input
                    v-model="newWord.name"
                    icon-right="close-circle"
                    icon-right-clickable
                    @icon-right-click="resetNewWord"
                    @keypress.native.enter="addWord"
                  />
                </template>
                <b-dropdown-item
                  v-for="word in filteredWords"
                  :key="word.id"
                  :value="word.name"
                  @click="addWord"
                >
                  {{ word.name }}
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </FeathersVuexFind>
        </b-field>
        <ol>
          <li
            v-for="(word, idx) in newBingo.words"
            :key="word.name"
          >
            {{ word.name }}
            <b-button
              size="is-small"
              type="is-danger"
              icon-right="delete"
              @click="newBingo.words.splice(idx, 1)"
            />
          </li>
        </ol>

        <b-field label="Topics">
          <FeathersVuexFind
            service="topics"
            :params="{
              query: {
                $limit: 5
              }
            }"
            :fetch-params="{
              query: {
                $limit: 5,
                $sort: {
                  name: 1
                },
                'topics.name': {
                  $ilike: `%${newTopic.name}%`
                }
              }
            }"
            :watch="['fetchParams', 'params']"
          >
            <div>
              <b-dropdown v-model="newTopic.name">
                <template #trigger>
                  <b-input
                    v-model="newTopic.name"
                    icon-right="close-circle"
                    icon-right-clickable
                    @icon-right-click="resetNewTopic"
                    @keypress.native.enter="addTopic"
                  >
                    />
                  </b-input>
                </template>
                <b-dropdown-item
                  v-for="topic in filteredTopics"
                  :key="topic.id"
                  :value="topic.name"
                  @click="addTopic"
                >
                  {{ topic.name }}
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </FeathersVuexFind>
        </b-field>
        <ol>
          <li
            v-for="(topic, idx) in newBingo.topics"
            :key="topic.name"
          >
            {{ topic.name }}
            <b-button
              size="is-small"
              type="is-danger"
              icon-right="delete"
              @click="newBingo.topics.splice(idx, 1)"
            />
          </li>
        </ol>
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
export default {
  name: 'BingoForm',
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
      newBingo: new this.$FeathersVuex.api.Bingos(),
      newWord: new this.$FeathersVuex.api.Words(),
      newTopic: new this.$FeathersVuex.api.Topics()
    }
  },
  computed: {
    filteredWords () {
      const { Words } = this.$FeathersVuex.api
      const storeWords = Words.findInStore({ query: {} })
      return storeWords.data.filter((x) => {
        if (!this.newWord.name) return true

        if (!(x && x.name && this.newWord.name)) {
          return false
        }
        return x.name.toLowerCase().includes(this.newWord.name.toLowerCase())
      }).slice(0, 5)
    },
    filteredTopics () {
      const { Topics } = this.$FeathersVuex.api
      const storeTopics = Topics.findInStore({ query: {} })
      return storeTopics.data.filter((x) => {
        if (!this.newTopic.name) return true

        if (!(x && x.name && this.newTopic.name)) {
          return false
        }
        return x.name.toLowerCase().includes(this.newTopic.name.toLowerCase())
      })
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
    resetNewWord () {
      this.newWord = new this.$FeathersVuex.api.Words()
    },
    resetNewTopic () {
      this.newTopic = new this.$FeathersVuex.api.Topics()
    },
    addWord () {
      if (this.newBingo.words.map(x => x.name).includes(this.newWord.name)) {
        return
      }

      if (this.filteredWords.length === 1) {
        this.newBingo.words.push(this.filteredWords[0])
        this.resetNewWord()
        return
      }

      const newWord = new this.$FeathersVuex.api.Words({
        id: this.newWord.id,
        name: this.newWord.name
      })
      this.newBingo.words.push(newWord)
      this.resetNewWord()
    },
    addTopic () {
      if (this.newBingo.topics.map(x => x.name).includes(this.newTopic.name)) {
        return
      }

      if (this.filteredTopics.length === 1) {
        this.newBingo.topics.push(this.filteredTopics[0])
        this.resetNewTopic()
        return
      }

      const newTopic = new this.$FeathersVuex.api.Topics({
        id: this.newTopic.id,
        name: this.newTopic.name
      })
      this.newBingo.topics.push(newTopic)
      this.resetNewTopic()
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
