<template>
  <div
  class="Sections"
  @mouseup="dragEnded"
  @mousemove="setGlobalLinePos">

    <!-- !!! IMPORTANT INFO !!! -->
    <!--
      DIVs/Components that are inserted into the slots here
      need to have width, height set to 100%
      and possibly position: relative (requires testing)
    -->

    <!-- EXPAND COLUMNS IF EITHER FIRST OR BOTH HIDDEN -->
    <div
    class="expandBtnsCon"
    v-if="showExpandBtns && unexpandedCols.includes(0)">
      <!-- EXPAND FIRST COLUMNS -->
      <div
      v-if="unexpandedCols.includes(0)"
      class="expandColBtn"
      @click="expandCol(0)">
        <img
          class="chevron"
          src="../assets/svg/chevron-right.svg">
      </div>
      <!-- EXPAND SECOND COLUMN -->
      <div
      v-if="unexpandedCols.includes(1)"
      class="expandColBtn"
      @click="expandCol(1)">
        <img
          class="chevron"
          src="../assets/svg/chevron-right.svg">
      </div>
    </div>

    <!-- GLOBAL MOVABLE LINE -->
    <!--
      This is the line that we drag around to resize.
      It's only for the visuals.
    -->
    <div
      class="globalMovableLine"
      :style="{left: `${globalLinePosX}%`}">
    </div>

    <!-- RESIZABLE COLUMNS (3) -->
    <!-- 
      Functions: resize, unexpand (hide), expand
    -->
    <div
    v-for="num in colsAmount"
    :key="num"
    :class="['col', `col-${num}`]"
    :id="`col-${num}`"
    :style="{width: `${colsWidth[num-1]}%`}"
    @mouseover="showColLines[num-1] = true"
    @mouseleave="showColLines[num-1] = false">
      <!-- RESIZE LINE -->
      <div
      v-show="num != 3 && dragging == null && showColLines[num-1]"
      :class="['resizeLine', {widenResizeLine: widenColLines[num-1]}]"
      @mousedown="mousedownTriggered(num-1)">
        <!-- RESIZE CIRCLE -->
        <div
          v-show="widenColLines[num-1]"
          class="resizeCircle"
          :style="{top: `${50}%`}"
          @mouseover="toggleFirstColUnexpandCircleHovered(num-1)"
          @mouseleave="toggleFirstColUnexpandCircleHovered(num-1)">
            <img class="chevron" src="../assets/svg/chevron-left.svg">
        </div>

        <!-- RESIZE CIRCLE FOR SECOND COLUMNS (if first is expanded) -->
        <div
          v-show="getSecondExpandBtnShown(num-1)"
          class="resizeCircle"
          :style="{top: `${5}%`}"
          @click="expandCol(1)">
            <img class="chevron" src="../assets/svg/chevron-right.svg">
        </div>
      </div>
      <!-- SLOT -->
      <slot :name="`col-${num}`"></slot>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    // px
    minWidth: {
      type: Number,
      default: 250
    },
    // locked to minWidth
    firstColumnLocked: false,
    secondColumnLocked: false
  },
  data() {
    return {
      colsAmount: 3,
      dragging: null, // col index
      getMouseDataInterval: null,
      mousePos: {
        x: 0,
        y: 0
      },
      colsWidth: [25, 25, 50],
      showColLines: [false, false, false],
      widenColLines: [false, false, false],
      globalLinePosX: -10,
      // used to find out if mouse is close to a drag line
      // if so it makes it wider and easier to click!
      // maybe like (25px range from it)
      mouseAtCurPerc: 0,
      resizeCirclePosY: -10,
      clickDetectDur: 100, // ms
      intervalForDetectingClick: null,
      unexpandedCols: [],
      showExpandBtns: false,
      firstColUnexpandCircleHovered: false
    }
  },
  methods: {
    toggleFirstColUnexpandCircleHovered(colIndex, isOver) {
      if (colIndex == 0) {
        if (isOver) this.firstColUnexpandCircleHovered = true
        else this.firstColUnexpandCircleHovered = false
      }
    },
    getSecondExpandBtnShown(colIndex) {
      if (
        colIndex == 0 &&
        this.widenColLines[colIndex] &&
        this.unexpandedCols.includes(1)
      ) return true
            
      return false      
    },
    expandCol(index) {
      
      // EXPAND FIRST COLUMN
      if (index == 0) {
        // sets first column to minWidth as percentage instead of pixels
        const firstColWidth = this.translatePxToPercX(this.minWidth) 

        // if second column is also hidden
        if (this.unexpandedCols.includes(1)) {
          this.colsWidth[0] = firstColWidth
          this.colsWidth[2] = 100 - firstColWidth
        }

        // if second column is not hidden
        else {
          this.colsWidth[0] = firstColWidth

          // each gets half of width of now shown first column
          this.colsWidth[1] = this.colsWidth[1] - firstColWidth / 2
          this.colsWidth[2] = this.colsWidth[2] - firstColWidth / 2
        }

        // remove index from unexpandedCols
        const arrIndex = this.unexpandedCols.indexOf(0)
        if (arrIndex != -1) this.unexpandedCols.splice(arrIndex, 1)
      }

      // EXPAND SECOND COLUMN
      if (index == 1) {
        // sets first column to minWidth as percentage instead of pixels
        const secondColWidth = this.translatePxToPercX(this.minWidth) 

        this.colsWidth[1] = secondColWidth

        // if first column is also hidden
        if (this.unexpandedCols.includes(1)) {
          this.colsWidth[2] = 100 - secondColWidth
        }

        // if first column is not hidden
        else {
          console.warn('EXPAND')
          this.colsWidth[2] -= secondColWidth
        }

        // remove index from unexpandedCols
        const arrIndex = this.unexpandedCols.indexOf(1)
        if (arrIndex != -1) this.unexpandedCols.splice(arrIndex, 1)
      }

    },
    mousedownTriggered(colIndex) {
      this.dragging = colIndex

      // detects single click on drag circle
      /*
        this currently detects click anywhere on line,
        we can set circle div: @mouseover="circleHovered = true"
        and set here if (!this.circleHovered) return
      */
      const interval = setInterval(() => {
        // if (colIndex == 0 && !this.firstColUnexpandCircleHovered) return

        if (this.dragging == null) {
          this.unexpandCol(colIndex)
        }

        clearInterval(interval)
      }, this.clickDetectDur)
    },
    unexpandCol(index) {
      console.log('UNEXPAND')
      console.log(index)

      if (index == 0) {
        if (this.unexpandedCols.includes(1)) {
          this.colsWidth[0] = 0
          this.colsWidth[1] = 0
          this.colsWidth[2] = 100
        } else {
          this.colsWidth[1] += Math.round(this.colsWidth[0] / 2)
          this.colsWidth[2] += Math.round(this.colsWidth[0] / 2)

          this.colsWidth[0] = 0
        }
      }

      if (index == 1) {
        this.colsWidth[2] += this.colsWidth[1]

        this.colsWidth[1] = 0
      }

      this.unexpandedCols.push(index)

      console.log(this.colsWidth)
    },
    dragEnded(e) {
      if (this.dragging == null) return this.dragging = null

      const interval = setInterval(() => {
        if (this.dragging != null) {
          this.unexpandCol(this.dragging)
        }

        clearInterval(interval)
      }, this.clickDetectDur)
      
      if (this.dragging == 0) {
        const mousePosPerc = this.translatePxToPercX(e.x)
        const percDiff = this.colsWidth[this.dragging] - mousePosPerc

        this.colsWidth[0] = mousePosPerc
        this.colsWidth[1] += percDiff / 2
        this.colsWidth[2] += percDiff / 2
      }

      if (this.dragging == 1) {
        const mousePosPerc = this.translatePxToPercX(e.x)
        const percDiff = mousePosPerc - this.colsWidth[0]

        this.colsWidth[1] = percDiff

        const lastColNewWidth = 100 - this.colsWidth[1] - this.colsWidth[0]
        console.log(percDiff, lastColNewWidth)
        
        this.colsWidth[2] = lastColNewWidth
      }

      console.log(this.colsWidth)

      this.dragging = null
    },
    setGlobalLinePos(e) {
      this.mouseAtCurPerc = this.translatePxToPercX(e.x)
      document.documentElement.style.cursor = "default"

      this.widenColLines = [false, false, false]

      // check if mouse is close to a drag line and make it wider
      
      for (let i = 0; i < this.colsAmount; i++) {
        if (i == 0) {
          const beforeLine = this.colsWidth[i] - 5
          const afterLine = this.colsWidth[i] + 5

          if (this.mouseAtCurPerc >= beforeLine && this.mouseAtCurPerc <= afterLine) {
            this.widenColLines[0] = true
            // works but don't need it
            // this.resizeCirclePosY = this.translatePxToPercY(e.y)
          }
        }
        
        if (i == 1) {
          const beforeLine = this.colsWidth[0] + this.colsWidth[i] - 5
          const afterLine = this.colsWidth[0] + this.colsWidth[i] + 5

          if (this.mouseAtCurPerc >= beforeLine && this.mouseAtCurPerc <= afterLine) {
            this.widenColLines[1] = true
            // this.resizeCirclePosY = this.translatePxToPercY(e.y)
          }
        }
       
      }
      
      // if not dragging, don't set global line to mouse x
      if (this.dragging == null) return this.globalLinePosX = -10

      this.globalLinePosX = this.mouseAtCurPerc
      // set cursor style to resize
      document.documentElement.style.cursor = "e-resize"
    },
    translatePxToPercX(mouseX) {
      const windowWidth = window.innerWidth

      return Math.round(mouseX / windowWidth * 100)
    },
    translatePxToPercY(mouseY) {
      const windowHeight = window.innerHeight

      return Math.round(mouseY / windowHeight * 100)
    }
  },
  mounted() {
    // show buttons for expanding columns if hidden
    // and mouse is at left edge
    onmousemove = (e) => {
      if (e.x < 25) {
        return this.showExpandBtns = true
      }

      this.showExpandBtns = false
    }
  }
}
</script>

