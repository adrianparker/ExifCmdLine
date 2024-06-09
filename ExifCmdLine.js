#!/usr/bin/env node

import exifr from 'exifr'
import ExifImage from 'exif'
import argv from 'argv'
import { flatten } from 'flat'
import { DateTime } from 'luxon'
// when eslint can handle JSON module imports
// import packageJSON from './package.json' with { type: "json" }
const packageJSON = {
  version: '1.0.0'
}

/**
 * Validates command line arguments and if they look OK, invokes EXIF extraction.
 * Otherwise will output some information on correct invocation and exit.
 */
function start() {
  console.log('ExifCmdLine v ' + packageJSON.version)
  argv.version(packageJSON.version)
  argv.option({
    name: 'filename',
    short: 'f',
    type: 'path',
    description: 'Path of image file',
    example: "'ExifCmdLine --filename=FOO.jpeg' or 'ExifCmdLine -f BAR.jpg'"
  })
  argv.option({
    name: 'all',
    short: 'a',
    type: 'boolean',
    description: 'If present, all EXIF will be output, as well as dates. BEFORE -f argument',
    example: "'ExifCmdLine --all --filename=FOO.jpeg' or 'ExifCmdLine -a -f BAR.jpg'"
  })
  argv.option({
    name: 'zone',
    short: 'z',
    type: 'string',
    description: 'Timezone to display full date times as. Not applied to date only values nor --all output',
    example: "'ExifCmdLine --zone=Asia/Tokyo --filename=FOO.jpeg' or 'ExifCmdLine -z Asia/Tokyo -f BAR.jpg'"
  })
  const args = argv.run()
  if (Object.getOwnPropertyNames(args.options).length === 0) {
    console.log('No command line options supplied. You should supply at minimum filename via -f option.')
    argv.help()
    process.exit(1)
  }
  if (((Object.getOwnPropertyNames(args.options).length < 1) ||
    (Object.getOwnPropertyNames(args.options).length > 3)) ||
    (args.options.filename === null)) {
    console.log('Please provide at least --filename option, and maximum of --filename, --zone and --all options.')
    argv.help()
    process.exit(2)
  }
  processFileExif(args.options.filename, args.options.zone, !!args.options.all)
}

/**
 * Attempts to read EXIF data from given file.
 * If data is extracted, calls logging function.
 *
 * @param {*} filename of image to attempt to read EXIF data from
 * @param {string} (optional) IANA timezone string to display full date times as
 * @param {boolean} whether to output all exif data or just dates
 */
async function processFileExif(filename, zone, all) {
  const exif = await exifr.parse(filename)
  if (exif) {
    logExifDates(exif, zone, all)
  } else {
    try {
      /* eslint-disable */
      new ExifImage({ image: filename }, function (error, exifData) {
        /* eslint-enable */
        if (error) {
          console.log('Error: ' + error.message)
        } else {
          logExifDates(exifData, zone, all)
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
 */
function logExifDates(exif, zone, all) {
  if (exif) {
    // we flatten as ExifImage provides nested objects in output, whereas exifr does not.
    const flatExif = flatten(exif)
    Object.keys(flatExif)
      .sort()
      .forEach(function (flatExifKey, i) {
        if (flatExifKey.toUpperCase().indexOf('DATE') > -1) {
          const dateVal = flatExif[flatExifKey]
          let luxonDateTime, luxonDate
          if (Object.prototype.toString.call(dateVal) === '[object Date]') {
            luxonDateTime = DateTime.fromJSDate(dateVal)
          } else if (typeof flatExif[flatExifKey] === 'string') {
            if (flatExifKey === 'GPSDateStamp') {
              luxonDate = DateTime.fromFormat(flatExif[flatExifKey], 'yyyy:MM:dd')
            } else {
              luxonDateTime = DateTime.fromISO(dateVal)
            }
          }
          if (luxonDateTime) {
            if (zone) {
              console.log('%s: %s (%s)', flatExifKey, luxonDateTime.setZone(zone).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS), zone)
            } else {
              console.log('%s: %s', flatExifKey, luxonDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS))
            }
          } else if (luxonDate) {
            console.log('%s: %s', flatExifKey, luxonDate.toLocaleString(DateTime.DATE_FULL))
          } else {
            console.log('%s: %s', flatExifKey, dateVal)
          }
        }
      })
    if (all) console.log(exif)
  } else {
    console.log('Error - null exif')
  }
}

// invoke the application
start()
