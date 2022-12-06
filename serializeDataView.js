const MAXRUNLENGTH = 0x0FFF

// arch-spec says:
//   - numbers 32776..65535 are invalid
// so 0xc000 can be used as run length marker
//
function serializeDataView(dv) {
    const serialized = []
    const N = dv.byteLength >> 1
    let i = 0
    while (i < N) {
        const w = dv.getUint16(i << 1, true)
        let j = i + 1
        while (
            j < N
            && dv.getUint16(j << 1, true) == w
            && j - i < MAXRUNLENGTH
        ) {
            j++
        }
        const runLength = j - i
        if (runLength > 2) {
            serialized.push(0xc000 | runLength)
            serialized.push(w)
        } else {
            for (let i=0; i<runLength; i++)
                serialized.push(w)
        }
        i = j
    }
    return serialized
}


function deserializeDataView(byteLength, serialized) {
    const buf = new ArrayBuffer(byteLength)
    const dv = new DataView(buf)
    let bytePos = 0
    let runLength = 0

    for (let w of serialized) {
        if ((w & 0xc000) === 0xc000) {
            runLength = w & 0x0fff
            continue
        }
        let rl = runLength || 1
        while (rl--) {
            dv.setUint16(bytePos, w, true)
            bytePos += 2
        }
        runLength = 0
    }
    return dv
}


module.exports = { serializeDataView, deserializeDataView }
