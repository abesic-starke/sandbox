<template>
  <div
  class="Table"
  id="Table"
  @mouseup="contentRowsAreBeingScrolled = false"
  @mouseenter="mouseoverScrollbarThumb = true"
  @mouseleave="mouseoverScrollbarThumb = false">

    <!-- HEADER LETTERS, INPUT, STYLE TOOLBAR -->
    <div id="top">
      <!-- TOP LEFT CORNER EMPTY SQUARE -->
      <div id="emptySquare"></div>

      <!-- LETTERS -->
      <ul id="headerLettersList">
        <li
          class="headerLetter"
          v-for="(column, i) in data.rows[0]"
          :key="i">
            <span>{{ alphabet[i] }}</span>
        </li>
      </ul>
    </div>

    <!--
      NUMBER LIST, (OVERFLOW)
      CONTENT ROWS, (OVERFLOW)
      BUTTONS (for adding, removing)
    -->
    <div id="bottom">
      <ul id="sideNumberList">
        <li
          class="sideNumber"
          v-for="(column, i) in data.rows"
          :key="i">
            <!-- ROW NUMBER DISPLAY -->
            <span>{{ i+1 }}</span>
        </li>
      </ul>

      <ul id="contentRows">
        <li
          class="row"
          v-for="(row, rowIndex) in data.rows"
          :key="rowIndex">
            
            <ul class="columns">
              <li
                class="column"
                v-for="(column, columnIndex) in row"
                :key="columnIndex">
                  <!-- ROW NUMBER DISPLAY -->
                  <input
                    v-model="row[columnIndex]">
              </li>
            </ul>
          
        </li>
      </ul>

      <div id="buttons"></div>
    </div>

    <!--
      ARTIFICIAL SCROLLBAR (handles contentRow + letterHeader scroll)
      a normal scrollbar always goes to bottom of scroll so I had to
      do it this way
    -->
    <div
    id="artificialScrollbar"
    :class="{hideArtificialScrollbar: !artificialScrollbarShown}">
      <div
        id="artificalScrollbarThumb"
        :style="{left: `${scrollbarThumbLeft}px`}"
        @mousedown="setScrollbarPosition"
      />
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      alphabet: [
        'A', 'B', 'C', 'D', 'E', 'F', 
        'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N','O', 'P', 'Q', 'R', 
        'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z'
      ],
      data: {
        rows: [
          ['hello', null, 'hello', 'hello'],
          ['hello', null, 'hello', 'hello2'],
          ['hello', null, 'hello', 'hello3'],
          ['hello', null, 'hello', 'hello4'],
          ['hello', null, 'hello', 'hello5'],
          ['hello', null, 'hello', 'hello6'],
          ['hello', null, 'hello', 'hello7']
        ],
        rowWidths: [50, 120, 90, 100],
        columnsHeight: [40, 40, 40, 40],
        styles: [

        ]
      },
      // these two have to be the same
      lettersAndNumberSize: 40,
      lettersAndNumberSizePx: '40px',
      // ALL UNDER IS FOR CROSSBAR POSITION AND WIDTH
      scrollbarThumbLeft: 0,
      scrollbarDragStartPosLeft: 0,
      contentRowsAreBeingScrolled: false,
      contentRowsScrollPositionUpdateInterval: null,
      mousePos: {
        x: 0,
        y: 0
      },
      mouseoverScrollbarThumb: false,
      artificialScrollbarShown: false,
      scrollbarEmptySpace: 0,
      // from middle of scrollbar
      scrollbarClickedOffsetFromMiddle: 0
    }
  },
  watch: {
    // for scrollbar position and width
    mouseoverScrollbarThumb(bool) {
      if (!bool) this.contentRowsAreBeingScrolled = false
    },
    contentRowsAreBeingScrolled(bool) {
      if (!bool) {
        clearInterval(this.contentRowsScrollPositionUpdateInterval)
      }
    }
  },
  methods: {
    // for scrollbar position and width
    setScrollbarPosition() {
      this.contentRowsAreBeingScrolled = true

      this.contentRowsScrollPositionUpdateInterval = setInterval(() => {
        const scrollbarThumbEl = document.getElementById('artificalScrollbarThumb')

        const tableEl = document.getElementById('Table').getBoundingClientRect()
        const tableOffsetLeft = tableEl.left
        // console.log(tableOffsetLeft)

        // initially set start position of scrollbar, on mousedown
        if (!this.scrollbarDragStartPosLeft) {
          this.scrollbarDragStartPosLeft = scrollbarThumbEl.offsetLeft + this.mousePos.x
        }

        // console.log(this.mousePos.x)

        // set scrollbar controller position on mousemove
        const scrollbarThumbWidth = scrollbarThumbEl.getBoundingClientRect().width
        const scrollbarLeftOffset = this.mousePos.x - tableOffsetLeft - ((scrollbarThumbWidth / 2) * 1.5)
        
        // This makes scrollbar stay in place on click and not jump
        // const scrollbarClickedOffsetFromMiddle =
        //   this.mousePos.x - this.lettersAndNumberSize - tableOffsetLeft - this.scrollbarDragStartPosLeft - (scrollbarThumbWidth / 2)
        // console.log(this.mousePos.x, this.lettersAndNumberSize, tableOffsetLeft, scrollbarLeftOffset, (scrollbarThumbWidth / 2))

          // console.log(scrollbarClickedOffsetFromMiddle)

        this.scrollbarThumbLeft = scrollbarLeftOffset

        // console.log(this.scrollbarThumbLeft)
        if (this.scrollbarThumbLeft < 1) this.scrollbarThumbLeft = 0
        if (this.scrollbarThumbLeft > this.scrollbarEmptySpace) this.scrollbarThumbLeft = this.scrollbarEmptySpace

        // sync scrollbar position for letters
        const headerLetterListEl = document.getElementById('headerLettersList')
        headerLetterListEl.scrollLeft = this.scrollbarThumbLeft

        // sync scrollbar position for numbers
        const contentRowsEl = document.getElementById('contentRows')
        contentRowsEl.scrollLeft = this.scrollbarThumbLeft
      }, 16)

    }
  },
  mounted() {
    // SET SCROLLBAR WIDTH
    setInterval(() => {
      const headerLetterListEl = document.getElementById('headerLettersList')
      const headerLetterListWidth = headerLetterListEl.scrollWidth

      const entireTableWidth = document.getElementById('Table').getBoundingClientRect().width
      const rowsContentWidth = entireTableWidth - this.lettersAndNumberSize
      
      this.scrollbarEmptySpace = headerLetterListWidth - rowsContentWidth

      const scrollbarWidth = rowsContentWidth - (headerLetterListWidth - rowsContentWidth)
      // set artificial scrollbar thumb width
      document.getElementById('artificalScrollbarThumb').style.width = scrollbarWidth + 'px'

      if (scrollbarWidth >= rowsContentWidth) this.artificialScrollbarShown = false
      else this.artificialScrollbarShown = true
    }, 16)

    // save mouse position
    const handleMouseMove = (e) => {
      this.mousePos = {
        x: e.clientX,
        y: e.clientY
      }
    }

    document.onmousemove = handleMouseMove
  }
}
</script>

