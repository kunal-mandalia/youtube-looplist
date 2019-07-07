function convertToMilliseconds(minutes) {
  return minutes * 1000 * 60
}

function convertToSeconds(timeString) {
  const [m, s] = timeString.split(":")
  return (parseInt(m, 10) * 60) + (parseInt(s, 10))
}

function getPeriodInMinutes(startTime, endTime) {
  const start = convertToSeconds(startTime)
  const end = convertToSeconds(endTime)
  return (end - start) / 60
}

async function wait(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  convertToMilliseconds,
  convertToSeconds,
  getPeriodInMinutes,
  wait
}