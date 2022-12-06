const { serializeDataView, deserializeDataView } = require('./serializeDataView')

const { STACK_SIZE } = require('./stack')

const { OPCODES, ARGCOUNTS } = require('./opcodes')

const {
    OP_HALT,
    OP_SET,
    OP_PUSH,
    OP_POP,
    OP_EQ,
    OP_GT,
    OP_JMP,
    OP_JT,
    OP_JF,
    OP_ADD,
    OP_MULT,
    OP_MOD,
    OP_AND,
    OP_OR,
    OP_NOT,
    OP_RMEM,
    OP_WMEM,
    OP_CALL,
    OP_RET,
    OP_OUT,
    OP_IN,
    OP_NOP
} = OPCODES


class VM {
    constructor(mem, stk, io) {
        this.mem = mem
        this.stk = stk
        this.io = io
        this.ip = 0
        this.reg = [0, 0, 0, 0, 0, 0, 0, 0]
        this.isHalted = false
        this.isExpectingInput = false
        this.inputBuf = null
        this.inputBufImmutable = null
        this.prevLine = null
        this._disasmMode = false
        this.inputHandler = null
    }

    registerInputHandler(handler) {
        this.inputHandler = handler
    }

    _reg(v) {
        console.assert(v & 0x8000)
        const r = v & 0x7fff
        if (r > 7) {
            throw RangeError('register out of range 0..7')
        }
        return r
    }

    _nextw() {
        const v = this.mem.read(this.ip)
        this.ip++
        if (v & 0x8000) {
            return {'reg': this._reg(v)}
        }
        return {'val': v}
    }

    _unpackw(w) {
        if (w.reg !== undefined) {
            return this.reg[w.reg]
        }
        return w.val
    }

    _unpacknextw(count) {
        if (count === undefined) {
            return this._unpackw(this._nextw())
        }
        const words = []
        for (let i=0; i<count; i++) {
            words.push(this._unpackw(this._nextw()))
        }
        return words
    }

    _unpackwrite(dest, v) {
        if (dest.reg !== undefined) {
            this.reg[dest.reg] = v
        } else {
            this.mem.write(dest.val, v)
        }
    }

    _op_halt() { this.isHalted = true }

    _op_set() { 
        this._unpackwrite(this._nextw(), this._unpacknextw())
    }

    _op_push() { this.stk.push(this._unpacknextw()) }

    _op_pop() { this._unpackwrite(this._nextw(), this.stk.pop()) }

    _op_eq() {
        this._unpackwrite(
            this._nextw(),
            (
                this._unpacknextw() === this._unpacknextw()
                ? 1
                : 0
            )
        )
    }

    _op_gt() {
        this._unpackwrite(
            this._nextw(),
            (
                this._unpacknextw() > this._unpacknextw()
                ? 1
                : 0
            )
        )
    }

    _op_jmp() { this.ip = this._unpacknextw() }

    _op_jt() {
        const [a, b] = this._unpacknextw(2)
        if (a !== 0) {
            this.ip = b
        }
    }

    _op_jf() {
        const [a, b] = this._unpacknextw(2)
        if (a === 0) {
            this.ip = b
        }
    }

    _op_add() {
        const a = this._nextw()
        const [b, c] = this._unpacknextw(2)
        this._unpackwrite(a, (b + c) & 0x7fff)
    }

    _op_mult() {
        const a = this._nextw()
        const [b, c] = this._unpacknextw(2)
        this._unpackwrite(a, (b * c) & 0x7fff)
    }

    _op_mod() {
        const a = this._nextw()
        const [b, c] = this._unpacknextw(2)
        this._unpackwrite(a, b % c)
    }

    _op_and() {
        const a = this._nextw()
        const [b, c] = this._unpacknextw(2)
        this._unpackwrite(a, b & c)
    }

    _op_or() {
        const a = this._nextw()
        const [b, c] = this._unpacknextw(2)
        this._unpackwrite(a, b | c)
    }

    _op_not() { this._unpackwrite(this._nextw(), ~this._unpacknextw() & 0x7fff) }

    _op_rmem() { this._unpackwrite(this._nextw(), this.mem.read(this._unpacknextw())) }

    _op_wmem() {
        this.mem.write(this._unpacknextw(), this._unpacknextw())
    }

    _op_call() {
        const a = this._unpacknextw()
        this.stk.push(this.ip)
        this.ip = a
    }

    _op_ret() {
        try {
            this.ip = this.stk.pop()
        } catch {
            this.isHalted = true
        }
    }

    _op_out() { this.io.putch(this._unpacknextw()) }

    _op_inp() {
        if (!this.inputBuf) {
            this.ip--
            this.prevLine = this.inputBufImmutable
            if (this.inputHandler) {
                this.inputHandler(this.inputBufImmutable)
            }
            this.io.setExpectingInput(true)
            this.isExpectingInput = true
            return
        }
        const ch = this.inputBuf.charCodeAt(0)        
        this.io.putch(ch)
        this._unpackwrite(this._nextw(), ch)
        this.inputBuf = this.inputBuf.slice(1)
    }

