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
      <h1 class="mx-5">
        {{ bingo.name }}
      </h1>
      <h4 class="mx-5">
        {{ bingo.description }}
      </h4>

      <b-navbar
        class="mx-5"
        style="z-index: 1;"
      >
        <template #start>
          <b-taglist>
            <b-tag
              v-for="topic in bingo.topics"
              :key="topic.id"
              type="is-info"
            >
              {{ topic.name }}
            </b-tag>
          </b-taglist>
        </template>
        <template #end>
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
          <b-button
            class="mx-1"
            @click="$router.push('/')"
          >
            Zurück
          </b-button>

          <b-field>
            <b-switch
              v-model="highlightRainbow"
              class="mx-1 mt-1"
            >
              <b-icon icon="palette" />
            </b-switch>
          </b-field>
        </template>
      </b-navbar>

      <h1 v-if="hasWon">
        GEWONNEN!
      </h1>
      <div
        v-if="hasWords && myWords.length > 24"
        id="game"
        class="columns is-flex is-flex-direction-row is-flex-wrap-wrap my-1"
      >
        <div
          v-for="(word, idx) in myWords || getMyWords(bingo)"
          :key="word.id"
          class="column is-one-fifth has-text-weight-bold is-size-5 is-flex is-justify-content-center is-align-items-center game-field"
          :class="{
            'highlight': word.clicked && highlightRainbow,
            'highlight-static': word.clicked && !highlightRainbow
          }"
          @click="toggleClicked(idx)"
        >
          <span :class="{'highlight-text': word.clicked && highlightRainbow}">
            {{ word.name }}
          </span>
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
      highlightRainbow: false,
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

    if (!this.myWords[0]) {
      const { Bingos } = this.$FeathersVuex.api
      Bingos.get(this.id, { query: {} })
        .then((bingo) => {
          this.reshuffleWords(bingo)
        })
    }
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
#game {
  transform: scale(0.95);
}

.game-field {
  min-height: 14vh;
  max-height: 14vh;
  border: solid 0.05em black;
  cursor: pointer;
  user-select: none;
  text-align: center;
}

.highlight-static {
  background-color: darkslategray;
  color: whitesmoke;
}

.highlight-text {
  background: linear-gradient(150deg, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3, #ff2400, #e81d1d, #e8b71d, #e3e81d);

  background-size: 1200% 1200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  -webkit-text-stroke-width: 0.01em;
  -webkit-text-stroke-color: black;

  -webkit-animation: rainbowText 6s ease infinite;
  -z-animation: rainbowText 6s ease infinite;
  -o-animation: rainbowText 6s ease infinite;
  animation: rainbowText 6s ease infinite;
}

.highlight {
  margin-bottom: 0;
  background: linear-gradient(
    120deg,
    #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3
  );
  background-size: 1000% 1000%;

  -webkit-animation: rainbow 13s linear infinite;
  -z-animation: rainbow 13s linear infinite;
  -o-animation: rainbow 13s linear infinite;
  animation: rainbow 13s linear infinite;
}

@-webkit-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-moz-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-o-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}

@keyframes rainbowText {
    0%{background-position:0% 0%}
    50%{background-position:88% 88%}
    100%{background-position:0% 0%}
}
</style>
