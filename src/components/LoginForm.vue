<template>
  <b-dropdown
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
                @keyup.native.enter="login"
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
</template>

<script>
export default {
  name: 'LoginForm',
  data: function () {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    isUsernameValid () {
      if (this.username.length >= 2 && this.username.length <= 255) return true
      return false
    },
    isPasswordValid () {
      if (this.password.length >= 12 && this.password.length <= 255) return true
      return false
    }
  },
  methods: {
    async register () {
      try {
        await this.$store.dispatch('users/create', {
          name: this.username,
          password: this.password
        })
      } catch (error) {
        console.error('register: ', error)
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Benutzername ist bereits vergeben.',
          type: 'is-danger'
        })
      }

      await this.login()
    },
    async login () {
      if (!(this.isUsernameValid && this.isPasswordValid)) return
      try {
        await this.$store.dispatch('auth/authenticate', {
          strategy: 'local',
          name: this.username,
          password: this.password
        })

        setTimeout(() => {
          this.username = ''
          this.password = ''
        }, 500)
      } catch (error) {
        console.error('login: ', error)
        this.password = ''
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Benutzername oder Passwort falsch.',
          type: 'is-danger'
        })
      }
    }
  }
}
</script>

<style>

</style>
