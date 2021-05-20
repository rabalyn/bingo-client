<template>
  <div
    id="app"
    class="container"
  >
    <b-navbar :shadow="true">
      <template #start>
        <b-navbar-item
          tag="router-link"
          to="/"
          :active="currentRouteName === 'Home'"
        >
          Home
        </b-navbar-item>
        <b-navbar-item
          v-if="userIsAdmin"
          tag="router-link"
          to="/tpcs"
          :active="currentRouteName === 'Topics'"
        >
          Kategorien
        </b-navbar-item>
        <b-navbar-item
          v-if="userIsAdmin"
          tag="router-link"
          to="/wrds"
          :active="currentRouteName === 'Words'"
        >
          Worte
        </b-navbar-item>
        <b-navbar-item
          v-if="userIsAdmin"
          tag="router-link"
          to="/opts"
          :active="currentRouteName === 'Options'"
        >
          Optionen
        </b-navbar-item>
        <b-navbar-item
          tag="router-link"
          to="/about"
          :active="currentRouteName === 'About'"
        >
          About
        </b-navbar-item>
      </template>

      <template #end>
        <b-navbar-item>
          <a v-if="user">
            <b-icon
              size="is-small"
              icon="account"
            />
            {{ user.name }}
          </a>
        </b-navbar-item>
        <b-navbar-item
          v-if="user"
          tag="div"
        >
          <b-button
            type="is-danger is-light"
            @click="logout"
          >
            <b-icon icon="logout" />
          </b-button>
        </b-navbar-item>

        <b-navbar-item
          v-if="!displayName"
          tag="div"
        >
          <login-form />
        </b-navbar-item>

        <b-navbar-item>
          <connected-users />
        </b-navbar-item>
      </template>
    </b-navbar>

    <router-view class="mt-5" />
  </div>
</template>

<script>
import ConnectedUsers from './components/ConnectedUsers.vue'
import LoginForm from './components/LoginForm.vue'

export default {
  components: {
    ConnectedUsers,
    LoginForm
  },
  computed: {
    currentRouteName () {
      return this.$route.name
    },
    user () {
      return this.$store.state.auth.user
    },
    userIsAdmin () {
      if (!this.user) return false
      return this.user.rights.map(x => x.name).includes('isAdmin')
    },
    displayName () {
      if (this.user?.name) {
        return this.user.name
      }

      return ''
    }
  },
  mounted () {
    this.$store.dispatch('auth/authenticate').catch(error => {
      if (!error.message.includes('No accessToken found in storage')) {
        console.error(error)
      }
    })
  },
  methods: {
    logout () {
      this.$store.dispatch('auth/logout')
        .then(() => {
          if (this.$route.path !== '/') { this.$router.push('/') }
        })
    }
  }
}
</script>

<style>
</style>
