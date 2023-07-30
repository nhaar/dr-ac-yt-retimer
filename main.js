/**
 * Array containing two inputs, first one stores a start time and second one stores an end time
 * @typedef {HTMLInputElement[]} TimeInputs
 */

/**
 * String representation of a decimal number which represents a time in seconds
 * @typedef {Timestamp} string
 */

const CHAPTERS = 2

generatePage()

/**
 * Generates all the inputs and setups controls
 */
function generatePage() {
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

/**
 * Get an element from the DOM with its HTML id
 * @param {string} id - Id of the element
 * @returns {HTMLElement} - Element
 */
function getById(id) {
  return document.getElementById(id)
}


/**
 * Create element based on options
 * @param {object} options
 * @param {HTMLElement} options.parent - Parent element to append to
 * @param {string} options.tag - HTML tag for the element
 * @returns {HTMLElement} Created element
 */
function createElement(options) {
  let tag
  if (options) ({ tag } = options)
  if (!tag) tag = 'div'

  const newElement = document.createElement(tag)
  if (options) {
    const { parent, innerHTML } = options
    let { tag } = options
    if (!tag) tag = 'div'

    if (innerHTML) newElement.innerHTML = innerHTML

    if (parent) parent.appendChild(newElement)
  }

  return newElement
}

/**
 * Display the time calculated from two inputs into another input
 * @param {TimeInputs} inputs Inputs with time
 * @param {HTMLInputElement} computed Input element that will store the time
 */
function displayTime(inputs, computed) {
  const values = inputs.map(input => input.value)
  const time = compute(values[0], values[1])
  computed.value = time
}

/**
 * Display the run's RTA time
 * @param {TimeInputs} inputs Inputs with time
 */
function displayRTATime(inputs) {
  const computed = getById('rta-time')
  displayTime(inputs, computed)
}

/**
 * 
 * @param {Timestamp} startFrame - Start time
 * @param {Timestamp} endFrame - End time
 * @returns {string} A formatted time string
 */
function compute(startFrame, endFrame) {
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
  // Implicitly converts to number
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

/**
 * Convert the debug stat info into a number in seconds
 * @param {Event} event - Event for the input being updated with debug stat
 */
function parseForTime(event) {
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
