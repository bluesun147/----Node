const M = { // 객체
    v: 'v!',
    func() {
        console.log(this.v);
    }
}

module.exports = M;