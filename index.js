const noble = require('noble')
const ioHook = require('iohook')

let discoveredPeripherals = []
let selectedPeripheral = null
let keys = {}

function update() {
    // console.clear()
    if (selectedPeripheral == null) { // Select device
        console.log("Select a device...")
        for(let index = 0; index < discoveredPeripherals.length; index++){
            let peripheral = discoveredPeripherals[index]
            console.log(`${index + 1}: ${peripheral.advertisement.localName} (uuid: ${peripheral.uuid})`)
            if(keys[index + 2]){
                selectedPeripheral = peripheral

                selectedPeripheral.on('connect',  () => {
                    selectedPeripheral.updateRssi()
                    update()
                })
                selectedPeripheral.on('disconnect',  () => {
                    selectedPeripheral = null
                    console.log("Disconnected")
                    update()
                })
                selectedPeripheral.on('rssiUpdate', function (rssi) {
                    selectedPeripheral.discoverServices();
                    update()
                });
                selectedPeripheral.on('servicesDiscover', services => {
                    console.log("services blah")
                    update()
                    services.forEach(service => {
                        service.on('includedServicesDiscover', includedServiceUuids => {
                            console.log("included blah")
                            service.discoverCharacteristics()
                        })
                        service.on('characteristicsDiscover', characteristics => {
                            console.log("chars blah")
                            characteristics.forEach(characteristic => {
                                characteristic.on('read', (data, isNotification) => {
                                    update()
                                    console.log("WEW: " + data.toString)
                                })
                                // setInterval( () => {
                                //     console.log("sending shit")
                                //     characteristic.write(
                                //         new Buffer("shit"),
                                //         true,
                                //         function (error) {
                                //             if (!error) {
                                //                 console.log('write succesfull');
                                //             } else {
                                //                 console.log('write unsuccessfull');
                                //             }
                                //         });
                                // }, 1000)
                                
                            })
                            
                        })
                        service.discoverIncludedServices()
                    })
                })
                selectedPeripheral.connect();

                update()
            }
        }
    } else { // Controll device
        console.log(`Selected: ${selectedPeripheral.advertisement.localName}  (uuid: ${selectedPeripheral.uuid})`)
        console.log(`State: ${selectedPeripheral.state}`)
        console.log(selectedPeripheral)
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

ioHook.on('keydown', e => {
    keys[e.keycode] = true
    update()
})

ioHook.on('keyup', e => {
    keys[e.keycode] = false
    update()
})

ioHook.start()