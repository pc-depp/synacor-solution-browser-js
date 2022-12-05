class Memory {
    constructor(u8array) {
        this.dv = new DataView(u8array.buffer)
    }
    read(addr) {
        return this.dv.getUint16(addr << 1, true)
    }
    write(addr, v) {
        this.dv.setUint16(addr << 1, v, true)
    }
}


module.exports = Memory
