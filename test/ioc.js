let Ioc = require('./Ioc')
let expect = require('expect.js')

describe('Ioc container tests', function () {
  describe('#Register Provider/class', function () {
    it('Ioc should be an object', function () {
      expect(Ioc).to.be.a('object')
    })
  })
})
