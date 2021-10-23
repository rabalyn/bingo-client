<template>
  <section>
    <b-field :label="label">
      <FeathersVuexFind
        :service="service"
        :params="{
          query: {
            $limit: queryLimit
          }
        }"
        :fetch-params="{
          query: {
            $limit: queryLimit,
            $sort: {
              name: 1
            },
            search
          }
        }"
        :watch="['fetchParams', 'params']"
      >
        <div>
          <b-switch
            v-model="isImage"
            :left-label="true"
            size="is-small"
          >
            <span v-if="isImage">
              <b-icon icon="image" />
            </span>
            <span v-else>
              <b-icon icon="text" />
            </span>
          </b-switch>
          <b-field
            label="Bildtitel"
          >
            <b-input
              v-model="altText"
              :disabled="!isImage"
            />
          </b-field>
          <b-autocomplete
            v-model="value"
            rounded
            :data="filteredData"
            :placeholder="placeholder"
            icon="magnify"
            clearable
            :clear-on-select="true"
            field="name"
            @select="option => (triggerSelectAction(option))"
          >
            <template #footer>
              <a @click="addNewObj">
                <span> Add new... </span>
              </a>
            </template>
            <template #empty>
              {{ value }}
            </template>
          </b-autocomplete>
        </div>
      </FeathersVuexFind>
    </b-field>
  </section>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    service: {
      type: String,
      default: ''
    },
    column: {
      type: String,
      default: ''
    },
    queryLimit: {
      type: Number,
      default: 5
    },
    selectAction: {
      type: Function,
      default: function () {}
    }
  },
  data () {
    return {
      value: '',
      isImage: false,
      altText: ''
    }
  },
  computed: {
    ModelName () {
      return `${this.service[0].toUpperCase()}${this.service.slice(1)}`
    },
    filteredData () {
      return this.$FeathersVuex.api[this.ModelName].findInStore({ query: {} })
        .data
        .filter((x) => {
          return x.name.toLowerCase().includes(this.value.toLowerCase())
        })
    },
    search () {
      const searchObj = {}
      searchObj[`${this.service}.${this.column}`] = {
        $ilike: `%${this.value}%`
      }
      return searchObj
    }
  },
  methods: {
    addNewObj () {
      const newObj = new this.$FeathersVuex.api[this.ModelName]({
        name: this.value,
        altText: this.altText
      })
      this.triggerSelectAction(newObj)
    },
    triggerSelectAction (option) {
      if (!option) return

      const newObj = new this.$FeathersVuex.api[this.ModelName]({
        id: option.id,
        name: option.name,
        altText: option.altText
      })
      console.log(newObj)
      this.value = ''
      this.altText = ''
      this.selectAction(newObj)
    }
  }
}
</script>
