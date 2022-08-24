<template>
  <div class="MoveResizeTest">

    <button @click="active = !active">reactivate</button>
    <MoveResize
      :active="active"
      :tileData="fields"
      :gridSize="4"
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
          <img class="image" src="https://picsum.photos/1920/1080">
        </div>
      </template>

    </MoveResize>
    <router-view />
  </div>
</template>

<script>
import MoveResize from '@/components/MoveResize'

export default {
  components: {
    MoveResize
  },
  data() {
    return {
      active: true,
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
          h: 108,
          aspectRatio: 108/192
        },
        {
          type: 'text',
          x: 150,
          y: 250,
          w: 150,
          h: 160
        },
        {
          type: 'button',
          x: 0,
          y: 0,
          w: 100,
          h: 120
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

.someContent {
  height: 100%;
  width: 100%;
  background-color: saddlebrown;
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit:cover;
  }
}

</style>