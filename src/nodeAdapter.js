import exifr from 'exifr'
import ExifImage from 'exif'
import { exifToRows, validateZone } from './exifCore.js'

async function parseWithExifImage (filename) {
  return await new Promise((resolve, reject) => {
    try {
      /* eslint-disable */
      new ExifImage({ image: filename }, function (error, exifData) {
        /* eslint-enable */
        if (error) {
          reject(error)
          return
        }
        resolve(exifData)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Attempts to read EXIF data from given file path in Node.js.
 *
 * @param {*} filename image file path
 * @param {string} zone optional IANA timezone string
 * @param {boolean} all whether to include all EXIF fields
 * @returns {Array} contains Arrays of extracted EXIF data keys, values, and optional timezone
 */
export async function processFileExifNode (filename, zone, all) {
  validateZone(zone)

  const exif = await exifr.parse(filename)
  if (exif) {
    return exifToRows(exif, zone, all)
  }

  const fallbackExif = await parseWithExifImage(filename)
  return exifToRows(fallbackExif, zone, all)
}
