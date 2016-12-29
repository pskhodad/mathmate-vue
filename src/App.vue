<template>
  <div id="app" class="page">
<!--
    <img src="./assets/logo.png">
    <hello></hello>
-->

  <div class="navbar">
    <h2>MathMate</h2>
  </div>
  <div id="content" class="page-content">

    <div class="card" v-for="item in items" :key="item.id">
      <div class="card-content">
        <p>{{ item.qtxt }}</p>
      </div>
      <button v-on:click="onSimilar(item.id)" class="mdl-button mdl-button--raised mdl-button--colored">
        Similar
      </button>
      <button v-on:click="onAns(item.id)" class="mdl-button mdl-button--raised mdl-button--colored">
        Answer
      </button>
      <transition name="fade">
        <p v-if="item.show">{{ item.ans }}</p>
      </transition>
    </div>
  </div>  

  </div>
</template>

<script>
import Hello from './components/Hello'
var _ = require('lodash')
var Chance = require('chance')
var chance = new Chance()

console.log(_.throttle)

export default {
  name: 'app',
  components: {
    Hello
  },
  methods: {
    onAns: function (id) {
      console.log(id)
      var tmpItem = this.items[id]
      this.items.splice(id, 1, {id: tmpItem.id, qtxt: tmpItem.qtxt, ans: tmpItem.ans, show: !tmpItem.show})
    },
    onSimilar: function (id) {
      var tmpItem = this.items[id]
      this.items.splice(id, 1, {id: tmpItem.id, qtxt: chance.sentence(), ans: chance.natural({min: 1, max: 10000}), show: false})
    }
  },
  mounted () {
    console.log('mounted')
    var onScroll = () => {
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop + window.innerHeight >= document.body.clientHeight) {
        console.log('scrolling 2')
        var startIdx = this.items.length
        for (var i = startIdx; i < (startIdx + 5); ++i) {
          this.items.push({ id: i, qtxt: chance.sentence(), ans: chance.natural({min: 1, max: 10000}), show: false })
        }
      }
    }
    document.getElementById('content').addEventListener('scroll', _.throttle(onScroll, 500))
  },
  data () {
    return {
      show: false,
      items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((elem) => {
        return {
          id: elem,
          qtxt: chance.sentence(),
          ans: chance.natural({min: 1, max: 10000}),
          show: false
        }
      })
    }
  }
}
</script>

<style>
/*  
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
*/
.card {
  /*
  margin: 10px !default;
  border-radius: 2px !default;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12) !default;
  */
  margin: 10px;
  font-size: 20px;
  background-color: #fff;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
  padding: 5px;
}

.md-button {
  box-shadow: none;
  margin: .4rem .2rem;
  padding: 0 1.1em;
  height: 3.6rem;
  border-radius: 2px;
  color: #3873f5;
  text-transform: uppercase;
  font-weight: 500;
  background-color: transparent;
  font-size: 1.4rem;
  border-style: solid;
  border-color: #387ef5;
}

.md-button.activated {
  border-style: solid;
  border-color: #387ef5;
  background-color: transparent;
  box-shadow: none;
  opacity: 1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}

.page {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /*
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  */
}
.page-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: auto;
  height: auto;

  padding-top: 64px;
}
.navbar {
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 64px;
  z-index: 10;
  background-color: #387ef5;
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  text-align: center;
}

</style>
