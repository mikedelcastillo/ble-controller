const noble = require('noble');
const ioHook = require('iohook');
const boardUUID = '9059af16ac30';

noble.on('stateChange', function (state) {
	console.log('on -> stateChange: ', state);

	if (state === 'poweredOn') {
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

noble.on('scanStart', function () {
	console.log('on -> scanStart');
});

noble.on('scanStop', function () {
	console.log('on -> scanStop');
});

noble.on('discover', function (peripheral) {
	console.log('on -> discover: ', peripheral);
	if (peripheral.uuid != boardUUID) return false;

	peripheral.on('connect', function () {
		console.log('on -> connect');
		this.updateRssi();
	});

	peripheral.on('disconnect', function () {
		console.log('on -> disconnect', peripheral);
	});

	peripheral.on('rssiUpdate', function (rssi) {
		console.log('on -> RSSI update ', rssi);
		this.discoverServices();
	});

	peripheral.on('servicesDiscover', function (services) {
		console.log('on -> peripheral services discovered ', services);

		services.forEach((service, serviceIndex) => {

			services[serviceIndex].on('includedServicesDiscover', function (includedServiceUuids) {
				console.log('on -> service included services discovered ', includedServiceUuids);
				this.discoverCharacteristics();
			});

			services[serviceIndex].on('characteristicsDiscover', function (characteristics) {
				console.log('on -> service characteristics discovered ', characteristics);
				characteristics.forEach((char, characteristicIndex) => {
					if (char.uuid != 'dfb1') return false;
					//
					// characteristics[characteristicIndex].on('read', function(data, isNotification) {
					//   console.log('on CHAR READ!!! ' + data + ' ', isNotification);
					//   console.log(data.toString());
					//
					//   // peripheral.disconnect();
					// });
					//
					// characteristics[characteristicIndex].on('write', function() {
					//   console.log('on -> characteristic write ');
					//
					//   // peripheral.disconnect();
					// });

					characteristics[characteristicIndex].on('broadcast', function (state) {
						console.log('on -> characteristic broadcast ', state);

						// peripheral.disconnect();
					});

					characteristics[characteristicIndex].on('notify', function (state) {
						console.log('on -> characteristic notify ', state);

						// peripheral.disconnect();
					});

					// setInterval(() => {
					//   char.read(function (error, data) {
					//     console.log(error, data.toString())
					//   });
					// }, 100);

					// char.read();

					function send(str) {
						const message = new Buffer(str.toString());
						char.write(
							message,
							true,
							function (error) {
								if (!error) {
									console.log(str, 'write succesfull');
								} else {
									console.log('write unsuccessfull');
								}
							}.bind(this));
					}

					ioHook.on('keydown', e => {
						console.log(e.keycode);
						// let d = {
						//   87: 2,
						//   83: 4,
						//   65: 6,
						//   68: 8,
						// };

						81 - 65
						87 - 83

						let d = {
							87: 2,
							83: 4,
							81: 6,
							65: 8,
						};

						let s = d[e.keycode];
						if (s) send(s);
					}, false);

					ioHook.on('keyup', e => {
						// let d = {
						//   87: 1,
						//   83: 3,
						//   65: 5,
						//   68: 7,
						// };

						let d = {
							87: 1,
							83: 3,
							81: 5,
							65: 7,
						};

						let s = d[e.keycode];
						if (s) send(s.toString());
					}, false);

				});
			});


			services[serviceIndex].discoverIncludedServices();
		});


	});

	peripheral.connect();
});