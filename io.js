class IO {
    constructor(con) {
        this.con = con
        this.buf = ''
    }

    putch(ch) {
        if (ch == 10) {
            this.con.print(this.buf)
            this.buf = ''
            return
        }
        this.buf += String.fromCharCode(ch)
    }

    setExpectingInput(v) {
        this.con.setExpectingInput(v)
    }

    getInputBuf() {
        return this.con.getInputBuf()
    }
}

module.exports = IO
