<template>
  <div class="App">
    <MoveResize />
  </div>
</template>

<script>
import MoveResize from '@/views/MoveResize'

export default {
  components: {
    MoveResize
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
