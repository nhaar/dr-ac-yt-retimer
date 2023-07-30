const CHAPTERS = 2

generatePage()

function generatePage () {
  const div = getById('time-inputs')
  const headers = getById('segment-headers')
  const rtaInputs = []

  for (let i = 0; i < CHAPTERS; i++) {
    const createInput = label => {
      const html = `
        <label for="startobj"> ${label} </label>
        <input type="text" style='width:100%'/>
      `
      return createElement({ parent: div, tag: 'p', innerHTML: html })
    }
    const ch = i + 1
    const inputParents = [
      createInput(`Chapter ${ch} Start`),
      createInput(`Chapter ${ch} End`)
    ]
    const inputs = inputParents.map(p => p.children[1])

    if (i === 0) rtaInputs.push(inputs[0])
    else if (i === CHAPTERS - 1) rtaInputs.push(inputs[1])

    createElement({ parent: headers, tag: 'h3', innerHTML: `Chapter ${ch} Time` })
    const computed = createElement({ parent: headers, tag: 'input' })
    computed.setAttribute('readonly', '')
    computed.size = '20'

    inputs.forEach(input => input.addEventListener('change', e => {
      parseForTime(e)
      displayTime(inputs, computed)
      displayRTATime(rtaInputs)
    }))
  }
}

addClickToElement('computeButton', compute)
addChangeToElement('framerate', validateFPS)

function getById (id) {
  return document.getElementById(id)
}

function addEventToElement (e, id, fn) {
  getById(id).addEventListener(e, fn)
}

function addClickToElement (id, fn) {
  addEventToElement('click', id, fn)
}

function addChangeToElement (id, fn) {
  addEventToElement('change', id, fn)
}

function createElement (options) {
  let tag
  if (options) ({ tag } = options)
  if (!tag) tag = 'div'

  const newElement = document.createElement(tag)
  if (options) {
    const { parent, className, innerHTML, classes, type, value, dataset, checked } = options
    let { tag } = options
    if (!tag) tag = 'div'

    if (className) newElement.className = className

    if (classes) {
      classes.forEach(className => {
        newElement.classList.add(className)
      })
    }

    if (innerHTML) newElement.innerHTML = innerHTML

    if (type) newElement.setAttribute('type', type)

    if (checked) newElement.setAttribute('checked', checked)

    if (value) newElement.value = value

    if (dataset) {
      for (const variable in dataset) {
        newElement.dataset[variable] = dataset[variable]
      }
    }

    if (parent) parent.appendChild(newElement)
  }

  return newElement
}

function displayTime (inputs, computed) {
  console.log(inputs)
  const values = inputs.map(input => input.value)
  const time = compute(values[0], values[1])
  computed.value = time
}

function displayRTATime (inputs) {
  const computed = getById('rta-time')
  displayTime(inputs, computed)
}

function compute (startFrame, endFrame) {
  console.log(startFrame, endFrame)
  // Initiate basic time variables
  let hours = 0
  let minutes = 0
  let seconds = 0
  let milliseconds = 0

  // Get framerate, start frame, and end frame from corresponding elements
  // Double check they all have a value
  const frameRate = parseInt(document.getElementById('framerate').value)
  if (typeof (startFrame) === 'undefined' || endFrame === 'undefined' || frameRate === 'undefined') {
    return
  }

  // Calculate framerate
  let frames = (endFrame - startFrame) * frameRate
  seconds = Math.floor(frames / frameRate)
  frames = frames % frameRate
  milliseconds = Math.round(frames / frameRate * 1000)
  if (milliseconds < 10) {
    milliseconds = '00' + milliseconds
  } else if (milliseconds < 100) {
    milliseconds = '0' + milliseconds
  }
  if (seconds >= 60) {
    minutes = Math.floor(seconds / 60)
    seconds = seconds % 60
    seconds = seconds < 10 ? '0' + seconds : seconds
  }
  if (minutes >= 60) {
    hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    minutes = minutes < 10 ? '0' + minutes : minutes
  }

  return hours.toString() + 'h ' + minutes.toString() + 'm ' + seconds.toString() + 's ' + milliseconds.toString() + 'ms'
}

function validateFPS (event) {
  // If framerate is invalid, show an error message and disable start and end frame fields
  if (event.target.value === '' || parseInt(event.target.value) <= 0 || isNaN(parseInt(event.target.value))) {
    document.getElementById('framerate').setCustomValidity('Please enter a valid framerate.')
    document.getElementById('framerate').reportValidity()
    document.getElementById('startobj').disabled = true
    document.getElementById('endobj').disabled = true
    document.getElementById('computeButton').disabled = true
  } else {
    document.getElementById('startobj').disabled = false
    document.getElementById('endobj').disabled = false
    document.getElementById('computeButton').disabled = false
  }
}

function parseForTime (event) {
  // Get current frame from input field (either start time or end time)
  const frameFromInputText = (JSON.parse(event.target.value)).lct
  if (typeof frameFromInputText !== 'undefined') {
    // Get the framerate
    const frameRate = parseInt(document.getElementById('framerate').value)
    // Calculate the frame
    const frameFromObj = (time, fps) => Math.floor(time * fps) / fps // round to the nearest frame
    const finalFrame = frameFromObj(frameFromInputText, frameRate)
    // Update the DOM
    event.target.value = `${finalFrame}`
  }
}
