var mathmateTemplates = require('mathmate-templates')
var Chance = require('chance')
var chance = new Chance()
var katex = require('katex')

var delimiters = [
    { left: '$$', right: '$$', display: true }
    // { left: "\\[", right: "\\]", display: true },
    // { left: "\\(", right: "\\)", display: false },
    // LaTeX uses this, but it ruins the display of normal `$` in text:
    // {left: "$", right: "$", display: false},
]

function findEndOfMath (delimiter, text, startIndex) {
  // Adapted from
  // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
  var index = startIndex
  var braceLevel = 0

  var delimLength = delimiter.length

  while (index < text.length) {
    var character = text[index]

    if (braceLevel <= 0 &&
      text.slice(index, index + delimLength) === delimiter) {
      return index
    } else if (character === '\\') {
      index++
    } else if (character === '{') {
      braceLevel++
    } else if (character === '}') {
      braceLevel--
    }

    index++
  }

  return -1
}

function splitAtDelimiters (startData, leftDelim, rightDelim, display) {
  var finalData = []

  for (var i = 0; i < startData.length; i++) {
    if (startData[i].type === 'text') {
      var text = startData[i].data

      var lookingForLeft = true
      var currIndex = 0
      var nextIndex

      nextIndex = text.indexOf(leftDelim)
      if (nextIndex !== -1) {
        currIndex = nextIndex
        finalData.push({
          type: 'text',
          data: text.slice(0, currIndex)
        })
        lookingForLeft = false
      }

      while (true) {
        if (lookingForLeft) {
          nextIndex = text.indexOf(leftDelim, currIndex)
          if (nextIndex === -1) {
            break
          }

          finalData.push({
            type: 'text',
            data: text.slice(currIndex, nextIndex)
          })

          currIndex = nextIndex
        } else {
          nextIndex = findEndOfMath(
            rightDelim,
            text,
            currIndex + leftDelim.length)
          if (nextIndex === -1) {
            break
          }

          finalData.push({
            type: 'math',
            data: text.slice(
              currIndex + leftDelim.length,
              nextIndex),
            rawData: text.slice(
              currIndex,
              nextIndex + rightDelim.length),
            display: display
          })

          currIndex = nextIndex + rightDelim.length
        }

        lookingForLeft = !lookingForLeft
      }

      finalData.push({
        type: 'text',
        data: text.slice(currIndex)
      })
    } else {
      finalData.push(startData[i])
    }
  }

  return finalData
}

function splitWithDelimiters (text, delimiters) {
  var data = [{ type: 'text', data: text }]

  for (var i = 0; i < delimiters.length; i++) {
    var delimiter = delimiters[i]
    data = splitAtDelimiters(
      data, delimiter.left, delimiter.right,
      delimiter.display || false)
  }
  return data
}

function tex2katex (inTex) {
  if (typeof inTex === 'number') {
    inTex = inTex.toString()
  }
  let tokens = splitWithDelimiters(inTex, delimiters)
  return tokens.reduce((prevVal, currVal) => {
    if (currVal.type === 'text') {
      return prevVal + '<span>' + currVal.data + '</span>'
    } else {
      return prevVal + katex.renderToString(currVal.data)
    }
  }, '')
}

function portListener(port, methods) {
  port.addEventListener('message', event => {
    const {portCallerMessageId, method, args} = event.data;

    if (!method) return;

    // just a "send"
    if (!portCallerMessageId) {
      methods[method](...args);
      return;
    }

    const source = event.source || port;

    // It wants a response too
    /*
    new Promise(resolve => resolve(methods[method](...args))).then(value => {
      source.postMessage({
        portCallerResponseId: portCallerMessageId,
        value
      });
    }, err => {
      source.postMessage({
        portCallerResponseId: portCallerMessageId,
        error: err.message
      });
    });
    */
    var ret = methods[method](...args);
    source.postMessage({
      portCallerResponseId: portCallerMessageId,
      ret: ret
    });

  });

  if (port.start) port.start();
}

function simQuestion (tplname) {
  console.log(mathmateTemplates)
  console.log(tplname)
  let q = new mathmateTemplates[tplname]();
  return {
    name: tplname,
    qtxt: q.qtxt,
    cans: (typeof q.cans) === 'object' ? q.cans_fmt : q.cans,
    qhtml: tex2katex(q.qtxt),
    ahtml: tex2katex((typeof q.cans) === 'object' ? q.cans_fmt : q.cans)
  }
}

function genQuestions (num) {
  return {
    qlist : chance
              .pickset(Object.keys(mathmateTemplates), num)
              .map((tplname) => {
                return simQuestion(tplname)
              })
  }
}

/*
portListener(self, {
  simQuestion,
  genQuestions
})
*/
/*
self.addEventListener('message', function (event) {
  // var r = Math.random();
  //console.log(event.data.portCallerMessageId);
  //console.log(r);
  (self as any).postMessage({
    portCallerResponseId: event.data.portCallerMessageId,
    value: {
      qlist: chance.pickset(Object.keys(mathmate_templates), 3).map((tplname) => {
          let q = new mathmate_templates[tplname]();
          return {
              name: tplname,
              qtxt: q.qtxt,
              qhtml: tex2katex(q.qtxt),
              cans: (typeof q.cans) === 'object' ? q.cans_fmt : q.cans  
          };
      })
    }
  });
});
*/

var registerPromiseWorker = require('promise-worker/register')

registerPromiseWorker((message) => {
  if (message.method === 'genQuestions') {
    return genQuestions(...message.args)
  } else if (message.method === 'simQuestion') {
    return simQuestion(...message.args)
  } else {
    return 'message'
  }
  /*
  if (message.method === 'genQuestions') {
    return {
      value: {
        qlist: chance.pickset(Object.keys(mathmate_templates), 3).map((tplname) => {
          let q = new mathmate_templates[tplname]();
          return {
            name: tplname,
            qtxt: q.qtxt,
            qhtml: tex2katex(q.qtxt),
            cans: (typeof q.cans) === 'object' ? q.cans_fmt : q.cans
          };
        })
      }
    }
  } else if (message.method === 'simQuestion') {
    console.log('Not ready yet')
    return 'Not ready yet'
  }
  */
})