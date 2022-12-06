class Console {
    constructor(el) {
        this.lines = new Array(25)
        this.inputBuf = ''
        this.inputElem = null
        for (let y=0; y<25; y++) {
            this.lines[y] = []
        }
        this.build(el)
    }
    build(el) {
        el.setAttribute(
            'style',
            'display: inline-block; font-family: monospace; font-size: 16px;'
            + 'background-color: #ccc;'
        )
        for (let y=0; y<25; y++) {
            const row = document.createElement('div')
            for (let x=0; x<80; x++) {
                const col = document.createElement('div')
                col.setAttribute(
                    'style',
                    `display: inline-block; width: 10px; height: 24px;`
                    + 'text-align: center; vertical-align: middle;'
                )
                col.setAttribute('data-x', x)
                col.setAttribute('data-y', y)
                row.appendChild(col)
            }
            el.appendChild(row)
        }
        const inp = document.createElement('input')
        inp.setAttribute('type', 'text')
        inp.setAttribute('style', 'width: calc(100% - 5px); font-family: monospace; font-size: 16px; margin: 0; border: 0; padding-left: 3px; background-color: #ace')
        inp.setAttribute('autofocus', '')
        inp.setAttribute('disabled', '')
        inp.addEventListener('keyup', this._keyUpHandler.bind(this))
        el.appendChild(inp)
        this.inputElem = inp
    }

    _keyUpHandler(ev) {
        if (ev.code === 'Enter' && ev.target.value) {
            this.inputBuf = ev.target.value + String.fromCharCode(10)
        }
    }

    setExpectingInput(v) {
        console.assert(v === true || v === false)
        if (v) {
            this.inputElem.removeAttribute('disabled')
            this.inputElem.focus()
        } else {
            this.inputElem.setAttribute('disabled', '')
            this.inputElem.value = ''
            this.inputBuf = ''
        }        
    }

    getInputBuf() {
        return this.inputBuf
    }

    getLines() {
        return this.lines
    }

    setLines(lines) {
        this.lines = lines
        this._rendertext()
    }

    _linefeed() {
        for (let i=0; i<24; i++) {
            this.lines[i] = this.lines[i+1]
        }
        this.lines[24] = []
    }

    _rendertext() {
        for (let y=0; y<25; y++) {
            const line = this.lines[y]
            let el = document.querySelector(`#console [data-y="${y}"]`)
            for (let x=0; x<80; x++) {
                el.innerText = line[x] || ' '
                el = el.nextSibling
            }
        }
    }

    print(s) {
        const numlines = Math.ceil(s.length / 80)
        for (let i=0, j=0; i<numlines; i++, j+=80) {
            this._linefeed()
            this.lines[24] = s.slice(j, j + Math.min(80, s.length - j))
        }
        this._rendertext()
    }
}

module.exports = Console