<style lang="scss" scoped>

.Sections {
  @include centerFlex;
}

.col {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.col-1 {
  z-index: 300;
  background-color: seagreen;
}

.col-2 {
  z-index: 200;
  background-color: rgb(39, 45, 28);
}

.col-3 {
  z-index: 100;
  background-color: darkslategray;
}

.resizeLine {
  position: absolute;
  height: 100vh;
  width: 2px;
  right: -1px;
  background-color: #FF4500;
  transition: .15s;
  &:hover {
    cursor: e-resize;
  }
}

.widenResizeLine {
  width: 8px !important;
  right: -4px;
}

.resizeCircle {
  position: absolute;
  background-color: #FF4500;
  width: 30px;
  height: 30px;
  border-radius: 100%;
  right: -8px;
  transition: .15s;
  cursor: pointer;
  @include centerFlex;
  .chevron {
    height: 26px;
    width: 26px;
    margin-right: 10px;
  }
}

.globalMovableLine {
  z-index: 1000;
  position: absolute;
  background-color: #FF4500;
  top: 0;
  width: 2px;
  height: 100vh;
  &:hover {
    cursor: e-resize;
  }
}

* {
  -webkit-user-select: none; /* Safari */        
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}

.expandBtnsCon {
  z-index: 500;
  position: absolute;
  top: 10px;
  left: 0;
  .expandColBtn {
    height: 30px;
    border-radius: 100%;
    width: 30px;
    margin-left: -15px;
    background-color: grey;
    @include centerFlex;
    cursor: pointer;
    transition: .2s ease;
    &:hover {
      background-color: #FF4500;
    }
    img {
      margin-left: 10px;
    }
  }
  .expandColBtn:nth-child(2) {
    margin-top: 5px;
  }
}

</style>