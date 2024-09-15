/**
 * Array containing two inputs, first one stores a start time and second one stores an end time
 * @typedef {HTMLInputElement[]} TimeInputs
 */

let chapters = 2

getById('segments').addEventListener('change', (e) => {
  chapters = Number(e.target.value)
  if (isNaN(chapters) || chapters < 1) {
    chapters = 1
  }

  generatePage()
})

generatePage()

/**
 * Generates all the inputs and setups controls
 */
function generatePage () {
  const div = getById('time-inputs')
  const headers = getById('segment-headers')
  const igtDiv = getById('igt-time')
  const rtaDiv = getById('rta-time');

  [div, headers, igtDiv, rtaDiv].forEach(e => {
    e.innerHTML = ''
  })

  const computedIGT = createComputedInput(igtDiv)
  const computedRTA = createComputedInput(rtaDiv)
  const chapterElements = {}

  for (let i = 0; i < chapters; i++) {
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

    createElement({ parent: headers, tag: 'h3', innerHTML: `Chapter ${ch} Time` })
    const computed = createComputedInput(headers)

    chapterElements[ch] = { inputs, computed }

    inputs.forEach(input => input.addEventListener('change', e => {
      parseForTime(e)
      updateTimes(ch, chapterElements, computedRTA, computedIGT)
    }))
  }
}

/**
 * Computes and updates the final times for each time display
 * @param {number} currentCh - Chapter time that is being updated
 * @param {object} elements - An object that maps chapter number -> an object containing inputs which has `TimeInputs` and computed which has the display input
 * @param {HTMLInputElement} computedRTA - Input that displays the RTA time
 * @param {HTMLInputElement} computedIGT - Input that displays the IGT time
 */
function updateTimes (currentCh, elements, computedRTA, computedIGT) {
  const frameRate = getFrameRate()
  const updateComputed = (element, delta) => { element.value = formatTime(delta, frameRate) }

  // rta time
  const rtaInputs = [
    elements[1].inputs[0],
    elements[chapters].inputs[1]
  ]
  updateComputed(computedRTA, getDelta(rtaInputs))

  // igt and chapter times
  let total = 0
  for (const chapter in elements) {
    const { inputs } = elements[chapter]
    const delta = getDelta(inputs)
    // update if current chapter is the one that fired this update
    if (Number(chapter) === currentCh) updateComputed(elements[currentCh].computed, delta)
    total += delta
  }

  // update total IGT
  updateComputed(computedIGT, total)
}

/**
 * Gets the time difference from two time inputs
 * @param {TimeInputs} inputs - Inputs with the values
 * @returns {number} Time difference in seconds
 */
function getDelta (inputs) {
  const values = inputs.map(input => Number(input.value))
  return values[1] - values[0]
}

/**
 * Creates a display input that stores a computed time
 * @param {HTMLElement} parent - Parent element to append to
 * @returns {HTMLInputElement} The input element
 */
function createComputedInput (parent) {
  const computed = createElement({ parent, tag: 'input' })
  computed.setAttribute('readonly', '')
  computed.size = '20'
  return computed
}

/**
 * Get an element from the DOM with its HTML id
 * @param {string} id - Id of the element
 * @returns {HTMLElement} - Element
 */
function getById (id) {
  return document.getElementById(id)
}

/**
 * Create element based on options
 * @param {object} options
 * @param {HTMLElement} options.parent - Parent element to append to
 * @param {string} options.tag - HTML tag for the element
 * @returns {HTMLElement} Created element
 */
function createElement (options) {
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
 * Gets the framerate from the user input
 * @returns {number} Framerate in frames per second
 */
function getFrameRate () {
  return parseInt(document.getElementById('framerate').value)
}

/**
 * Formats a time in seconds
 * @param {number} delta - The time in seconds
 * @param {number} frameRate - Run framerate in frames per second
 * @returns {string} Formatted time string
 */
function formatTime (delta, frameRate) {
  if (isNaN(delta)) return ''
  const totalFrames = Math.round(delta * frameRate)

  let frames = 0
  let hours = 0
  let minutes = 0
  let seconds = 0
  let milliseconds = 0

  seconds = Math.floor(totalFrames / frameRate)
  frames = totalFrames % frameRate
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
