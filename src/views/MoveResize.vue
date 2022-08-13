<template>
  <div
  class="MoveResize"
  @mouseleave="stopDragWhenMouseOutsideFunc"
  ref="drag-parent">
  
    <div
    v-for="(tile, ti) in posData" :key="ti"
    :class="['resizable', `tile-${ti}`]"
    @mousedown="startDrag($event, ti)"
    :style="[
      {top: `${getDefaultPos(posData[ti].y)}px`},
      {left: `${getDefaultPos(posData[ti].x)}px`},
      {width: `${posData[ti].w}px`},
      {height: `${posData[ti].h}px`},
      {zIndex: curSelTileIndex == ti? 1000 : 1}
    ]"
    :ref="`drag-${ti}`">
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
      <!-- <div class="caption"></div> -->
      <slot class="content"></slot>
    </div>

  </div>
</template>

<script>
export default {
  name: 'MoveResize',
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
      posData: [
        {x: 0, y: 0, w: 100, h: 100},
        {x: 100, y: 100, w: 150, h: 100}
      ],
      // props
      grid: [1, 1], // [px, px]
      allowClickThrough: true,
      dragEnabled: true,
      resizeEnabled: true,
      preventLeavingParent: true,
      stopDragWhenMouseOutside: true,
      allowDragBelowBottom: false
    }
  },
  components: {

  },
  methods: {
    getDefaultPos(pos) {
      // fixes position when X or Y greater than 0
      // replace 50 with offset of parent!!!
      // const maxChildPosFromTop = parentHeight - elementHeight

      if (pos > 0) return (pos - 50) < 0 ? 0 : pos - 50 

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
      // console.warn(e, index)
      e.preventDefault()
      this.positions.movementX = this.positions.clientX - e.clientX
      this.positions.movementY = this.positions.clientY - e.clientY
      this.positions.clientX = e.clientX
      this.positions.clientY = e.clientY
      // set the element's new position:
      const newTop = (this.$refs[`drag-${this.curSelTileIndex}`].offsetTop - this.positions.movementY)
      const newLeft = (this.$refs[`drag-${this.curSelTileIndex}`].offsetLeft - this.positions.movementX)
      
      // drag element refs
      const elementRef = this.$refs[`drag-${this.curSelTileIndex}`]
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
    stopDrag(e) {
      const lastPosAndSize = e.target.getBoundingClientRect()
      console.log(lastPosAndSize)
      
      this.posData[this.curSelTileIndex] = {
        x: lastPosAndSize.x,
        y: lastPosAndSize.y,
        w: lastPosAndSize.width,
        h: lastPosAndSize.height
      }

      document.onmouseup = null
      document.onmousemove = null
    },
    stopDragWhenMouseOutsideFunc() {
      if (this.stopDragWhenMouseOutside) {
        document.onmouseup = null
        document.onmousemove = null
      }
    }
  },
  mounted() {
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
              element.style.width = width + 'px'
            }
            if (height > minSize) {
              element.style.height = height + 'px'
            }
          }
          // RESIZE BOTTOM LEFT
          else if (currentResizer.classList.contains('bottom-left')) {
            const height = startHeight + (e.pageY - startMouseY)
            const width = startWidth - (e.pageX - startMouseX)
            if (height > minSize) {
              element.style.height = height + 'px'
            }
            if (width > minSize) {
              element.style.width = width + 'px'
              element.style.left = startX + (e.pageX - startMouseX) - parentViewportOffset.left + 'px'
            }
          }
          // RESIZE TOP RIGHT
          else if (currentResizer.classList.contains('top-right')) {
            const width = startWidth + (e.pageX - startMouseX)
            const height = startHeight - (e.pageY - startMouseY)
            if (width > minSize) {
              element.style.width = width + 'px'
            }
            if (height > minSize) {
              element.style.height = height + 'px'
              element.style.top = startY + (e.pageY - startMouseY) - parentViewportOffset.top + 'px'
            }
          }
          // RESIZE TOP LEFT
          else {
            const width = startWidth - (e.pageX - startMouseX)
            const height = startHeight - (e.pageY - startMouseY)
            if (width > minSize) {
              element.style.width = width + 'px'
              element.style.left = startX + (e.pageX - startMouseX) - parentViewportOffset.left + 'px'
            }
            if (height > minSize) {
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

    this.posData.forEach((tile, tileIndex) => {
      makeDivResizable(`.tile-${tileIndex}`)
    })
  },
  created() {
   
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

.resizable .resizers{
  width: 100%;
  height: 100%;
  border: 3px solid #FF4500;
  box-sizing: border-box;
}

.resizable .resizers .resizer{
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: seagreen;
}

</style>
