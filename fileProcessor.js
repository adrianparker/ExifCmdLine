import exifr from 'exifr'
import ExifImage from 'exif'
import { flatten } from 'flat'
import { DateTime, IANAZone } from 'luxon'

/**
 * Attempts to read EXIF data from given file.
 *
 * @param {*} filename of image to attempt to read EXIF data from
 * @param {string} (optional) IANA timezone string to display full date times as
 * @param {boolean} whether to output all exif data or just dates
 * @returns {Array} contains Arrays of extracted EXIF data keys, values, and optional timezone
 */
export async function processFileExif(filename, zone, all) {
  if (zone && !IANAZone.isValidZone(zone)) {
    throw new Error(zone + ' is not a valid IANA zone')
  }
  const exif = await exifr.parse(filename)
  if (exif) {
    return logExifDates(exif, zone, all)
  } else {
    try {
      /* eslint-disable */
        new ExifImage({ image: filename }, function (error, exifData) {
          /* eslint-enable */
        if (error) {
          console.log('Error: ' + error.message)
        } else {
          return logExifDates(exifData, zone, all)
        }
      })
    } catch (error) {
      console.log('Error: ' + error)
    }
  }
}

/**
 * Logs to console all EXIF attributes that include the word 'date'
 * @param {*} exif output from one of the exif metadata extraction modules
 * @param {string} (optional) IANA timezone string to display full date times as
 * @param {boolean} whether to output all exif data
 * @returns {Array} contains Arrays of extracted EXIF data keys, values, and optional timezone
 */
function logExifDates(exif, zone, all) {
  const exifValues = []
  if (exif) {
    // we flatten as ExifImage provides nested objects in output, whereas exifr does not.
    const flatExif = flatten(exif)
    Object.keys(flatExif)
      .sort()
      .forEach(function (key, i) {
        if (key.toUpperCase().indexOf('DATE') > -1) {
          const dateVal = flatExif[key]
          let lDT, lD
          if (Object.prototype.toString.call(dateVal) === '[object Date]') {
            lDT = DateTime.fromJSDate(dateVal)
          } else if (typeof dateVal === 'string') {
            if (key === 'GPSDateStamp') {
              // TODO append GPSTimeStamp if present
              lD = DateTime.fromFormat(dateVal, 'yyyy:MM:dd')
            } else {
              // we might get lucky and find it is an ISO format string
              lDT = DateTime.fromISO(dateVal)
            }
          }
          if (lDT) {
            if (zone) {
              exifValues.push([key, lDT.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS), 'NO ZONE'])
              exifValues.push([key, lDT.toUTC().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS), 'UTC'])
              exifValues.push([key, lDT.setZone(zone).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS), zone])
            } else {
              exifValues.push([key, lDT.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS), null])
            }
          } else if (lD) {
            exifValues.push([key, lD.toLocaleString(DateTime.DATE_FULL), null])
          }
          exifValues.push([key, dateVal, null])
        } else {
          if (all) exifValues.push([key, flatExif[key], null])
        }
      })
  } else {
    console.log('Error - null exif')
  }
  return exifValues
}
