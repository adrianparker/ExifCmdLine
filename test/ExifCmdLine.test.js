import chai from 'chai'
import { describe, it } from 'mocha'
import chaiAsPromised from 'chai-as-promised'
import { processFileExif } from '../fileProcessor.js'

const { expect } = chai
chai.use(chaiAsPromised)

describe('Processes image files', function () {
  it('Extracts expected date keys and values from a valid image', async function () {
    const retVals = await processFileExif('test/img/1.jpeg', null, false)
    expect(retVals).to.have.length(6)
    expect(retVals[0][0]).to.equal('CreateDate')
    expect(retVals[0][1]).to.equal('Apr 10, 2023, 3:29:56 PM')
    expect(retVals[0][2]).to.equal(null)
    expect(retVals[2][0]).to.equal('DateTimeOriginal')
    expect(retVals[2][1]).to.equal('Apr 10, 2023, 3:29:56 PM')
    expect(retVals[2][2]).to.equal(null)
    expect(retVals[4][0]).to.equal('ModifyDate')
    expect(retVals[4][1]).to.equal('Apr 10, 2023, 3:29:56 PM')
    expect(retVals[4][2]).to.equal(null)
  })
})
describe('Handling timezones', function () {
  it('throws an Error when given a bad timezone', async function () {
    await expect(processFileExif('filename', 'a/b', true)).to.be.rejectedWith(Error, 'a/b is not a valid IANA zone')
  })
  it('Extracts expected date keys and values in given timezone from a valid image', async function () {
    const retVals = await processFileExif('test/img/1.jpeg', 'Asia/Tokyo', false)
    expect(retVals).to.have.length(12)
    expect(retVals[0][0]).to.equal('CreateDate')
    expect(retVals[0][1]).to.equal('Apr 10, 2023, 3:29:56 PM')
  })
})
