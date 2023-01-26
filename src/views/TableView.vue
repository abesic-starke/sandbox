<template>
  <div class="TableView">

    <div id="tableCon">
      <Table width="250px" height="250px" />
    </div>

  </div>
</template>

<script>
import Table from '@/components/Table'

export default {
    components: {Table}
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

</style>