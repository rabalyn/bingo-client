<template>
  <div class="container">
    <b-loading :active="isFindUsersPending" />

    <bingos-pagination
      :current.sync="current"
      :limit.sync="limit"
      :total.sync="total"
      :order.sync="order"
    />

    <ul>
      <li
        v-for="user in usersFetched"
        :key="user.id"
      >
        <b-field label="Benutzername">
          {{ user.name }} (zuletzt aktualisiert: {{ new Date(user.updatedAt).toLocaleString() }})
          <b-button
            size="is-small"
            type="is-danger"
            @click="deleteUser(user)"
          >
            <b-icon
              icon="delete"
            />
          </b-button>
        </b-field>
        <b-field
          label="Passwort"
          :type="isPasswordValid ? 'is-success' : 'is-danger'"
          :class="{ isHidden: newPassword.length && username !== user.name }"
        >
          <b-input
            v-model="newPassword"
            type="password"
            placeholder="neues Passwort..."
            label="Neues Password"
            minlength="12"
            maxlength="255"
            required
            password-reveal
            @focus="username = user.name"
          />
          <b-button
            :disabled="!isPasswordValid || (username !== user.name)"
            @click="saveNewPassword(user)"
          >
            Neues Passwort Speichern
          </b-button>
        </b-field>
        <hr>
      </li>
    </ul>
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
import BingosPagination from './BingosPagination.vue'

import { makeFindMixin } from 'feathers-vuex'

const service = 'users'
export default {
  name: 'BingoUsers',
  components: {
    BingosPagination
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

      username: '',
      newPassword: ''
    }
  },
  computed: {
    isPasswordValid () {
      if (this.newPassword.length >= 12 && this.newPassword.length <= 255) return true
      return false
    },
    qid () {
      return `${service}List`
    },
    usersParams () {
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
      if (!this?.usersPaginationData[this.qid]?.mostRecent?.total) return -1
      return this.usersPaginationData[this.qid].mostRecent.total
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
    async saveNewPassword (user) {
      if (!this.isPasswordValid) {
        return this.$buefy.toast.open({
          message: 'Neues Passwort ist ungültig, Passwort wurde nicht aktualisiert.',
          type: 'is-danger'
        })
      }
      user.password = this.newPassword
      this.newPassword = ''

      try {
        await user.save()
        this.$buefy.toast.open({
          message: `Passwort für ${user.name} erfolgreich aktualisiert.`,
          type: 'is-success'
        })
      } catch (error) {
        this.$buefy.toast.open({
          message: `Passwort für ${user.name} konnte nicht aktualisiert werden.`,
          type: 'is-danger'
        })
        console.error(error)
      }
    },
    async deleteUser (user) {
      try {
        await user.remove()
        this.$buefy.toast.open({
          message: `Nutzer ${user.name} erfolgreich gelöscht.`,
          type: 'is-success'
        })
      } catch (error) {
        this.$buefy.toast.open({
          message: `Nutzer ${user.name} konnte nicht gelöscht werden.`,
          type: 'is-danger'
        })
      }
    }
  }
}
</script>

<style>
.isHidden {
  opacity: 0;
}

</style>
