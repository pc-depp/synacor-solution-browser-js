const STACK_SIZE = 8192

class Stack {
    constructor() {
        const buf = new ArrayBuffer(STACK_SIZE)
        this.dv = new DataView(buf)
        this.byteSP = 0
    }
    push(v) {
        if (this.byteSP == this.dv.byteLength) {
            throw RangeError('stack overflow')
        }
        this.dv.setUint16(this.byteSP, v, true)
        this.byteSP += 2
    }
    pop(v) {
        if (this.byteSP === 0) {
            throw RangeError('stack underflow')
        }
        this.byteSP -= 2
        return this.dv.getUint16(this.byteSP, true)
    }
    getDataView() {
        return this.dv
    }
    setDataView(dv) {
        this.dv = dv
    }
}

module.exports = { STACK_SIZE, Stack }
