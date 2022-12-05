class Memory {
    constructor(u8arrayProgram) {
        const buf = new ArrayBuffer(0x10000)
        const view = new Uint8Array(buf)
        for (let i=0; i<u8arrayProgram.byteLength; i++) {
            view[i] = u8arrayProgram[i]
        }        
        this.dv = new DataView(buf)
    }
    read(addr) {
        return this.dv.getUint16(addr << 1, true)
    }
    write(addr, v) {
        this.dv.setUint16(addr << 1, v, true)
    }
}


module.exports = Memory
