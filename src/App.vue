<template>
  <div class="App">
    <MoveResize>

      <template v-slot:0>
        <div class="someContent">
          <p>very pretty</p>
          <button @click="log()">hallo</button>
        </div>
      </template>

      <template v-slot:1>
        <div class="someContent">
          <p>NO pretty</p>
        </div>
      </template>
      
    </MoveResize>
  </div>
</template>

<script>
import MoveResize from '@/views/MoveResize'

export default {
  components: {
    MoveResize
  },
  methods: {
    log() {
      console.log('click')
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

.someContent {
  height: 100%;
  width: 100%;
  background-color: saddlebrown;
}

</style>
