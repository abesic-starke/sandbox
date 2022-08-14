<template>
  <div class="App">
    <MoveResize
      :tileData="fields"
      @syncData="fields = $event">

      <template v-for="(field, i) in fields" :key="i" v-slot:[i]>
        <div class="someContent" v-if="field.type == 'button'">
          <p>Press me</p>
          <button @click="log()">button</button>
        </div>

        <div class="someContent" v-if="field.type == 'text'">
          <p>NO pretty</p>
        </div>

        <div class="someContent" v-if="field.type == 'input'">
          <input placeholder="Value">
        </div>

        <div class="someContent" v-if="field.type == 'image'">
          <img src="https://picsum.photos/1920/1080">
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
  data() {
    return {
      fields: [
        {
          type: 'input',
          x: 100,
          y: 10,
          w: 150,
          h: 40
        },
        {
          type: 'image',
          x: 0,
          y: 200,
          w: 192,
          h: 108
        },
        {
          type: 'text',
          x: 150,
          y: 250,
          w: 150,
          h: 150
        },
        {
          type: 'button',
          x: 0,
          y: 0,
          w: 100,
          h: 100
        }
      ]
    }
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
  img {
    max-width: 100%;
    max-height: 100%;
  }
}

</style>
