<template>
  <div class="Table" id="Table">

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
      BUTTONS
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

    <div id="artificialScrollbar">
      <div id="artificalScrollbarThumb"></div>
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
          ['hello', null, 'hello', 'hello7'],
          ['hello', null, 'hello', 'hello'],
          ['hello', null, 'hello', 'hello2'],
          ['hello', null, 'hello', 'hello3'],
          ['hello', null, 'hello', 'hello4'],
          ['hello', null, 'hello', 'hello5'],
          ['hello', null, 'hello', 'hello6'],
          ['hello', null, 'hello', 'hello7'],
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
      lettersAndNumberSizePx: '40px'
    }
  },
  mounted() {
    // setInterval(() => {
      const headerLetterListEl = document.getElementById('headerLettersList')
      const headerLetterListWidth = headerLetterListEl.scrollWidth

      const entireTableWidth = document.getElementById('Table').getBoundingClientRect().width
      const rowsContentWidth = entireTableWidth - this.lettersAndNumberSize

      // const headerLetterListScrollbarWidth = rowsContentWidth

      console.log(rowsContentWidth)

      // const 

      // console.log(headerLetterListEl.scrollWidth)
    // }, 1000)

    setInterval(() => {
      const contentScrollbar = document.querySelector("#contentRows")
      const header = document.querySelector("#headerLettersList")

      contentScrollbar.addEventListener("scroll", e => {
        header.scrollLeft = contentScrollbar.scrollLeft
      }, { passive: true })
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>

.Table {
  position: relative;
  width: 100%;
  height: 100%;
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
    &::-webkit-scrollbar { 
      display: none;  /* Safari and Chrome */
    }
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
  height: 5px;
  // background-color: red;
  #artificalScrollbarThumb {
    height: 5px;
    // background-color: seagreen;
    width: 50px;
  }
}

</style>