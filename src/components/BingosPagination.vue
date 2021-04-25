<template>
  <div class="columns">
    <div class="column is-5" />
    <div class="column is-3">
      <b-dropdown
        v-model="innerLimit"
        @change="$emit('update:limit', $event)"
      >
        <template #trigger>
          <b-button size="is-small">
            {{ limit }} pro Seite
          </b-button>
        </template>
        <b-dropdown-item
          v-for="pageSize in pageSizes"
          :key="pageSize"
          :value="pageSize"
        >
          {{ pageSize }}
        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown
        v-model="innerOrder"
        @change="$emit('update:order', $event)"
      >
        <template #trigger>
          <b-button size="is-small">
            {{ order === 1 ? 'Älteste zuerst' : 'Neuste zuerst' }}
          </b-button>
        </template>
        <b-dropdown-item :value="-1">
          Neuste zuerst
        </b-dropdown-item>
        <b-dropdown-item :value="1">
          Älteste zuerst
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="column is-4">
      <b-pagination
        v-model="innerCurrent"
        :total="total"
        :per-page="limit"
        size="is-small"
        :range-before="2"
        :range-after="2"
        @change="$emit('update:current', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BingosPagination',
  props: {
    current: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 5
    },
    order: {
      type: Number,
      default: -1
    },
    pageSizes: {
      type: Array,
      default: function () {
        return [2, 5, 10, 15]
      }
    }
  },
  data: function () {
    return {
      innerCurrent: 1,
      innerLimit: 5,
      innerOrder: -1
    }
  },
  watch: {
    current () {
      this.innerCurrent = this.current
    }
  }
}
</script>

<style>

</style>
