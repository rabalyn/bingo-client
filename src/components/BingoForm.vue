<template>
  <div class="card mx-3 my-3 column">
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
        <h3>Bingowörter</h3>
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
            :key="word.id"
            type="is-info is-light"
            closable
            @close="newBingo.words.splice(idx, 1)"
          >
            {{ word.name }}
          </b-tag>
        </b-taglist>

        <h3>Kategorien</h3>
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
            :key="topic.id"
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
      newBingo: new this.$FeathersVuex.api.Bingos()
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
    addWord (word) {
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
        this.saveBingo()
      }
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

      if (this.bingoNameType === 'is-success' && this.bingoDescriptionType === 'is-success') {
        this.saveBingo()
      }
    },
    resetNewBingo () {
      this.newBingo = new this.$FeathersVuex.api.Bingos()
    },
    async saveBingo () {
      if (!(this.bingoNameType === 'is-success' && this.bingoDescriptionType === 'is-success')) return

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
        is_private: this.newBingo.is_private,
        owner: this.user,
        name: this.newBingo.name,
        description: this.newBingo.description,
        topics: this.newBingo.topics,
        words: this.newBingo.words
      })
      delete bingo.owner.bingos
      delete bingo.owner.rights

      try {
        await bingo.save()
        this.showSaveSuccessfulToast()
      } catch (error) {
        this.showSaveFailedToast(error)
      }
    },
    async saveAndResetBingo () {
      await this.saveBingo()
      this.resetNewBingo()
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
