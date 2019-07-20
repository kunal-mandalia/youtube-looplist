import time from '../util/time'

describe('time', () => {
  describe('convertToSeconds', () => {
    it('should convert 0:15 to 15 seconds', () => {
      expect(time.convertToSeconds('0:15')).toEqual(15)
    })

    it('should convert 01:25 to 85 seconds', () => {
      expect(time.convertToSeconds('01:25')).toEqual(85)
    })
  })
})