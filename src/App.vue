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

        <b-navbar-item tag="div">
          <b-dropdown
            ref="loginDropdown"
            position="is-bottom-left"
            append-to-body
            aria-role="menu"
            trap-focus
          >
            <template #trigger>
              <a
                class="navbar-item"
                role="button"
              >
                <span>Login</span>
                <b-icon icon="menu-down" />
              </a>
            </template>

            <b-dropdown-item
              aria-role="menu-item"
              :focusable="false"
              custom
              paddingless
            >
              <form action="">
                <div
                  class="modal-card"
                  style="width:300px;"
                >
                  <section class="modal-card-body">
                    <b-field
                      label="Benutzername"
                      :type="isUsernameValid ? 'is-success' : 'is-danger'"
                    >
                      <b-input
                        v-model="username"
                        type="text"
                        placeholder="Benutzername..."
                        minlength="2"
                        maxlength="255"
                        required
                      />
                    </b-field>

                    <b-field
                      label="Passwort"
                      :type="isPasswordValid ? 'is-success' : 'is-danger'"
                    >
                      <b-input
                        v-model="password"
                        type="password"
                        placeholder="Passwort..."
                        minlength="12"
                        maxlength="255"
                        required
                        password-reveal
                      />
                    </b-field>
                  </section>
                  <footer class="modal-card-foot">
                    <b-button
                      label="Registrieren"
                      type="is-info is-light"
                      :disabled="!(isUsernameValid && isPasswordValid)"
                      @click="register"
                    />

                    <b-button
                      label="Login"
                      type="is-success is-light"
                      :disabled="!(isUsernameValid && isPasswordValid)"
                      @click="login"
                    />
                  </footer>
                </div>
              </form>
            </b-dropdown-item>
          </b-dropdown>
        </b-navbar-item>
      </template>
    </b-navbar>

    <router-view class="mt-5" />
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    currentRouteName () {
      return this.$route.name
    },
    user () {
      return this.$store.state.auth.user
    },
    displayName () {
      if (this.user?.name) {
        return this.user.name
      }

      return ''
    },
    isUsernameValid () {
      if (this.username.length >= 2 && this.username.length <= 255) return true
      return false
    },
    isPasswordValid () {
      if (this.password.length >= 12 && this.password.length <= 255) return true
      return false
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
    async register () {
      try {
        await this.$store.dispatch('users/create', {
          name: this.username,
          password: this.password
        })
      } catch (error) {
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Benutzername ist bereits vergeben.',
          type: 'is-danger'
        })
      }

      this.login()
    },
    async login () {
      try {
        await this.$store.dispatch('auth/authenticate', {
          strategy: 'local',
          name: this.username,
          password: this.password
        })

        this.$refs.loginDropdown.toggle()
      } catch (error) {
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Benutzername oder Passwort falsch.',
          type: 'is-danger'
        })
      }
    },
    logout () {
      this.$store.dispatch('auth/logout')
    }
  }

}
</script>

<style>
</style>
