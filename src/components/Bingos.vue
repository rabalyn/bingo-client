<template>
  <FeathersVuexFind
    v-slot="{ isFindPending, items: bingos }"
    service="bingos"
    :params="internalParams"
    :fetch-params="fetchParams"
    :edit-scope="getPaginationInfo"
    watch="params"
  >
    <div class="container">
      <b-loading :active="isFindPending" />

      <div class="columns">
        <bingo-form
          :edit-bingo="editBingo"
          :refresh.sync="refresh"
        />
      </div>

      <bingos-pagination
        :current.sync="current"
        :limit.sync="limit"
        :total.sync="total"
        :order.sync="order"
      />

      <div
        v-for="bingo in bingos"
        :key="bingo.id"
        class="card mx-3 my-3 column"
      >
        <header class="card-header">
          <p class="card-header-title">
            {{ bingo.name }}
          </p>
          <p>
            {{ new Date(bingo.createdAt).toLocaleString() }}
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
  </FeathersVuexFind>
</template>

<script>
import BingoForm from './BingoForm.vue'
import BingosPagination from './BingosPagination.vue'
import ScrollToTop from './ScrollToTop.vue'

export default {
  name: 'Bingos',
  components: {
    BingoForm,
    BingosPagination,
    ScrollToTop
  },
  data: function () {
    return {
      refresh: false,
      service: 'bingos',
      ids: [],
      order: -1,
      total: 0,
      limit: 5,
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
    params () {
      return {
        query: {
          $sort: {
            createdAt: this.order
          }
        }
      }
    },
    internalParams () {
      const { idField } = this.$store.state[this.service]
      return {
        query: {
          [idField]: {
            $in: this.ids
          },
          $sort: {
            createdAt: this.order
          }
        }
      }
    },
    fetchParams () {
      const query = Object.assign(
        {},
        this.params.query,
        {
          $limit: this.limit,
          $skip: this.skip
        }
      )

      return Object.assign({}, this.params, { query })
    }
  },
  watch: {
    current () {
      this.skip = this.limit * (this.current - 1)
    },
    refresh () {
      if (this.refresh) {
        this.current += 1
        this.$nextTick(() => {
          this.current -= 1
          this.refresh = false
        })
      }
    }
  },
  methods: {
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

      await this.$store.dispatch('bingos/find', this.fetchParams)
      this.current += 1
      this.$nextTick(() => {
        this.current -= 1
      })
    }
  }
}
</script>

<style>
</style>
