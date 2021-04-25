<template>
  <a
    v-show="visible"
    class="bottom-right"
    @click="scrollTop"
  >
    <slot />
  </a>
</template>

<script>
export default {
  data () {
    return {
      visible: true
    }
  },
  mounted: function () {
    window.addEventListener('scroll', this.scrollListener)
  },
  beforeDestroy: function () {
    window.removeEventListener('scroll', this.scrollListener)
  },
  methods: {
    scrollTop: function () {
      this.intervalId = setInterval(() => {
        if (window.pageYOffset === 0) {
          clearInterval(this.intervalId)
        }
        window.scroll(0, window.pageYOffset - 50)
      }, 20)
    },
    scrollListener: function (e) {
      // this.visible = window.scrollY > 150
    }
  }
}
</script>

<style scoped>
</style>
