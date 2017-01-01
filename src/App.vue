<template>
  <div id="app" class="page">
<!--
    <img src="./assets/logo.png">
    <hello></hello>
-->
  <div class="navbar">
    <span class="title">MathMate</span>
  </div>

<!-- Always shows a header, even in smaller screens. -->

  <div id="content" class="page-content">
    <div v-if="ok" class="loading">
        <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
        </div>
    </div>
    <div class="card" v-for="qblob in qlist" :key="qblob.id">
      <!--
      <div class="card-content" v-bind:style="{ opacity: qblob.opacity }" v-bind:class="{ opatrans: qblob.opacity }">
      -->
      <div class="card-content" v-bind:style="{ opacity: qblob.opacity }">
        <p v-html="qblob.qhtml"></p>
      </div>
      <!--
      <button v-on:click="onSimilar(qblob.id)" class="mdl-button mdl-button--raised mdl-button--colored">
        Similar
      </button>
      <button v-on:click="onAns(qblob.id)" class="mdl-button mdl-button--raised mdl-button--colored">
        Answer
      </button>
      -->
      <div class="my-button-bar">
        <button v-on:click="onSimilar(qblob.id)" class="my-button">
          <span class="icon-refresh"></span> Similar
        </button>
        <button v-on:click="onAns(qblob.id)" class="my-button">
          <span class="icon-key"></span> Answer
        </button>
      </div>
      <transition name="expand">
        <div class="my-answer" v-show="qblob.show">
          <span v-html="qblob.ahtml"></span>        
        </div>
      </transition>
    </div>
  </div>  

  </div>
</template>

<script>
import Hello from './components/Hello'
var _ = require('lodash')

var MyWorker = require('worker-loader!./worker.js')
var worker = new MyWorker()
console.log(worker)
console.log(_.throttle)

var PromiseWorker = require('promise-worker')
var promiseWorker = new PromiseWorker(worker)

import './katex/katex.min.css'
import './assets/icomoon/style.css'

export default {
  name: 'app',
  components: {
    Hello
  },
  methods: {
    onAns: function (id) {
      console.log(id)
      var tmpQblob = this.qlist[id]
      tmpQblob.show = !tmpQblob.show
      var maxHeight = tmpQblob.maxHeight
      tmpQblob.maxHeight = maxHeight ? '0px' : '500px'
      this.qlist.splice(id, 1, tmpQblob)
    },
    onSimilar: function (id) {
      if (this.simActive) {
        return
      }
      this.simActive = true
      console.log(id)
      var tmpQuestion = this.qlist[id]
      tmpQuestion.opacity = 0
      this.qlist.splice(id, 1, tmpQuestion)

      promiseWorker
        .postMessage({
          method: 'simQuestion',
          args: [this.qlist[id].name]
        })
        .then((response) => {
          setTimeout(() => {
            this.qlist.splice(id, 1, {
              id: id,
              name: response.name,
              qtxt: response.qtxt,
              qhtml: response.qhtml,
              ahtml: response.ahtml,
              show: false,
              opacity: 1,
              maxHeight: '0px'
            })
            this.simActive = false
          }, 700)
          console.log(response)
        })
    }
  },
  mounted () {
    var numQuestions = 10
    promiseWorker
      .postMessage({
        method: 'genQuestions',
        args: [numQuestions]
      })
      .then((response) => {
        var qlen = this.qlist.length
        for (var i = 0; i < numQuestions; ++i) {
          this.qlist.push({
            id: i + qlen,
            name: response.qlist[i].name,
            qhtml: response.qlist[i].qhtml,
            ahtml: response.qlist[i].ahtml,
            show: false,
            opacity: 1,
            maxHeight: '0px'
          })
        }
        this.ok = false
      })

    var onScroll = () => {
      if (this.loading) {
        return
      }
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop + window.innerHeight >= document.body.clientHeight) {
        this.loading = true
        var numQuestions = 10
        promiseWorker
          .postMessage({
            method: 'genQuestions',
            args: [numQuestions]
          })
          .then((response) => {
            this.loading = false
            var qlen = this.qlist.length
            for (var i = 0; i < numQuestions; ++i) {
              this.qlist.push({
                id: i + qlen,
                name: response.qlist[i].name,
                qhtml: response.qlist[i].qhtml,
                ahtml: response.qlist[i].ahtml,
                show: false,
                opacity: 1,
                maxHeight: '0px'
              })
            }
            this.ok = false
          })
      }
    }
    document.getElementById('content').addEventListener('scroll', _.throttle(onScroll, 1000))
  },
  data () {
    return {
      show: false,
      qlist: [],
      ok: true,
      loading: false,
      simActive: false
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
  font-size: 15px;
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

  padding-top: 44px;
}
.navbar {
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 44px;
  z-index: 10;
  background-color: #3873f5;
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  text-align: center;
  vertical-align: middle;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;  
}

.title {
  display: block;
  position: relative;
  font-family: "Roboto","Helvetica","Arial",sans-serif;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  vertical-align: middle;
}

.loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    overflow: hidden;
}
.spinner {
    width: 40px;
    height: 40px;

    position: relative;
    margin: 100px auto;
}

.double-bounce1, .double-bounce2 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #387ef5;
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;
    
    -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
    animation: sk-bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
    -webkit-animation-delay: -1.0s;
    animation-delay: -1.0s;
}

@-webkit-keyframes sk-bounce {
    0%, 100% { -webkit-transform: scale(0.0) }
    50% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bounce {
    0%, 100% { 
        transform: scale(0.0);
        -webkit-transform: scale(0.0);
    } 50% { 
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
    }
}

.card-content {
  /* opacity: 1; */
  /* overflow: hidden; */
  transition: opacity 0.3s ease-out;
}

.opatrans {
  transition: opacity 0.5s ease-out;
  transition-timing-function: cubic-bezier(0.01,1,0.85,0.98);
}

.expand-enter-active {
  transition: all 0.5s;
  /* max-height: 500px; */
}
.expand-enter, .expand-leave-active {
  opacity: 0;
  /* max-height: 0px; */
}
/*
.my-button-bar {
  display: flex;
  justify-content: flex-start;
}
*/
.my-button {
  background: transparent;
  border: none;
  border-radius: 2px;
  color: #fff;
  position: relative;
  height: 36px;
  background-color: #387ef5;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  outline: none;
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14);
}

.my-answer {
  text-align: center;
  vertical-align: middle;
  padding: 10px;
}

</style>
