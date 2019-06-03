// const readline = require('readline');
// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);
// process.stdin.on('keypress', console.log);
// process.stdin.on('keyrelease', console.log);
// console.log('Press any key...';)

const ioHook = require('iohook');

// ioHook.on('mousemove', console.log);
ioHook.on('keydown', (e) => {
    console.clear()
    console.log(e.keycode)
});
ioHook.on('keyup', (e) => {
    console.clear()
    console.log(e.keycode)
});

// Register and start hook
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
// ioHook.start(true);