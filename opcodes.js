const OP_HALT = 0
const OP_SET = 1
const OP_PUSH = 2
const OP_POP = 3
const OP_EQ = 4
const OP_GT = 5
const OP_JMP = 6
const OP_JT = 7
const OP_JF = 8
const OP_ADD = 9
const OP_MULT = 10
const OP_MOD = 11
const OP_AND = 12
const OP_OR = 13
const OP_NOT = 14
const OP_RMEM = 15
const OP_WMEM = 16
const OP_CALL = 17
const OP_RET = 18
const OP_OUT = 19
const OP_IN = 20
const OP_NOP = 21

const OPCODES = {
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
}

const ARGCOUNTS = {
    OP_HALT: 0,
    OP_SET: 2,
    OP_PUSH: 1,
    OP_POP: 1,
    OP_EQ: 3,
    OP_GT: 3,
    OP_JMP: 1,
    OP_JT: 2,
    OP_JF: 2,
    OP_ADD: 3,
    OP_MULT: 3,
    OP_MOD: 3,
    OP_AND: 3,
    OP_OR: 3,
    OP_NOT: 2,
    OP_RMEM: 2,
    OP_WMEM: 2,
    OP_CALL: 1,
    OP_RET: 0,
    OP_OUT: 1,
    OP_IN: 1,
    OP_NOP: 0
}


module.exports = {OPCODES, ARGCOUNTS}
