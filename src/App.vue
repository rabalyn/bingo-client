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
    </b-navbar>
    <router-view class="mt-5" />
  </div>
</template>

<script>
export default {
  computed: {
    currentRouteName () {
      return this.$route.name
    }
  }

}
</script>

<style>
</style>
