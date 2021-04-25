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
      :total.sync="total"
      :order.sync="order"
    />

    <div
      v-for="bingo in bingosFetched"
      :key="bingo.id"
      class="card mx-3 my-3 column"
    >
      <header class="card-header">
        <p class="card-header-title">
          {{ bingo.name }}
        </p>
        <p>
          {{ new Date(bingo.updatedAt).toLocaleString() }}
        </p>
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
            >
              {{ word.name }}
            </b-tag>
          </b-taglist>

          <h5>Kategorien ({{ bingo.topics.length }})</h5>
          <b-taglist>
            <b-tag
              v-for="topic in bingo.topics"
              :key="topic.id"
            >
              {{ topic.name }}
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
            class="mx-1 my-2"
            type="is-warning is-light"
            @click="loadBingoEdit(bingo)"
          >
            Editiere Bingo
          </b-button>
        </scroll-to-top>
        <b-button
          class="mx-1 my-2"
          type="is-danger is-light"
          @click="removeBingo(bingo)"
        >
          Lösche Bingo
        </b-button>
      </div>
    </div>

    <bingos-pagination
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

export default {
  name: 'Bingos',
  components: {
    BingoForm,
    BingosPagination,
    ScrollToTop
  },
  mixins: [makeFindMixin({ service: 'bingos', watch: true })],
  data: function () {
    return {
      service: 'bingos',
      ids: [],
      order: -1,
      total: 0,
      limit: 2,
      skip: 0,
      current: 1,

      editBingo: {
        id: null,
        name: '',
        description: '',
        words: [],
        topics: []
      }
    }
  },
  computed: {
    bingosParams () {
      const { idField } = this.$store.state[this.service]
      return {
        query: {
          [idField]: {
            $in: this.ids
          },
          $sort: {
            updatedAt: this.order
          }
        }
      }
    },
    bingosFetchParams () {
      return {
        query: {
          $limit: this.limit,
          $skip: this.skip,
          $sort: {
            updatedAt: this.order
          }
        },
        debounce: 500
      }
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
    getPaginationInfo (scope) {
      const { queryInfo, pageInfo } = scope

      this.total = queryInfo.total
      if (pageInfo && pageInfo.ids) {
        this.ids = pageInfo.ids
      }
    },
    loadBingoEdit (bingo) {
      this.editBingo.id = bingo.id
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
      this.editBingo.name = ''
      this.editBingo.description = ''
      this.editBingo.words = []
      this.editBingo.topics = []
      await bingo.remove()
      this.refresh()
    }
  }
}
</script>

<style>
</style>
