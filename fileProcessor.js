import { processFileExifNode } from './src/nodeAdapter.js'

/**
 * Attempts to read EXIF data from given file.
 *
 * @param {*} filename of image to attempt to read EXIF data from
 * @param {string} (optional) IANA timezone string to display full date times as
 * @param {boolean} whether to output all exif data or just dates
 * @returns {Array} contains Arrays of extracted EXIF data keys, values, and optional timezone
 */
export async function processFileExif (filename, zone, all) {
  return await processFileExifNode(filename, zone, all)
}
