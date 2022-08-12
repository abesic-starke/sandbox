<template>
  <div class="App">
    <router-view/>
  </div>
</template>

<script>
export default {
  created() {
    this.$router.push('/move-resize')
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
