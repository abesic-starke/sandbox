<template>
  <div class="App">
    <div
    class="routePath"
    v-for="route in routes" :key="route"
    @click="goToRoute(route)">
      <button>{{ route.name }}</button>
    </div>

    <router-view />
  </div>
</template>

<script>
import routes from '@/data/routePaths'

export default {
  components: {

  },
  data() {
    return {
      routes
    }
  },
  methods: {
    goToRoute(route) {
      this.$router.push(route.name)
    }
  }
}
</script>

<style lang="scss">

.App {
  position: relative;
  height: 100vh;
  width: 100vw;
  background-color: lightslategray;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
}

</style>
