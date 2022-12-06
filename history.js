// const localStorage = require('localStorage')

class History {
    constructor(vm) {
        this.vm = vm
        this.vm.registerInputHandler(this.handleInput.bind(this))
        this.attach()
        this.refreshCaptions()
    }
    attach() {
        this.nodes = document.querySelectorAll('.state-history')
        for (let i=0; i<this.nodes.length; i++) {
            const key = `vmstate${i}`
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify({line: '', st: null, prevLine: ''}))
            }
            this.nodes[i].addEventListener('click', this.handleClick.bind(this))
        }        
    }
    handleClick(ev) {
        const idx = parseInt(ev.target.getAttribute('data-i'))
        const rec = JSON.parse(localStorage.getItem(`vmstate${idx}`))
        if (rec.st) {
            this.vm.restoreState(rec.st)
            this.shiftUpBy(idx + 1)
        }
    }
    refreshCaptions() {
        for (let i=0; i<this.nodes.length; i++) {
            const rec = JSON.parse(localStorage.getItem(`vmstate${i}`))
            this.nodes[i].innerText = rec?.line
        }
    }
    shiftUpBy(n) {
        if (!n) return

        for (let i=0; i<this.nodes.length-n; i++) {
            const lower = localStorage.getItem(`vmstate${i+n}`)
            localStorage.setItem(
                `vmstate${i}`,
                lower
            )
        }
        for (let i=this.nodes.length-n; i<this.nodes.length; i++) {
            localStorage.setItem(
                `vmstate${i}`,
                JSON.stringify({line: '', st: null})
            )
        }
        this.refreshCaptions()
    }
    shiftDown() {
        for (let i=this.nodes.length-1; i>0; i--) {
            localStorage.setItem(
                `vmstate${i}`,
                localStorage.getItem(`vmstate${i-1}`)
            )
        }
        this.refreshCaptions()
    }
    handleInput(inputBuf) {
        this.shiftDown()
        localStorage.setItem(
            `vmstate0`,
            JSON.stringify(
                {
                    line: inputBuf,
                    st: this.vm.serializeState(true),
                }
            )
        )
        this.refreshCaptions()
    }
}

module.exports = History