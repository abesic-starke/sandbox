<template>
  <div class="TableView">

    <div id="tableCon">
      <Table width="100%" height="100%" />
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
  width: 100%;
  height: 100%;
  background-color: darkslategrey;
}

</style>