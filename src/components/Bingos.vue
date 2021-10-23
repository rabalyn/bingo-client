<template>
  <div class="container">
    <b-loading :active="isFindBingosPending" />

    <div class="columns">
      <bingo-form
        :edit-bingo="editBingo"
      />
    </div>

    <bingos-pagination
      :current.sync="current"
      :limit.sync="limit"
      :total="total"
      :order.sync="order"
    />

    <div
      v-for="bingo in bingosFetched"
      :key="bingo.id"
      class="card mx-3 my-3 column"
    >
      <header class="card-header">
        <p class="card-header-title">
          {{ bingo.name }} <span
            v-if="bingo.owner"
            class="mx-2"
          >Besitzer: {{ bingo.owner.name }}</span>
        </p>
        <p>
          {{ new Date(bingo.updatedAt).toLocaleString() }}
        </p>
        <span class="mx-2">
          <b-icon
            v-if="bingo.is_private"
            icon="lock"
          />
          <b-icon
            v-else
            icon="earth"
          />
        </span>
      </header>
      <div class="card-content">
        <div class="content">
          <h4>
            Beschreibung: {{ bingo.description }}
          </h4>

          <h5>Bingowörter ({{ bingo.words.length }})</h5>
          <b-taglist>
            <b-tag
              v-for="word in bingo.words"
              :key="word.id"
              :type="word.altText ? 'is-warning is-light' : 'is-info is-light'"
            >
              <span
                v-if="word.altText"
                style="cursor: default;"
              >
                <b-tooltip
                  position="is-bottom"
                  multilined
                  type="is-white"
                >
                  {{ word.altText }}
                  <template v-slot:content>
                    <img :src="word.name">
                  </template>
                </b-tooltip>
              </span>
              <span v-else>
                {{ word.name }}
              </span>
            </b-tag>
          </b-taglist>

          <h5>Kategorien ({{ bingo.topics.length }})</h5>
          <b-taglist>
            <b-tag
              v-for="topic in bingo.topics"
              :key="topic.id"
              :type="topic.altText ? 'is-warning is-light' : 'is-info is-light'"
            >
              {{ topic.altText ? topic.altText : topic.name }}
            </b-tag>
          </b-taglist>
        </div>
      </div>
      <div class="card-footer">
        <b-button
          class="mx-1 my-2"
          type="is-info is-light"
          @click="$router.push(`bingos/${bingo.id}`)"
        >
          Lade Bingodetails
        </b-button>
        <scroll-to-top>
          <b-button
            v-if="bingo.is_private === false || (user && user.id === bingo.user_id)"
            class="mx-1 my-2"
            type="is-warning is-light"
            @click="loadBingoEdit(bingo)"
          >
            Editiere Bingo
          </b-button>
        </scroll-to-top>
        <b-button
          v-if="bingo.is_private === false || (user && user.id === bingo.user_id)"
          class="mx-1 my-2"
          type="is-danger is-light"
          @click="removeBingo(bingo)"
        >
          Lösche Bingo
        </b-button>
        <b-button
          v-if="bingo.is_private === false || (user && user.id === bingo.user_id)"
          class="mx-1 my-2"
          type="is-info is-light"
          @click="exportBingo(bingo)"
        >
          Export
        </b-button>
      </div>
    </div>

    <bingos-pagination
      dropdowns-position="is-top-right"
      :current.sync="current"
      :limit.sync="limit"
      :total.sync="total"
      :order.sync="order"
    />
  </div>
</template>

<script>
import BingoForm from './BingoForm.vue'
import BingosPagination from './BingosPagination.vue'
import ScrollToTop from './ScrollToTop.vue'

import { makeFindMixin } from 'feathers-vuex'

const service = 'bingos'
export default {
  name: 'Bingos',
  components: {
    BingoForm,
    BingosPagination,
    ScrollToTop
  },
  mixins: [makeFindMixin({
    service,
    watch: true,
    qid: `${service}List`
  })],
  data: function () {
    return {
      order: -1,
      current: 1,
      limit: 5,
      skip: 0,

      editBingo: {
        id: null,
        owner: null,
        is_private: false,
        name: '',
        description: '',
        words: [],
        topics: []
      }
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    },
    qid () {
      return `${service}List`
    },
    bingosParams () {
      return {
        query: {
          $limit: this.limit,
          $skip: this.skip,
          $sort: {
            updatedAt: this.order
          }
        },
        paginate: false // This restores previous functionality
      }
    },
    total () {
      if (!this?.bingosPaginationData[this.qid]?.mostRecent?.total) return -1
      return this.bingosPaginationData[this.qid].mostRecent.total
    }
  },
  watch: {
    current () {
      this.skip = this.limit * (this.current - 1)
    },
    bingos () {
      this.findBingos()
    }
  },
  methods: {
    refresh () {
      this.findBingos()
    },
    loadBingoEdit (bingo) {
      this.editBingo.id = bingo.id
      this.editBingo.owner = bingo.owner
      this.editBingo.is_private = bingo.is_private
      this.editBingo.name = bingo.name
      this.editBingo.description = bingo.description
      this.editBingo.words = bingo.words
      this.editBingo.topics = bingo.topics
    },
    async removeBingo (bingo) {
      bingo.words = []
      bingo.topics = []
      await bingo.save()
      this.editBingo.id = null
      this.editBingo.owner = null
      this.editBingo.is_private = false
      this.editBingo.name = ''
      this.editBingo.description = ''
      this.editBingo.words = []
      this.editBingo.topics = []
      await bingo.remove()
      this.refresh()
    },
    exportBingo (bingo) {
      bingo.words = bingo.words.map(x => ({ name: x.name }))
      bingo.topics = bingo.topics.map(x => ({ name: x.name }))

      const data = JSON.stringify({
        name: bingo.name,
        description: bingo.description,
        words: bingo.words,
        topics: bingo.topics
      })
      const blob = new Blob([data], { type: 'text/plain' })
      const e = document.createEvent('MouseEvents')
      const a = document.createElement('a')
      a.download = `bingo_${bingo.name}.json`
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
    }
  }
}
</script>

<style>
</style>
