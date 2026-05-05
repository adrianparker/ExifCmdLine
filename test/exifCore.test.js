import chai from 'chai'
import { describe, it } from 'mocha'
import { exifToRows, validateZone } from '../src/exifCore.js'

const { expect } = chai

describe('exifCore', function () {
  it('validates bad IANA zone names', function () {
    expect(() => validateZone('a/b')).to.throw(Error, 'a/b is not a valid IANA zone')
  })

  it('returns date rows and original value rows by default', function () {
    const rows = exifToRows({
      CreateDate: new Date('2023-04-10T15:29:56Z'),
      Make: 'Canon'
    }, null, false)

    expect(rows).to.have.length(2)
    expect(rows[0][0]).to.equal('CreateDate')
    expect(rows[1][0]).to.equal('CreateDate')
    expect(rows[1][1]).to.be.instanceOf(Date)
  })

  it('includes non-date keys when all=true', function () {
    const rows = exifToRows({
      Make: 'Canon',
      Model: 'R6'
    }, null, true)

    expect(rows).to.have.length(2)
    expect(rows[0][0]).to.equal('Make')
    expect(rows[1][0]).to.equal('Model')
  })
})
