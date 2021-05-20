<template>
  <div class="card mx-3 my-3 column">
    <b-loading :active="isLoading" />

    <div class="card-content">
      <p>
        <b-field>
          <b-switch
            v-model="newBingo.is_private"
            :disabled="!user"
            :value="newBingo.is_private"
            type="is-info"
            @input="saveBingo"
          >
            {{ newBingo.is_private ? 'Privat' : 'Öffentlich' }}
          </b-switch>
        </b-field>

        <b-upload
          v-model="bingoImport"
          class="file-label"
          accept="application/json"
          @input="importBingo"
        >
          <span class="file-cta">
            <b-icon
              class="file-icon"
              icon="upload"
            />
            <span class="file-label">Bingo importieren</span>
          </span>
          <span
            v-if="bingoImport"
            class="file-name"
          >
            {{ bingoImport.name }}
          </span>
        </b-upload>

        <b-field
          label="Bingotitel*"
          :type="bingoNameType"
        >
          <b-input
            v-model="newBingo.name"
            type="text"
            required
            minlength="2"
            maxlength="255"
          />
        </b-field>
      </p>
      <p class="subtitle">
        <b-field
          label="Beschreibung*"
          :type="bingoDescriptionType"
        >
          <b-input
            v-model="newBingo.description"
            type="text"
            required
            minlength="5"
            maxlength="1023"
          />
        </b-field>
      </p>

      <div class="content">
        <h3>Bingowörter ({{ newBingo.words.length }})</h3>
        <autocomplete
          column="name"
          placeholder="neues Bingowort..."
          :query-limit="5"
          service="words"
          :select-action="addWord"
        />

        <b-taglist class="mt-2">
          <b-tag
            v-for="(word, idx) in newBingo.words"
            :key="`${word.id}_${new Date().toISOString()}_${idx}`"
            type="is-info is-light"
            closable
            @close="removeWord(idx)"
          >
            {{ word.name }}
          </b-tag>
        </b-taglist>

        <h3>Kategorien</h3>
        <b-button
          class="my-2"
          :disabled="newBingo.topics.length < 1"
          @click="importTopicRelatedWords"
        >
          Lade Topic Wörter...
        </b-button>
        <div
          v-if="topicWords.length > 0"
          class="block"
        >
          <b-field
            v-for="(topicWord, idx) in topicWords"
            :key="`${topicWord.id}_${new Date().toISOString()}_${idx}`"
          >
            <b-checkbox
              v-model="wordsToImportFromTopics"
              :native-value="topicWord"
            >
              {{ topicWord.name }}
            </b-checkbox>
          </b-field>
          <b-button @click="addWordsToImportFromTopics">
            Füge ausgewählte Wörter hinzu
          </b-button>
        </div>

        <autocomplete
          column="name"
          placeholder="neue Kategorie..."
          :query-limit="5"
          service="topics"
          :select-action="addTopic"
        />

        <b-taglist class="mt-2">
          <b-tag
            v-for="(topic, idx) in newBingo.topics"
            :key="`${topic.id}_${new Date().toISOString()}_${idx}`"
            type="is-info is-light"
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
        :disabled="!(bingoNameType === 'is-success' && bingoDescriptionType === 'is-success')"
        @click="saveAndResetBingo"
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
          is_private: false,
          owner: null,
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
      isLoading: false,
      isBingoSaving: false,
      newBingo: new this.$FeathersVuex.api.Bingos(),
      bingoImport: null,
      topicWords: [],
      wordsToImportFromTopics: []
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    },
    bingoNameType () {
      if (this.newBingo.name && this.newBingo.name.length >= 2 && this.newBingo.name.length <= 255) return 'is-success'
      else if (this.newBingo.name) return 'is-danger'

      return ''
    },
    bingoDescriptionType () {
      if (this.newBingo.description && this.newBingo.description.length >= 5 && this.newBingo.description.length <= 1023) return 'is-success'
      else if (this.newBingo.description) return 'is-danger'

      return ''
    },
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
        this.topicWords = []
        this.wordsToImportFromTopics = []

        this.newBingo.id = this.editBingo.id
        this.newBingo.is_private = this.editBingo.is_private
        this.newBingo.owner = this.editBingo.owner
        this.newBingo.name = this.editBingo.name
        this.newBingo.description = this.editBingo.description
        this.newBingo.words = this.editBingo.words
        this.newBingo.topics = this.editBingo.topics
      }
    }
  },
  methods: {
    async addWord (word, isBulkImport = false) {
      if (!word) return
      if (word.name && word.name.length < 2) return

      if (this.newBingo.words.map(x => x.name).includes(word.name)) {
        return
      }

      const newWord = new this.$FeathersVuex.api.Words({
        id: word.id,
        name: word.name
      })
      this.newBingo.words.push(newWord)

      if (this.bingoNameType === 'is-success' && this.bingoDescriptionType === 'is-success') {
        if (isBulkImport === false) await this.saveBingo()
      }
    },
    async removeWord (idx) {
      this.newBingo.words.splice(idx, 1)
      if (this.bingoNameType === 'is-success' && this.bingoDescriptionType === 'is-success') {
        await this.saveBingo()
      }
    },
    async addTopic (topic) {
      if (!topic) return
      if (this.newBingo.topics.map(x => x.name).includes(topic.name)) {
        return
      }

      const newTopic = new this.$FeathersVuex.api.Topics({
        id: topic.id,
        name: topic.name
      })
      try {
        this.isLoading = true
        await newTopic.save()
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoading = false
      }

      this.newBingo.topics.push(newTopic)

      if (this.bingoNameType === 'is-success' && this.bingoDescriptionType === 'is-success') {
        this.saveBingo()
      }
    },
    showImportBingoError (error) {
      this.bingoImport = null
      this.$buefy.toast.open({
        message: `Bingo konnte nicht geladen werden: ${error}`,
        type: 'is-danger'
      })
    },
    importBingo () {
      this.isLoading = true
      const reader = new FileReader()
      reader.addEventListener('load', async (event) => {
        try {
          const loadedBingo = JSON.parse(event.target.result)

          if (!loadedBingo.name) return this.showImportBingoError('Falsches Dateiformat.')
          if (typeof loadedBingo.name !== 'string') return this.showImportBingoError('Falsches Dateiformat.')
          if (!loadedBingo.description) return this.showImportBingoError('Falsches Dateiformat.')
          if (typeof loadedBingo.description !== 'string') return this.showImportBingoError('Falsches Dateiformat.')
          if (!loadedBingo.words) return this.showImportBingoError('Falsches Dateiformat.')
          if (typeof loadedBingo.words !== 'object') return this.showImportBingoError('Falsches Dateiformat.')
          if (!loadedBingo.topics) return this.showImportBingoError('Falsches Dateiformat.')
          if (typeof loadedBingo.topics !== 'object') return this.showImportBingoError('Falsches Dateiformat.')

          const loadedBingoKeys = Object.keys(loadedBingo)
          const validBingoKeys = ['name', 'description', 'words', 'topics']
          for (let i = 0; i < loadedBingoKeys.length; i++) {
            if (!validBingoKeys.includes(loadedBingoKeys[i])) {
              return this.showImportBingoError('Falsches Dateiformat.')
            }
          }

          for (let i = 0; i < loadedBingo.words.length; i++) {
            const word = loadedBingo.words[i]
            if (!word.name) return this.showImportBingoError('Falsches Dateiformat.')
            const wordKeys = Object.keys(word)
            const validWordKeys = ['name']
            for (let j = 0; j < wordKeys.length; j++) {
              if (!validWordKeys.includes(wordKeys[j])) {
                return this.showImportBingoError('Falsches Dateiformat.')
              }
            }
          }

          for (let i = 0; i < loadedBingo.topics.length; i++) {
            const topic = loadedBingo.topics[i]
            if (!topic.name) return this.showImportBingoError('Falsches Dateiformat.')
            const topicKeys = Object.keys(topic)
            const validTopicKeys = ['name']
            for (let j = 0; j < topicKeys.length; j++) {
              if (!validTopicKeys.includes(topicKeys[j])) {
                return this.showImportBingoError('Falsches Dateiformat.')
              }
            }
          }

          const { Words, Topics } = this.$FeathersVuex.api
          for (let i = 0; i < loadedBingo.words.length; i++) {
            try {
              const searchedWord = await Words.find({ query: { name: loadedBingo.words[i].name } })
              loadedBingo.words[i].id = searchedWord.data[0].id
            } catch (error) {
              console.info('words - create ', loadedBingo.words[i].name)
              const newWord = await new Words({
                name: loadedBingo.words[i].name
              }).save()
              loadedBingo.words[i].id = newWord.id
            }
          }

          for (let i = 0; i < loadedBingo.topics.length; i++) {
            try {
              const searchedTopic = loadedBingo.topics[i].id = await Topics.find({ query: { name: loadedBingo.topics[i].name } })
              loadedBingo.topics[i].id = searchedTopic.data[0].id
            } catch (error) {
              console.error('topics', error)
              const newTopic = await new Topics({
                name: loadedBingo.topics[i].name
              }).save()
              loadedBingo.topics[i].id = newTopic.id
            }
          }

          this.topicWords = []
          this.wordsToImportFromTopics = []

          this.newBingo.is_private = false
          this.newBingo.owner = null
          this.newBingo.name = `${loadedBingo.name} - import`
          this.newBingo.description = loadedBingo.description
          this.newBingo.words = loadedBingo.words
          this.newBingo.topics = loadedBingo.topics
        } catch (error) {
          console.error('could not parse')
        }

        this.bingoImport = null
        this.isLoading = false
      })
      reader.readAsText(this.bingoImport)
    },
    async importTopicRelatedWords () {
      this.isLoading = true

      for (let i = 0; i < this.newBingo.topics.length; i++) {
        if (!this.newBingo.topics[i].words) {
          const { Topics } = this.$FeathersVuex.api
          let loadedTopic
          try {
            loadedTopic = await Topics.get(this.newBingo.topics[i].id)
          } catch (error) {
            loadedTopic = await new Topics({
              name: this.newBingo.topics[i].name
            }).save()
          }
          loadedTopic = await Topics.get(loadedTopic.id)
          if (loadedTopic.words) {
            this.newBingo.topics[i] = loadedTopic
          }
        }

        const topicWords = this.newBingo.topics[i].words
        const tmpWords = new Set()
        for (let j = 0; j < topicWords.length; j++) {
          tmpWords.add(topicWords[j])
        }

        this.topicWords = [...tmpWords]
        this.wordsToImportFromTopics = this.topicWords
      }

      await this.saveBingo({ force: true })
      this.isLoading = false
    },
    async addWordsToImportFromTopics () {
      this.isLoading = true
      for (let i = 0; i < this.wordsToImportFromTopics.length; i++) {
        await this.addWord(this.wordsToImportFromTopics[i], true)
      }

      this.topicWords = []
      this.wordsToImportFromTopics = []
      this.isLoading = false
      await this.saveBingo({ force: true })
    },
    resetNewBingo () {
      this.newBingo = new this.$FeathersVuex.api.Bingos()
      this.topicWords = []
      this.wordsToImportFromTopics = []
    },
    async saveBingo (opts = { force: false }) {
      if (!(this.bingoNameType === 'is-success' && this.bingoDescriptionType === 'is-success')) return

      if (this.isBingoSaving === true && opts.force === false) return

      this.isBingoSaving = true
      const { Bingos, Words, Topics } = this.$FeathersVuex.api
      const existingWords = await Words.find({ query: { $limit: 5000 } })
      const existingTopics = await Topics.find({ query: { $limit: 5000 } })

      for (let i = 0; i < this.newBingo.words.length; i++) {
        if (this.newBingo.words[i].__id) delete this.newBingo.words[i].__id
        if (this.newBingo.words[i].__isTemp) delete this.newBingo.words[i].__isTemp
        if (this.newBingo.words[i].topics) delete this.newBingo.words[i].topics

        for (let j = 0; j < existingWords.total; j++) {
          const existingWord = existingWords.data[j]
          if (this.newBingo.words[i].name === existingWord.name) {
            this.newBingo.words[i].id = existingWord.id
          }
        }
      }

      for (let i = 0; i < this.newBingo.topics.length; i++) {
        if (this.newBingo.topics[i].__id) delete this.newBingo.topics[i].__id
        if (this.newBingo.topics[i].__isTemp) delete this.newBingo.topics[i].__isTemp
        if (this.newBingo.topics[i].words) delete this.newBingo.topics[i].words

        for (let j = 0; j < existingTopics.total; j++) {
          const existingTopic = existingTopics.data[j]
          if (this.newBingo.topics[i].name === existingTopic.name) {
            this.newBingo.topics[i].id = existingTopic.id
          }
        }
      }

      for (let i = 0; i < this.newBingo.topics.length; i++) {
        try {
          await new Topics({
            id: this.newBingo.topics[i].id,
            name: this.newBingo.topics[i].name,
            words: this.newBingo.words
          }).save()
          this.newBingo.topics = this.newBingo.topics.map(x => ({ id: x.id, name: x.name }))
        } catch (error) {
          console.error(error)
        }
      }

      const bingo = new Bingos({
        id: this.newBingo.id,
        is_private: this.newBingo.is_private,
        owner: this.user,
        name: this.newBingo.name,
        description: this.newBingo.description,
        topics: this.newBingo.topics,
        words: this.newBingo.words
      })
      if (bingo?.owner?.bingos) delete bingo.owner.bingos
      if (bingo?.owner?.rights) delete bingo.owner.rights

      try {
        const savedBingo = await bingo.save()
        this.newBingo.id = savedBingo.id
        this.showSaveSuccessfulToast()
      } catch (error) {
        this.showSaveFailedToast(error)
        throw new Error(error)
      } finally {
        this.isBingoSaving = false
      }
    },
    async saveAndResetBingo () {
      try {
        await this.saveBingo()
        this.resetNewBingo()
      } catch (error) {
        console.error(error)
      }
    },
    showSaveSuccessfulToast () {
      this.$buefy.toast.open({
        message: 'Bingo gespeichert',
        type: 'is-success'
      })
    },
    showSaveFailedToast (error) {
      console.error(error)
      this.$buefy.toast.open({
        message: 'Fehler, Bingo wurde nicht gespeichert.',
        type: 'is-danger'
      })
    }
  }

}
</script>

<style>

</style>
