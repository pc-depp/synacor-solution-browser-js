class History {
    constructor(vm) {
        this.vm = vm
        this.vm.registerInputHandler(this.handleInput.bind(this))
        this.attach()
        this.refreshCaptions()
    }
    getState(i) {
        return JSON.parse(localStorage.getItem(`vmstate${i}`))
    }
    setState(i, st) {
        localStorage.setItem(`vmstate${i}`, JSON.stringify(st))
    }
    attach() {
        this.nodes = document.querySelectorAll('.state-history')
        for (let i=0; i<this.nodes.length; i++) {
            if (!localStorage.getItem(`vmstate${i}`)) {
                this.setState(i, {line: '', st: null})
            }
            this.nodes[i].addEventListener('click', this.handleClick.bind(this))
        }        
    }
    hasInitialState() {
        for (let i=0; i<this.nodes.length; i++) {
            const rec = this.getState(i)
            if (rec.line === 'INITIAL') {
                return true
            }
        }
        return false
    }
    handleClick(ev) {
        const idx = parseInt(ev.target.getAttribute('data-i'))
        const rec = this.getState(idx)
        if (rec.st) {
            this.vm.restoreState(rec.st)
            this.shiftUpBy(idx)
        }
    }
    refreshCaptions() {
        for (let i=0; i<this.nodes.length; i++) {
            const rec = this.getState(i)
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
            this.setState(i, {line: '', st: null})
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
        if (!this.hasInitialState()) {
            inputBuf = 'INITIAL'
        }
        if (inputBuf) {
            this.shiftDown()
            this.setState(
                0,
                {
                    line: inputBuf,
                    st: this.vm.serializeState(false),
                }
            )
        }
        this.refreshCaptions()
    }
}

module.exports = History