/**
 * Logs array of EXIF data keys, values, and optional time zone information to console.
 * @param {Array} exif array of arrays, each of which should have 3 elements, the first two mandatory.
 */
export function logToConsole(exif) {
  if (exif && Object.prototype.toString.call(exif) === '[object Array]') {
    exif.forEach(element => {
      console.log(element[0], element[1], element[2] ?? '')
    })
  }
}