    _exec(opc) {
        switch(opc) {
            case OP_HALT:
                this._op_halt()
                break
            case OP_SET:
                this._op_set()
                break
            case OP_PUSH:
                this._op_push()
                break
            case OP_POP:
                this._op_pop()
                break
            case OP_EQ:
                this._op_eq()
                break
            case OP_GT:
                this._op_gt()
                break
            case OP_JMP:
                this._op_jmp()
                break
            case OP_JT:
                this._op_jt()
                break
            case OP_JF:
                this._op_jf()
                break
            case OP_ADD:
                this._op_add()
                break
            case OP_MULT:
                this._op_mult()
                break
            case OP_MOD:
                this._op_mod()
                break
            case OP_AND:
                this._op_and()
                break
            case OP_OR:
                this._op_or()
                break
            case OP_NOT:
                this._op_not()
                break
            case OP_RMEM:
                this._op_rmem()
                break
            case OP_WMEM:
                this._op_wmem()
                break
            case OP_CALL:
                this._op_call()
                break
            case OP_RET:
                this._op_ret()
                break
            case OP_OUT:
                this._op_out()
                break
            case OP_IN:
                this._op_inp()
                break
            case OP_NOP:
                break
        }
    }

    _printdisasmline(s) {
        console.log(s.trim())
    }

    _showdisasmarg(opc, addr) {
        const v = this.mem.read(addr)

        if (opc == OP_OUT) {
            return v == 10 ? 'newline' : `'${String.fromCharCode(v)}'`
        }

        if (v & 0x8000) {
            const r = this._reg(v)
            return `r${r}`
        }
        return v.toString(16).padStart(4, '0')
    }

    _showdisasmargs(opc, n) {
        const args = []
        for (let i=0; i<n; i++) {
            args.push(this._showdisasmarg(opc, this.ip + i))
        }
        return args.join(', ')
    }

    _showdisasmregs() {
        return this.reg.map((r) => r.toString(16).padStart(4, '0')).join(' | ')
    }

    _exec_withdisasm(opc) {
        const instrAddr = this.ip - 1
        const byteAddr = instrAddr << 1
        const opcodeKey = Object.keys(OPCODES)[ Object.values(OPCODES).indexOf(opc) ] 
        const mnem = opcodeKey.slice(3)
        let s = `${instrAddr.toString(16).padStart(4, '0')} [${byteAddr.toString(16).padStart(4, '0')}]  ${mnem.padEnd(4)} `
        s += this._showdisasmargs(opc, ARGCOUNTS[opcodeKey])
        s = s.padEnd(36) + this._showdisasmregs()        
        this._printdisasmline(s)
        switch(opc) {
            case OP_HALT:
                this._op_halt()
                break
            case OP_SET:
                this._op_set()
                break
            case OP_PUSH:
                this._op_push()
                break
            case OP_POP:
                this._op_pop()
                break
            case OP_EQ:
                this._op_eq()
                break
            case OP_GT:
                this._op_gt()
                break
            case OP_JMP:
                this._op_jmp()
                break
            case OP_JT:
                this._op_jt()
                break
            case OP_JF:
                this._op_jf()
                break
            case OP_ADD:
                this._op_add()
                break
            case OP_MULT:
                this._op_mult()
                break
            case OP_MOD:
                this._op_mod()
                break
            case OP_AND:
                this._op_and()
                break
            case OP_OR:
                this._op_or()
                break
            case OP_NOT:
                this._op_not()
                break
            case OP_RMEM:
                this._op_rmem()
                break
            case OP_WMEM:
                this._op_wmem()
                break
            case OP_CALL:
                this._op_call()
                break
            case OP_RET:
                this._op_ret()
                break
            case OP_OUT:
                this._op_out()
                break
            case OP_IN:
                this._op_inp()
            case OP_NOP:
                break
        }
    }

    step() {
        if (this.isHalted)
            return

        if (this.isExpectingInput) {
            const buf = this.io.getInputBuf()
            if (buf) {                
                this.io.setExpectingInput(false)
                this.inputBuf = buf
                this.inputBufImmutable = buf.trimEnd()
                this.isExpectingInput = false
                this.io.putch('>'.charCodeAt(0))
                this.io.putch(' '.charCodeAt(0))
            }
            return
        }

        const opc = this.mem.read(this.ip)
        this.ip++

        if (this._disasmMode) {
            this._exec_withdisasm(opc)
        } else {
            this._exec(opc)
        }
    }

    serializeState() {
        return {
            mem: serializeDataView(this.mem.getDataView()),
            stk: serializeDataView(this.stk.getDataView()),
            stkByteSP: this.stk.getByteSP(),
            lines: this.io.getLines(),
            ip: this.ip,
            reg: this.reg,
            prevLine: this.prevLine,
        }
    }

    restoreState(st) {
        const { mem, stk, stkByteSP, lines, ip, reg, prevLine, } = st
        this.mem.setDataView(deserializeDataView(0x10000, mem))
        this.stk.setDataView(deserializeDataView(STACK_SIZE, stk))
        this.stk.setByteSP(stkByteSP)
        this.io.setLines(lines)
        this.ip = ip
        this.reg = reg
        this.prevLine = prevLine
        this.isHalted = false
        this.inputBuf = null
        this.inputBufImmutable = null
    }
}

module.exports = VM
