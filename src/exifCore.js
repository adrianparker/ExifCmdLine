import { flatten } from 'flat'
import { DateTime, IANAZone } from 'luxon'

export function validateZone (zone) {
  if (zone && !IANAZone.isValidZone(zone)) {
    throw new Error(zone + ' is not a valid IANA zone')
  }
}

/**
 * Converts EXIF object into rows [key, value, zone].
 *
 * @param {*} exif output from EXIF parser library
 * @param {string} zone optional IANA timezone string
 * @param {boolean} all whether to include all EXIF fields
 * @returns {Array} contains Arrays of extracted EXIF data keys, values, and optional timezone
 */
export function exifToRows (exif, zone, all) {
  const exifValues = []
  if (!exif) {
    return exifValues
  }

  // We flatten as ExifImage provides nested objects in output, whereas exifr may not.
  const flatExif = flatten(exif)

  Object.keys(flatExif)
    .sort()
    .forEach(function (key) {
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
      } else if (all) {
        exifValues.push([key, flatExif[key], null])
      }
    })

  return exifValues
}
