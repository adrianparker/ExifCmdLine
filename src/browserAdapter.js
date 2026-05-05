import exifr from 'exifr'
import { exifToRows, validateZone } from './exifCore.js'

/**
 * Reads EXIF data from a browser File/Blob object.
 *
 * @param {File|Blob} file uploaded file/blob
 * @param {string} zone optional IANA timezone string
 * @param {boolean} all whether to include all EXIF fields
 * @returns {Array} contains Arrays of extracted EXIF data keys, values, and optional timezone
 */
export async function processFileExifBrowser (file, zone, all) {
  validateZone(zone)

  const exif = await exifr.parse(file)
  return exifToRows(exif, zone, all)
}
