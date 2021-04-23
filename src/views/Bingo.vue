<template>
  <FeathersVuexGet
    :id="id"
    v-slot="{ item: bingo }"
    service="bingos"
  >
    <div
      v-if="bingo"
      class="content"
    >
      <h1>{{ bingo.name }}</h1>
      <h4>{{ bingo.description }}</h4>
      <div class="columns">
        <div class="column">
          <b-taglist v-if="bingo.topics[0]">
            <b-tag
              v-for="topic in bingo.topics"
              :key="topic.id"
              type="is-info"
            >
              {{ topic.name }}
            </b-tag>
          </b-taglist>
        </div>
        <div class="column">
          <b-button
            class="is-danger is-light mx-1"
            @click="resetClicks()"
          >
            Zurücksetzen
          </b-button>
          <b-button
            class="is-info is-light mx-1"
            @click="reshuffleWords(bingo)"
          >
            Neu würfeln
          </b-button>
          <b-button @click="$router.push('/')">
            Zurück
          </b-button>
        </div>
      </div>

      <h1 v-if="hasWon">
        GEWONNEN!
      </h1>
      <div
        v-if="hasWords && myWords.length > 24"
        id="game"
        class="columns is-flex is-flex-direction-row is-flex-wrap-wrap"
      >
        <div
          v-for="(word, idx) in myWords || getMyWords(bingo)"
          :key="word.id"
          class="column is-one-fifth has-text-weight-bold is-size-4 is-flex is-justify-content-center is-align-items-center field"
          :class="{'highlight': word.clicked}"
          @click="toggleClicked(idx)"
        >
          {{ idx }}: {{ word.name }}
        </div>
      </div>
      <div v-else>
        Nicht genügend Wörter für ein Spiel... Wir brauchen 25 Begriffe!
      </div>
    </div>
  </FeathersVuexGet>
</template>

<script>
export default {
  name: 'Bingo',
  data: function () {
    return {
      myWords: []
    }
  },
  computed: {
    id () {
      return this.$route.params.id
    },
    hasWords () {
      return this.myWords && this.myWords.length > 0
    },
    hasWon () {
      if (!this.myWords || this.myWords.length < 25) return false

      const offset = 5
      // horizontal
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (!this.myWords[i * offset + j].clicked) {
            break
          }

          if (j === 4) {
            return true
          }
        }
      }

      // vertical
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (!this.myWords[j * offset + i].clicked) {
            break
          }

          if (j === 4) {
            return true
          }
        }
      }

      // top-left to bottom-right
      for (let i = 0; i < 5; i++) {
        if (!this.myWords[i * (offset + 1)].clicked) {
          break
        }

        if (i === 4) {
          return true
        }
      }

      // top-right to bottom-left
      for (let i = 1; i < 6; i++) {
        if (!this.myWords[i * (offset - 1)].clicked) {
          break
        }

        if (i === 5) {
          return true
        }
      }
      return false
    }
  },
  created () {
    this.myWords = JSON.parse(window.localStorage.getItem(this.id)) || []
  },
  methods: {
    shuffle (a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    getMyWords (bingo) {
      if (!window.localStorage.getItem(this.id)) {
        const words = this.shuffle(bingo.words).slice(0, 25)
        words[12] = { name: 'JOKER', clicked: true }
        this.myWords = words
        window.localStorage.setItem(this.id, JSON.stringify(words))
      }
      const myWords = JSON.parse(window.localStorage.getItem(this.id))
      return myWords
    },
    reshuffleWords (bingo) {
      window.localStorage.removeItem(this.id)
      this.getMyWords(bingo)
    },
    toggleClicked (idx) {
      // ignore Joker field
      if (idx === 12) return

      const myWords = JSON.parse(window.localStorage.getItem(this.id))
      myWords[idx].clicked = myWords[idx].clicked ? !myWords[idx].clicked : true
      this.myWords = myWords
      window.localStorage.setItem(this.id, JSON.stringify(myWords))
    },
    resetClicks () {
      console.log(this.myWords)
      this.myWords.forEach((x, idx) => {
        if (idx === 12) return
        x.clicked = false
      })
      window.localStorage.setItem(this.id, JSON.stringify(this.myWords))
    }
  }
}
</script>

<style scoped>
.field {
  min-height: 14vh;
  max-height: 14vh;
  border: solid 2px cyan;
  cursor: pointer;
  user-select: none;
}

.highlight {
  background-color: yellow;
}
</style>
