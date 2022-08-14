<template>
  <button @click="dynamicallyCreateTile">Add</button>
  <div
  class="MoveResize"
  @mouseleave="stopDragWhenMouseOutsideFunc"
  ref="drag-parent"
  @click.shift="dragEnabledDyn = !dragEnabledDyn"
  @click.ctrl="resizeEnabledDyn = !resizeEnabledDyn">
  
    <div
    v-for="(tile, ti) in tiles" :key="ti"
    :class="[
      'resizable',
      `tile-${ti}`,
      {enableBorder: resizeEnabledDyn || dragEnabledDyn},
      {tileSelected: curSelTileIndex == ti}
    ]"
    :ref="`drag-${ti}`"
    @mousedown="startDrag($event, ti)"
    @click="selectTile(ti)"
    :style="[
      {top: `${getDefaultPos(tiles[ti].y, 'y')}px`},
      {left: `${getDefaultPos(tiles[ti].x, 'x')}px`},
      {width: `${tiles[ti].w}px`},
      {height: `${tiles[ti].h}px`},
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
          v-show="resizeEnabledDyn"
          v-for="handle in handles" :key="handle"
          :class="['resizer', handle, {tileSelectedHandle: curSelTileIndex == ti}]"
          @mousedown="selectTile(ti); resizeHandleDown = true"
          @mouseup="selectTile(ti); resizeHandleDown = false; stopDrag()">
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
  props: {
    tileData: Array,
    active: Boolean,
    readOnly: Boolean,
    dragEnabled: {
      type: Boolean,
      default: true
    },
    resizeEnabled: {
      type: Boolean,
      default: true
    },
    preventLeavingParent: {
      type: Boolean,
      default: true
    },
    minWidth: {
      type: Number,
      default: 100
    },
    minHeight: {
      type: Number,
      default: 100
    },
    // auto keeping aspect for bottom-right handle when tile.aspectRatio exists
    keepAspectRatio: {
      type: Boolean,
      default: true
    },
    allowDragBelowBottom: Boolean
    
  },
  emits: ['syncData'],
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
      tiles: [],
      parentViewportOffset: {x: 0, y: 0},
      // props
      grid: [1, 1], // [px, px]
      stopDragWhenMouseOutside: true,
      dragEnabledDyn: JSON.parse(this.dragEnabled),
      resizeEnabledDyn: JSON.parse(this.resizeEnabled)
    }
  },
  watch: {
    active(bool) {
      this.dragEnabledDyn = bool
      this.resizeEnabledDyn = bool
    },
    readOnly(bool) {
      this.dragEnabledDyn = !bool
      this.resizeEnabledDyn = !bool
    }
  },
  methods: {
    deleteTile() {
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

      this.$nextTick(() => {
        this.makeDivResizable(`.tile-${this.tiles.length-1}`)

        this.syncData()
      })
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
    selectTile(tileIndex) {
      this.curSelTileIndex = tileIndex
    },
    startDrag(e, tileIndex) {
      // Check if dragging is enabled
      if (!this.dragEnabledDyn) return
      // Check if user isn't currently resizing
      if (this.resizeHandleDown) return

      this.selectTile(tileIndex)

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

      elementRef.style.top = newTop + 'px'
      elementRef.style.left = newLeft + 'px'

      if (this.preventLeavingParent) {
        // prevent leaving top
        if (newTop < 0) elementRef.style.top = 0
        // prevent leaving left
        if (newLeft < 0) elementRef.style.left = 0
        // prevent leaving bottom
        const maxChildPosFromTop = parentHeight - elementHeight
        if (newTop > maxChildPosFromTop && !this.allowDragBelowBottom) {
          elementRef.style.top = maxChildPosFromTop + 'px'
        }
        // prevent leaving right
        const maxChildPosFromLeft = parentWidth - elementWidth
        if (newLeft > maxChildPosFromLeft) {
          elementRef.style.left = maxChildPosFromLeft + 'px'
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
    },
    makeDivResizable(className) {
      const element = document.querySelector(className)
      const resizers = document.querySelectorAll(className + ' .resizer')

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
          const parentViewportOffset = {
            top: this.$refs['drag-parent'].offsetTop,
            left: this.$refs['drag-parent'].offsetLeft
          }
          
          // RESIZE BOTTOM RIGHT
          if (currentResizer.classList.contains('bottom-right')) {
            const width = startWidth + (e.pageX - startMouseX)
            const height = startHeight + (e.pageY - startMouseY)
            if (width > this.minWidth) {
              element.style.width = width + 'px'
            }
            if (height > this.minHeight) {
              // resize with keeping the aspect ratio
              if (this.keepAspectRatio) {
                const aspectRatio = this.tiles[this.curSelTileIndex].aspectRatio

                if (aspectRatio) {
                  return element.style.height = Math.round(width * aspectRatio) + 'px'
                }
              } 

              // resize without keeping it
              element.style.height = height + 'px'
            }
          }
          // RESIZE BOTTOM LEFT
          else if (currentResizer.classList.contains('bottom-left')) {
            const height = startHeight + (e.pageY - startMouseY)
            const width = startWidth - (e.pageX - startMouseX)
            if (height > this.minHeight) {
              element.style.height = height + 'px'
            }
            if (width > this.minWidth) {
              element.style.width = width + 'px'
              element.style.left = startX + (e.pageX - startMouseX) - parentViewportOffset.left + 'px'
            }
          }
          // RESIZE TOP RIGHT
          else if (currentResizer.classList.contains('top-right')) {
            const width = startWidth + (e.pageX - startMouseX)
            const height = startHeight - (e.pageY - startMouseY)
            if (width > this.minWidth) {
              element.style.width = width + 'px'
            }
            if (height > this.minHeight) {
              element.style.height = height + 'px'
              element.style.top = startY + (e.pageY - startMouseY) - parentViewportOffset.top + 'px'
            }
          }
          // RESIZE TOP LEFT
          else {
            const width = startWidth - (e.pageX - startMouseX)
            const height = startHeight - (e.pageY - startMouseY)
            if (width > this.minWidth) {
              element.style.width = width + 'px'
              element.style.left = startX + (e.pageX - startMouseX) - parentViewportOffset.left + 'px'
            }
            if (height > this.minHeight) {
              element.style.height = height + 'px'
              element.style.top = startY + (e.pageY - startMouseY) - parentViewportOffset.top + 'px'
            }
          }
        }
        
        const stopResize = () => {
          window.removeEventListener('mousemove', resize)
        }
      }
    }
  },
  mounted() {
    const parentElementRef = this.$refs['drag-parent']
    this.parentViewportOffset = {x: parentElementRef.offsetLeft, y: parentElementRef.offsetTop}

    this.tiles.forEach((tile, tileIndex) => {
      this.makeDivResizable(`.tile-${tileIndex}`)
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

    // at runtime, we also have one watcher for dynamic
    if (!this.active) {
      this.dragEnabledDyn = false
      this.resizeEnabledDyn = false
    }

    if (this.readOnly) {
      this.dragEnabledDyn = false
      this.resizeEnabledDyn = false
    }
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

.content {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.enableBorder {
  outline: 2px dashed #FF4500;
}

.tileSelected {
  outline-color: yellow !important;
}

.tileSelectedHandle {
  border-color: yellow !important;
}

.readOnlyOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,0,0,.25);
}

</style>
