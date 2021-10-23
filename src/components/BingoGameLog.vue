<template>
  <div class="container">
    <div class="columns">
      <b-button
        size="is-small"
        type="is-primary is-light"
        @click="clearLog"
      >
        Log Löschen
      </b-button>
    </div>
    <b>Spielstand:</b>
    <ul class="gamescore">
      <li
        v-for="(score, idx) in highscoreList"
        :key="idx"
      >
        <b-tooltip
          type="is-primary is-light"
          position="is-bottom"
          multilined
        >
          <template
            v-slot:content
          >
            <p>{{ score.name }}</p>
            <div
              v-for="(offset) in [0, 5, 10, 15, 20]"
              :key="`offset_${offset}`"
              class="columns m-0 gamescore-preview"
            >
              <div
                v-for="index in [0, 1, 2, 3, 4]"
                :key="`index_${index}`"
                class="column m-0 p-0"
                style="width: 13%; flex: none;"
              >
                <span v-if="score.activeIdx.includes(index + offset)">🟩</span>
                <span v-else>🟥</span>
              </div>
            </div>
          </template>

          {{ score.name }}: {{ score.activeWords }} <span v-if="hasWon(score.activeIdx)">GEWONNEN!</span>
        </b-tooltip>
      </li>
    </ul>

    <hr>

    <b>Logbuch ({{ gamestate.length }} Einträge):</b>
    <ul class="gamelog">
      <li
        v-for="action in gamestate"
        :key="action.id"
      >
        <span
          :class="{'has-background-success-light': action.active, 'has-background-danger-light': !action.active}"
        >
          {{ action.user ? action.user : `Gast_${action.username.substring(0, 8)}` }}:
          "{{ action.word.altText ? action.word.altText : action.word.name }}"<br>
          ({{ new Date(action.createdAt).toLocaleString() }})
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import { hasWon } from '../lib/bingoGameHelper'
import { makeFindMixin } from 'feathers-vuex'

const service = 'gamestate'
export default {
  name: 'BingoGameLog',
  mixins: [makeFindMixin({
    service,
    watch: true,
    qid: `${service}List`
  })],
  data: function () {
    return {
      order: -1,
      current: 1,
      limit: 1000,
      skip: 0
    }
  },
  computed: {
    qid () {
      return `${service}List`
    },
    id () {
      return this.$route.params.id
    },
    gamestateParams () {
      return {
        query: {
          bingoId: this.id,
          $limit: this.limit,
          $skip: this.skip,
          $sort: {
            createdAt: this.order
          }
        },
        paginate: false // This restores previous functionality
      }
    },
    highscoreList () {
      const scoreList = []
      const users = {}
      for (let i = this.gamestate.length - 1; i >= 0; i--) {
        if (this.gamestate[i].word.name === 'JOKER') continue

        const userIdentifier = this.gamestate[i].user ? this.gamestate[i].user : `Gast_${this.gamestate[i].username.substring(0, 8)}`
        users[userIdentifier] = users[userIdentifier] || {}
        users[userIdentifier].activeIdx = users[userIdentifier].activeIdx || [12]
        users[userIdentifier].activeWords = users[userIdentifier].activeWords || 0
        users[userIdentifier].name = userIdentifier
        if (this.gamestate[i].active) {
          users[userIdentifier].activeWords++
          users[userIdentifier].activeIdx.push(this.gamestate[i].clickedIdx)
        } else {
          users[userIdentifier].activeWords--

          for (let j = users[userIdentifier].activeIdx.length - 1; j >= 0; j--) {
            if (parseInt(users[userIdentifier].activeIdx[j]) === parseInt(this.gamestate[i].clickedIdx)) {
              users[userIdentifier].activeIdx.splice(j, 1)
            }
          }
        }
      }

      for (let i = 0; i < Object.keys(users).length; i++) {
        const user = users[Object.keys(users)[i]]
        user.activeIdx = [...new Set(user.activeIdx)].sort((a, b) => parseInt(a) > parseInt(b) ? 1 : -1)
        scoreList.push(user)
      }

      return scoreList.sort((a, b) => {
        if (a.activeWords > b.activeWords) return -1
        return 1
      })
    }
  },
  watch: {
    gamestate () {
      this.findGamestate()
    }
  },
  methods: {
    hasWon (activeIdx) {
      return hasWon(activeIdx)
    },
    async clearLog () {
      try {
        await this.$store.dispatch('gamestate/remove', this.id)
        await this.$store.commit('gamestate/clearAll')
        this.findGamestate()
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.gamescore {
  min-height: 20vh;
}

.gamescore-preview {
  padding-left: 25%;
}

.gamelog {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
