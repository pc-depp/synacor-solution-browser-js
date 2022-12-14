(async function () {
    const { serializeDataView, deserializeDataView } = require('./serializeDataView')

    const Console = require('./console')
    const con = new Console(document.getElementById('console'))
    const IO = require('./io')

    const localforage = require('localforage')
    const challengeBin = require('./challenge.bin')
    const Memory = require('./memory.js')
    const { Stack } = require('./stack.js')
    const VM = require('./vm.js')
    const History = require('./history')

    const vm = new VM(new Memory(challengeBin), new Stack(), new IO(con))
    const hist = new History(vm)

    const STEPS_PER_TIMESLICE = 10000
    const TIMEOUT = 0
    const timeslice = () => {
        for (let i=0; i<STEPS_PER_TIMESLICE; i++) {
            vm.step()
        }
        window.setTimeout(timeslice, TIMEOUT)
    }
    window.setTimeout(timeslice, TIMEOUT)

})().catch(err => {
    console.log(err)
})
