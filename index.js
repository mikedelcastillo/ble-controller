const {keyMapping} = require('./mapping')

const noble = require('noble')
const ioHook = require('iohook')

let discoveredPeripherals = []
let selectedPeripheral = null
let selectedCharacteristic = null
let keys = {}

function receive(data) {
    console.log("RECEIVED: " + data)
}

function send(string) {
    if (selectedPeripheral && selectedCharacteristic) {
        selectedCharacteristic.write(
            new Buffer(string),
            true,
            function (error) {
                if (!error) {
                    // good
                } else {
                    // no
                }
            });
    }
}

function update() {
    console.clear()
    if (selectedPeripheral == null) { // Select device
        console.log("Select a device...")
        for (let index = 0; index < discoveredPeripherals.length; index++) {
            let keyPair = keyMapping[index]
            let peripheral = discoveredPeripherals[index]
            console.log(`${keyPair[0]}: (uuid: ${peripheral.uuid}) ${peripheral.advertisement.localName}`)
            if (keys[keyPair[1]]) {
                selectedPeripheral = peripheral

                selectedPeripheral.on('connect', () => {
                    selectedPeripheral.updateRssi()
                    update()
                })
                selectedPeripheral.on('disconnect', () => {
                    process.exit()
                    update()
                })
                selectedPeripheral.on('rssiUpdate', function (rssi) {
                    selectedPeripheral.discoverServices();
                    update()
                });
                selectedPeripheral.on('servicesDiscover', services => {
                    update()
                    services.forEach(service => {
                        service.on('includedServicesDiscover', includedServiceUuids => {
                            service.discoverCharacteristics()
                            update()
                        })
                        service.on('characteristicsDiscover', characteristics => {
                            update()
                        })
                        service.discoverIncludedServices()
                    })
                })
                selectedPeripheral.connect();

                update()
            }
        }
    } else if (selectedCharacteristic == null) { // Select characteristic
        let chars = []
        if (!selectedPeripheral.services) return console.log("Waiting for services...")
        selectedPeripheral.services.forEach(s => Array.prototype.push.apply(chars, (s.characteristics || [])))
        console.log("Select characteristic...")
        for(let index = 0; index < chars.length; index++){
            let keyPair = keyMapping[index]
            let char = chars[index]
            console.log(`${keyPair[0]}: (uuid: ${char.uuid}) ${char.name}`)

            if(keys[keyPair[1]]){
                selectedCharacteristic = char
                selectedCharacteristic.on("read", (data) => {
                    return receive(data.toString())
                })
            }
        }
    } else { // Communicate with device
        console.log(`Selected: (uuid: ${selectedPeripheral.uuid}) ${selectedPeripheral.advertisement.localName}`)
        console.log(`State: ${selectedPeripheral.state}`)
    }
}

noble.on('stateChange', (state) => {
    console.log('NOBLE[STATE_CHANGE]: ' + state)
    return (state === 'poweredOn') ? noble.startScanning() : noble.stopScanning()
})

noble.on('scanStart', () => console.log('NOBLE[SCAN]: start'))
noble.on('scanStop', () => console.log('NOBLE[SCAN]: stop'))

noble.on('discover', peripheral => {
    discoveredPeripherals.push(peripheral)
    update()
})

let projDict = {
    17: ["W", "w"],
    30: ["A", "a"],
    31: ["S", "s"],
    32: ["D", "d"],
}

ioHook.on('keydown', e => {
    keys[e.keycode] = true
    const d = projDict[e.keycode]
    d ? send(d[0]) : null
    update()
})

ioHook.on('keyup', e => {
    keys[e.keycode] = false
    const d = projDict[e.keycode]
    d ? send(d[1]) : null
    update()
})

ioHook.start()