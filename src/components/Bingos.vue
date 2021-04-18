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
                <b-input
                  v-model="newBingo.word"
                  @keypress.native.enter="addWord"
                />
              </b-field>
              <ol>
                <li
                  v-for="word in words"
                  :key="word.name"
                >
                  {{ word.name }}
                </li>
              </ol>

              <b-field label="Topics">
                <b-input
                  v-model="newBingo.topic"
                  @keypress.native.enter="addTopic"
                />
              </b-field>
              <ol>
                <li
                  v-for="(topic, idx) in topics"
                  :key="topic.name"
                >
                  {{ topic.name }}
                  <b-button
                    size="is-small"
                    type="is-danger"
                    icon-right="delete"
                    @click="topics.splice(idx, 1)"
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
          <b-button
            class="mx-1 my-2"
            @click="editBingo(bingo)"
          >
            Editiere Bingo
          </b-button>
        </div>
      </div>
    </div>
  </FeathersVuexFind>
</template>

<script>
export default {
  name: 'Bingos',
  data: function () {
    return {
      newBingo: {
        id: null,
        name: '',
        description: '',
        word: null,
        topic: null
      },
      words: [],
      topics: []
    }
  },
  methods: {
    addWord () {
      if (this.words.map(x => x.name).includes(this.newBingo.word)) {
        return
      }
      this.words.push({
        name: this.newBingo.word
      })
      this.newBingo.word = null
    },
    addTopic () {
      if (this.topics.map(x => x.name).includes(this.newBingo.topic)) {
        return
      }
      this.topics.push({
        name: this.newBingo.topic
      })
      this.newBingo.topic = null
    },
    editBingo (bingo) {
      this.newBingo.id = bingo.id
      this.newBingo.name = bingo.name
      this.newBingo.description = bingo.description
      this.words = bingo.words
      this.topics = bingo.topics
    },
    async saveBingo () {
      const { Bingos, Words, Topics } = this.$FeathersVuex.api
      const existingWords = await Words.find({ query: { $limit: 5000 } })
      const existingTopics = await Topics.find({ query: { $limit: 5000 } })

      for (let i = 0; i < this.words.length; i++) {
        for (let j = 0; j < existingWords.total; j++) {
          const existingWord = existingWords.data[j]
          if (this.words[i].name === existingWord.name) {
            this.words[i].id = existingWord.id
          }
        }
      }

      for (let i = 0; i < this.topics.length; i++) {
        for (let j = 0; j < existingTopics.total; j++) {
          const existingTopic = existingTopics.data[j]
          if (this.topics[i].name === existingTopic.name) {
            this.topics[i].id = existingTopic.id
          }
        }
      }

      const bingo = new Bingos({
        id: this.newBingo.id,
        name: this.newBingo.name,
        description: this.newBingo.description,
        topics: this.topics,
        words: this.words
      })

      await bingo.save()
    }
  }
}
</script>

<style>
</style>
