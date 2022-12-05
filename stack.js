class Stack {
    constructor() {
        const buf = new ArrayBuffer(1_048_576)
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
}

module.exports = Stack