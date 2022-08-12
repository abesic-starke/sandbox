<template>
  <div
  class="MoveResize"
  @mouseleave="stopDragWhenMouseOutsideFunc"
  ref="drag-parent">

    <div
    class='resizable'
    @mousedown="startDrag($event, 'dragref')"
    ref="drag">
      <div
      class='resizers'
      >
        <div
          v-if="resizeEnabled"
          class='resizer top-left'
          @mousedown="resizeHandleDown = true"
          @mouseup="resizeHandleDown = false">
        </div>
        <div
          v-if="resizeEnabled"
          class='resizer top-right'
          @mousedown="resizeHandleDown = true"
          @mouseup="resizeHandleDown = false">
        </div>
        <div
          v-if="resizeEnabled"
          class='resizer bottom-left'
          @mousedown="resizeHandleDown = true"
          @mouseup="resizeHandleDown = false">
        </div>
        <div
          v-if="resizeEnabled"
          class='resizer bottom-right'
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
      // temp
      resizeHandleDown: false,
      // data
      positions: {
        clientX: undefined,
        clientY: undefined,
        movementX: 0,
        movementY: 0
      },
      // props
      grid: [1, 1], // [px, px]
      allowClickThrough: true,
      dragEnabled: true,
      resizeEnabled: true,
      preventLeavingParent: true,
      stopDragWhenMouseOutside: false,
    }
  },
  components: {

  },
  methods: {
    startDrag(e) {
      // Check if dragging is enabled
      if (!this.dragEnabled) return
      // Check if user isn't currently resizing
      if (this.resizeHandleDown) return

      e.preventDefault()
      // get the mouse cursor position at startup:
      this.positions.clientX = e.clientX
      this.positions.clientY = e.clientY
      document.onmousemove = this.elementDrag
      document.onmouseup = this.stopDrag
    },
    elementDrag: function (e) {
      // console.log(e)
      e.preventDefault()
      this.positions.movementX = this.positions.clientX - e.clientX
      this.positions.movementY = this.positions.clientY - e.clientY
      this.positions.clientX = e.clientX
      this.positions.clientY = e.clientY
      // set the element's new position:
      const newTop = (this.$refs['drag'].offsetTop - this.positions.movementY)
      const newLeft = (this.$refs['drag'].offsetLeft - this.positions.movementX)
      
      // drag element refs
      const elementRef = this.$refs['drag']
      const elementWidth = elementRef.offsetWidth
      const elementHeight = elementRef.offsetHeight

      // parent refs
      const parentElementRef = elementRef.parentElement
      const parentWidth = parentElementRef.offsetWidth
      const parentHeight = parentElementRef.offsetHeight
      // console.warn(parentWidth, parentHeight)

      elementRef.style.top = newTop + 'px'
      elementRef.style.left = newLeft + 'px'

      if (this.preventLeavingParent) {
        // prevent leaving top
        if (newTop < 0) elementRef.style.top = 0
        // prevent leaving left
        if (newLeft < 0) elementRef.style.left = 0
        // prevent leaving bottom
        const maxChildPosFromTop = parentHeight - elementHeight
        if (newTop > maxChildPosFromTop) {
          elementRef.style.top = maxChildPosFromTop + 'px'
        }
        const maxChildPosFromLeft = parentWidth - elementWidth
        if (newLeft > maxChildPosFromLeft) {
          elementRef.style.left = maxChildPosFromLeft + 'px'
        }
      }
    
      // console.log('top', newTop)
      // console.log('left', newLeft)
    },
    stopDrag () {
      document.onmouseup = null
      document.onmousemove = null
    },
    stopDragWhenMouseOutsideFunc () {
      if (this.stopDragWhenMouseOutside) {
        document.onmouseup = null
        document.onmousemove = null
      }
    }
  },
  mounted() {
    const makeResizableDiv = (div) => {
      const element = document.querySelector(div)
      const resizers = document.querySelectorAll(div + ' .resizer')
      const minimum_size = 20
      let original_width = 0
      let original_height = 0
      let original_x = 0
      let original_y = 0
      let original_mouse_x = 0
      let original_mouse_y = 0

      for (let i = 0; i < resizers.length; i++) {
        const currentResizer = resizers[i]
        currentResizer.addEventListener('mousedown', function(e) {
          e.preventDefault()
          original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
          original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
          original_x = element.getBoundingClientRect().left;
          original_y = element.getBoundingClientRect().top;
          original_mouse_x = e.pageX;
          original_mouse_y = e.pageY;
          window.addEventListener('mousemove', resize)
          window.addEventListener('mouseup', stopResize)
        })
        
        const resize = (e) =>  {
          // these are relative to the viewport, i.e. the window
          const parentViewportOffset = this.$refs['drag-parent'].getBoundingClientRect()
          console.warn(parentViewportOffset.top, parentViewportOffset.left)
          
          if (currentResizer.classList.contains('bottom-right')) {
            const width = original_width + (e.pageX - original_mouse_x);
            const height = original_height + (e.pageY - original_mouse_y)
            if (width > minimum_size) {
              element.style.width = width + 'px'
            }
            if (height > minimum_size) {
              element.style.height = height + 'px'
            }
          }
          else if (currentResizer.classList.contains('bottom-left')) {
            const height = original_height + (e.pageY - original_mouse_y)
            const width = original_width - (e.pageX - original_mouse_x)
            if (height > minimum_size) {
              element.style.height = height + 'px'
            }
            if (width > minimum_size) {
              element.style.width = width + 'px'
              element.style.left = original_x + (e.pageX - original_mouse_x) - parentViewportOffset.left + 'px'
            }
          }
          else if (currentResizer.classList.contains('top-right')) {
            const width = original_width + (e.pageX - original_mouse_x)
            const height = original_height - (e.pageY - original_mouse_y)
            if (width > minimum_size) {
              element.style.width = width + 'px'
            }
            if (height > minimum_size) {
              element.style.height = height + 'px'
              element.style.top = original_y + (e.pageY - original_mouse_y) - parentViewportOffset.top + 'px'
            }
          }
          // top left
          else {
            const width = original_width - (e.pageX - original_mouse_x)
            const height = original_height - (e.pageY - original_mouse_y)
            if (width > minimum_size) {
              element.style.width = width + 'px'
              // 50 was test, REPLACE 50 with parent pixels away from 0, 0 of window...
              element.style.left = original_x + (e.pageX - original_mouse_x) - parentViewportOffset.left + 'px'
            }
            if (height > minimum_size) {
              element.style.height = height + 'px'
              element.style.top = original_y + (e.pageY - original_mouse_y) - parentViewportOffset.top + 'px'
            }
          }
        }
        
        function stopResize() {
          window.removeEventListener('mousemove', resize)
        }
      }
    }

    makeResizableDiv('.resizable')
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
  top: 100px;
  left: 100px;
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

</style>
