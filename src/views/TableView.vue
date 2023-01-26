<template>
  <div class="TableView">

    <button @click="width += 50; reRender++">+</button>
    <button @click="width -= 50; reRender++">-</button>

    <div id="tableCon" :style="{width: `${width}px`}">
      <Table />
    </div>

  </div>
</template>

<script>
import Table from '@/components/Table'

export default {
  components: {Table},
  data() {
    return {
      width: 250,
      height: 250,
      reRender: 0
    }
  },
}
</script>

<style lang="scss">

.TableView {
  position: relative;
  width: 100%;
  height: 100%;
}

#tableCon {
  position: absolute;
  top: 150px;
  left: 150px;
  width: 300px;
  height: 250px;
  background-color: darkslategrey;
}

button {
  margin: 10px;
  padding: 10px;
}

</style>