<style lang="scss" scoped>

.Table {
  position: relative;
  width: 100%;
  height: 100%;
  user-select: none;
}

ul {
  list-style: none;
}

$lettersAndNumberSize: v-bind(lettersAndNumberSizePx);
$defaultLetterWidth: 70px;
#top {
  width: 100%;
  height: $lettersAndNumberSize;
  background-color: brown;
  @include centerFlex;
  #emptySquare {
    width: $lettersAndNumberSize !important;
    height: 100%;
    background-color: #121212;
  }
  #headerLettersList {
    height: 100%;
    width: calc(100% - #{$lettersAndNumberSize});
    @include centerFlexY;
    overflow-x: overlay;
    .headerLetter {
      height: 100%;
      min-width: $defaultLetterWidth;
      width: $defaultLetterWidth;
      outline: 1px solid black;
      @include centerFlex;
    }
  }
}

#bottom {
  position: relative;
  background-color: darkgrey;
  width: 100%;
  height: calc(100% - #{$lettersAndNumberSize});
  overflow-y: overlay;
  #sideNumberList {
    float: left;
    position: relative;
    width: $lettersAndNumberSize;
    height: 100%;
    .sideNumber {
      width: 100%;
      height: $lettersAndNumberSize;
      outline: 1px solid black;
      @include centerFlex;
      flex-direction: column;
    }
  }

  #contentRows {
    margin-left: auto;
    position: relative;
    width: calc(100% - $lettersAndNumberSize);
    height: auto;
    overflow-x: overlay;
    .row {
      position: relative;
      width: 100%;
      height: $lettersAndNumberSize;
      .columns {
        position: relative;
        width: 100%;
        min-height: $lettersAndNumberSize;
        height: $lettersAndNumberSize;
        @include centerFlexY;
        .column {
          min-width: 0;
          position: relative;
          width: $defaultLetterWidth;
          min-width: $defaultLetterWidth;
          height: $lettersAndNumberSize;
          outline: 1px solid black;
          input {
            width: 100%;
            height: 100%;
            outline: none;
            border: none;
            background-color: transparent;
          }
        }
      }
    }
  }
}

#artificialScrollbar {
  position: absolute;
  bottom: 0;
  left: $lettersAndNumberSize;
  width: calc(100% - #{$lettersAndNumberSize});
  height: 10px;
  background-color: #121212;
  overflow: hidden;
  #artificalScrollbarThumb {
    position: absolute;
    left: 0;
    height: 100%;
    border-radius: 4px;
    background-color: grey;
    width: 50px;
  }
}

.hideArtificialScrollbar {
  height: 0 !important;
}

// hide scrollbars
#headerLettersList, #contentRows {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
  &::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
  }
}

</style>