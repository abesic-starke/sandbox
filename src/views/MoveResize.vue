<template>
  <button @click="dynamicallyCreateTile">Add</button>
  <div
  class="MoveResize"
  @mouseleave="stopDragWhenMouseOutsideFunc"
  ref="drag-parent"
  @click.shift="dragEnabled = !dragEnabled"
  @click.ctrl="resizeEnabled = !resizeEnabled"
  @keypress="deleteTile()"
  >
  
    <div
    v-for="(tile, ti) in tiles" :key="ti"
    :class="['resizable', `tile-${ti}`, {enableBorder: resizeEnabled || dragEnabled}]"
    :ref="`drag-${ti}`"
    @mousedown="startDrag($event, ti)"
    :style="[
      {top: px(getDefaultPos(tiles[ti].y, 'y'))},
      {left: px(getDefaultPos(tiles[ti].x, 'x'))},
      {width: px(tiles[ti].w)},
      {height: px(tiles[ti].h)},
      {zIndex: curSelTileIndex == ti? 1000 : 1}
    ]">
      <!-- <div class="caption"></div> -->
      <div class="content">
        <slot :name="ti"></slot>
      </div>

      <!-- RESIZE HANDLES -->
      <div
      class='resizers'
      >
        <div
          v-show="resizeEnabled"
          v-for="handle in handles" :key="handle"
          :class="['resizer', handle]"
          @mousedown="resizeHandleDown = true"
          @mouseup="resizeHandleDown = false">
        </div>
      </div>

      <!-- READ ONLY OVERLAY (DISABLES CLICKS) -->
      <div class="readOnlyOverlay" v-if="readOnly"></div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'MoveResize',
  props: ['tileData'],
  data() {
    return {
      handles: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
      // temp
      resizeHandleDown: false,
      // data
      positions: {
        clientX: undefined,
        clientY: undefined,
        movementX: 0,
        movementY: 0
      },
      curSelTileIndex: 0,
      tiles: [
        
      ],
      parentViewportOffset: {x: 0, y: 0},
      // props
      grid: [1, 1], // [px, px]
      allowClickThrough: true,
      dragEnabled: true,
      resizeEnabled: true,
      preventLeavingParent: true,
      stopDragWhenMouseOutside: true,
      allowDragBelowBottom: false,
      readOnly: false
    }
  },
  components: {

  },
  methods: {
    deleteTile() {
      console.log('hi')
      this.tiles.splice(this.curSelTileIndex, 1)

      this.syncData()
    },
    dynamicallyCreateTile() {
      this.tiles.push({
        x: this.parentViewportOffset.x,
        y: this.parentViewportOffset.y,
        w: 100,
        h: 100
      })

      this.syncData()
    },
    px(num) {
      return num + 'px'
    },
    getDefaultPos(pos, direction) {
      // fixes position when X or Y greater than 0
      const offsetVal = direction == 'x'? this.parentViewportOffset.x: this.parentViewportOffset.y

      if (pos > 0) return (pos - offsetVal) < 0 ? 0 : pos - offsetVal 
    
      return pos
    },
    startDrag(e, tileIndex) {
      // Check if dragging is enabled
      if (!this.dragEnabled) return
      // Check if user isn't currently resizing
      if (this.resizeHandleDown) return

      this.curSelTileIndex = tileIndex

      e.preventDefault()
      // get the mouse cursor position at startup:
      this.positions.clientX = e.clientX
      this.positions.clientY = e.clientY
      document.onmousemove = this.elementDrag
      document.onmouseup = this.stopDrag
    },
    elementDrag(e) {
      e.preventDefault()
      this.positions.movementX = this.positions.clientX - e.clientX
      this.positions.movementY = this.positions.clientY - e.clientY
      this.positions.clientX = e.clientX
      this.positions.clientY = e.clientY

      const tileRef = this.$refs[`drag-${this.curSelTileIndex}`][0]

      // set the element's new position:
      const newTop = (tileRef.offsetTop - this.positions.movementY)
      const newLeft = (tileRef.offsetLeft - this.positions.movementX)
      
      // drag element refs
      const elementRef = this.$refs[`drag-${this.curSelTileIndex}`][0]
      const elementWidth = elementRef.offsetWidth
      const elementHeight = elementRef.offsetHeight

      // parent refs
      const parentElementRef = elementRef.parentElement
      const parentWidth = parentElementRef.offsetWidth
      const parentHeight = parentElementRef.offsetHeight

      elementRef.style.top = this.px(newTop)
      elementRef.style.left = this.px(newLeft)

      if (this.preventLeavingParent) {
        // prevent leaving top
        if (newTop < 0) elementRef.style.top = 0
        // prevent leaving left
        if (newLeft < 0) elementRef.style.left = 0
        // prevent leaving bottom
        const maxChildPosFromTop = parentHeight - elementHeight
        if (newTop > maxChildPosFromTop && !this.allowDragBelowBottom) {
          elementRef.style.top = this.px(maxChildPosFromTop)
        }
        // prevent leaving right
        const maxChildPosFromLeft = parentWidth - elementWidth
        if (newLeft > maxChildPosFromLeft) {
          elementRef.style.left = this.px(maxChildPosFromLeft)
        }
      }

      // console.log('top', newTop)
      // console.log('left', newLeft)
    },
    stopDrag() {
      // drag element ref
      const elRef = this.$refs[`drag-${this.curSelTileIndex}`][0]
      
      const tileDataRef = this.tiles[this.curSelTileIndex]
      tileDataRef.x = elRef.offsetLeft + this.parentViewportOffset.x
      tileDataRef.y = elRef.offsetTop + this.parentViewportOffset.y
      tileDataRef.w = elRef.offsetWidth
      tileDataRef.h = elRef.offsetHeight

      document.onmouseup = null
      document.onmousemove = null

      this.syncData()
    },
    stopDragWhenMouseOutsideFunc() {
      if (this.stopDragWhenMouseOutside) {
        document.onmouseup = null
        document.onmousemove = null
      }
    },
    syncData() {
      this.$emit('syncData', this.tiles)
    }
  },
  mounted() {
    const parentElementRef = this.$refs['drag-parent']
    this.parentViewportOffset = {x: parentElementRef.offsetLeft, y: parentElementRef.offsetTop}

    const makeDivResizable = (div) => {
      const element = document.querySelector(div)
      const resizers = document.querySelectorAll(div + ' .resizer')

      const minSize = 20
      let startWidth = 0
      let startHeight = 0
      let startX = 0
      let startY = 0
      let startMouseX = 0
      let startMouseY = 0

      for (let i = 0; i < resizers.length; i++) {
        const currentResizer = resizers[i]

        currentResizer.addEventListener('mousedown', (e) => {
          e.preventDefault()

          startWidth = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''))
          startHeight = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''))
          startX = element.getBoundingClientRect().left
          startY = element.getBoundingClientRect().top
          startMouseX = e.pageX
          startMouseY = e.pageY

          window.addEventListener('mousemove', resize)
          window.addEventListener('mouseup', stopResize)
        })
        
        const resize = (e) =>  {
          // these are relative to the viewport, i.e. the window
          const parentViewportOffset = this.$refs['drag-parent'].getBoundingClientRect()
          console.warn(parentViewportOffset.top, parentViewportOffset.left)
          
          // RESIZE BOTTOM RIGHT
          if (currentResizer.classList.contains('bottom-right')) {
            const width = startWidth + (e.pageX - startMouseX)
            const height = startHeight + (e.pageY - startMouseY)
            if (width > minSize) {
              element.style.width = this.px(width)
            }
            if (height > minSize) {
              element.style.height = this.px(height)
            }
          }
          // RESIZE BOTTOM LEFT
          else if (currentResizer.classList.contains('bottom-left')) {
            const height = startHeight + (e.pageY - startMouseY)
            const width = startWidth - (e.pageX - startMouseX)
            if (height > minSize) {
              element.style.height = this.px(height)
            }
            if (width > minSize) {
              element.style.width = this.px(width)
              element.style.left = startX + (e.pageX - startMouseX) - this.px(parentViewportOffset.left)
            }
          }
          // RESIZE TOP RIGHT
          else if (currentResizer.classList.contains('top-right')) {
            const width = startWidth + (e.pageX - startMouseX)
            const height = startHeight - (e.pageY - startMouseY)
            if (width > minSize) {
              element.style.width = this.px(width)
            }
            if (height > minSize) {
              element.style.height = this.px(height)
              element.style.top = startY + (e.pageY - startMouseY) - this.px(parentViewportOffset.top)
            }
          }
          // RESIZE TOP LEFT
          else {
            const width = startWidth - (e.pageX - startMouseX)
            const height = startHeight - (e.pageY - startMouseY)
            if (width > minSize) {
              element.style.width = this.px(width)
              element.style.left = startX + (e.pageX - startMouseX) - this.px(parentViewportOffset.left)
            }
            if (height > minSize) {
              element.style.height = this.px(height)
              element.style.top = startY + (e.pageY - startMouseY) - this.px(parentViewportOffset.top)
            }
          }
        }
        
        const stopResize = () => {
          window.removeEventListener('mousemove', resize)
        }
      }
    }

    this.tiles.forEach((tile, tileIndex) => {
      makeDivResizable(`.tile-${tileIndex}`)
    })

    // handle deleting field
    window.addEventListener('keyup', (e) => {
      if (e.key == 'Delete') {
        this.deleteTile()
      }
    })
  },
  created() {
    this.tiles = this.tileData
  }
}
</script>

<style lang="scss" scoped>

.MoveResize {
  position: relative;
  height: 400px;
  width: 300px;
  outline: 1px solid black;
  margin-top: 50px;
  margin-left: 50px;
}

// style
.resizable {
  width: 100px;
  height: 100px;
  position: absolute;
}

.resizable .resizers {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.resizable .resizers .resizer {
  width: 10px;
  height: 10px;
  background: black;
  border: 2px solid #FF4500;
  position: absolute;
}

.resizable .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize; /*resizer cursor*/
}
.resizable .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.resizable .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.resizable .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}

.content, .readOnlyOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.enableBorder {
  outline: 2px solid #FF4500;
}

.readOnlyOverlay {
  background-color: rgba(255,0,0,.25);
}

</style>
