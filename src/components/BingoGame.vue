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
          class="column is-one-fifth has-text-weight-bold is-flex is-justify-content-center is-align-items-center game-field"
          :class="{
            'highlight': word.clicked && highlightRainbow,
            'highlight-static': word.clicked && !highlightRainbow
          }"
          @click="toggleClicked(idx)"
        >
          <span :class="{'highlight-text': word.clicked && highlightRainbow}">
            <b-tooltip
              v-if="word.name.includes('https://') || word.name.includes('http://')"
              position="is-bottom"
              multilined
              :label="word.altText"
            >
              <img
                :src="word.name"
                :alt="word.altText"
                style="height: 12vh;"
              >
            </b-tooltip>
            <span v-else>
              {{ word.name }}
            </span>
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
import { hasWon } from '../lib/bingoGameHelper'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'BingoGame',
  data: function () {
    return {
      highlightRainbow: false,
      myWords: [],
      gameUserName: ''
    }
  },
  computed: {
    user () {
      return this.$store.state?.auth?.user?.name
    },
    id () {
      return this.$route.params.id
    },
    hasWords () {
      return this.myWords && this.myWords.length > 0
    },
    hasWon () {
      if (!this.myWords || this.myWords.length < 25) return false

      return hasWon(this.myWords
        .map((x, idx) => ({ clicked: x.clicked, idx }))
        .filter(x => x.clicked)
        .map(x => x.idx)
      )
    },
    hasGamestate () {
      return this.$store.state?.gamestate?.ids.length > 0
    }
  },
  watch: {
    user () {
      this.updateGameUserName()
    },
    hasGamestate (newVal, oldVal) {
      if (newVal === false) {
        this.resetClicks()
      }
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
  mounted () {
    this.updateGameUserName()
    const { Gamestate } = this.$FeathersVuex.api
    Gamestate.find({
      query: {
        bingoId: this.id,
        $limit: 10000,
        $skip: 0,
        $sort: {
          createdAt: -1
        }
      }
    }).then(x => {
      if (!x[0]) {
        this.resetClicks()
      }
    })
  },
  methods: {
    updateGameUserName () {
      const dummyUserName = window.localStorage.getItem(`${this.id}_gameUserName`)
      if (!dummyUserName) {
        this.gameUserName = uuidv4()
      } else {
        this.gameUserName = dummyUserName
      }

      localStorage.setItem(`${this.id}_gameUserName`, this.gameUserName)
    },
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
      const myWords = JSON.parse(window.localStorage.getItem(this.id))

      const { Gamestate } = this.$FeathersVuex.api
      const newGamestate = new Gamestate({
        bingoId: this.id,
        username: this.gameUserName,
        user: this.user,
        clickedIdx: idx,
        word: myWords[idx],
        active: idx === 12 ? true : !myWords[idx].clicked,
        createdAt: new Date()
      })
      newGamestate.save()
      // ignore Joker field
      if (idx === 12) return

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
  font-size: 2vh;
}

.game-field {
  overflow-wrap: anywhere;
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
  background-clip: text;
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
