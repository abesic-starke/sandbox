<template>
  <div class="App">

    <div class="routePaths">
      <button
      v-for="route in routes"
      :key="route"
      @click="goToRoute(route)">
        {{ route.name }}
      </button>
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

.routePaths {
  background-color: rgba(0,0,0,.2);
  button {
    margin: 5px;
    padding: 3px 10px 3px 10px;
  }
}

</style>
