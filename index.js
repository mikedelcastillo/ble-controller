const noble = require('noble')
const ioHook = require('iohook')

let mode = 0
let discovered = []
let selected = null
let keys = {}

function update() {
    if (mode == 0) { // Select device
        console.log(discovered)
    } else if (mode == 1) { // Controll device

    }
}

noble.on('stateChange', (state) => {
    console.log('NOBLE[STATE_CHANGE]: ' + state)
    return state === 'poweredOn' ? noble.startScanning() : noble.stopScanning()
})

noble.on('scanStart', () => console.log('NOBLE[SCAN]: start'))
noble.on('scanStop', () => console.log('NOBLE[SCAN]: stop'))

noble.on('discover', peripheral => {
    discovered.push(peripheral)
    update()
})

ioHook.on('keydown', e => {
    keys[e.keycode] = true
    console.log(e)
})

ioHook.on('keyup', e => {
    keys[e.keycode] = false
    console.log(keys)
})

ioHook.start()