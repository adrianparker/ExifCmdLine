#!/usr/bin/env node

import exifr from 'exifr'
import ExifImage from 'exif'
import argv from 'argv'
import { flatten } from 'flat'
// when eslint can handle JSON module imports
// import packageJSON from './package.json' with { type: "json" }
const packageJSON = {
  version: '0.0.4'
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
    description: 'If all EXIF should be output, not just dates. BEFORE -f argument',
    example: "'ExifCmdLine --all --filename=FOO.jpeg' or 'ExifCmdLine -a -f BAR.jpg'"
  })
  const args = argv.run()
  if (Object.getOwnPropertyNames(args.options).length === 0) {
    console.log('No command line options supplied. You should supply at minimum filename via -f option.')
    argv.help()
    process.exit(1)
  }
  if (((Object.getOwnPropertyNames(args.options).length < 1) ||
    (Object.getOwnPropertyNames(args.options).length > 2)) ||
    (args.options.filename === null)) {
    console.log('Please provide at least filename command line option, and maximum of filename and all options.')
    argv.help()
    process.exit(2)
  }
  processFileExif(args.options.filename, !!args.options.all)
}

/**
 * Attempts to read EXIF data from given file. If the first attemp to read using exifr does not work, tries using ExifImage.
 * If data is extracted, calls logging function.
 * @param {*} filename of image to attempt to read EXIF data from
 * @param {boolean} whether to output all exif data or just dates
 */
async function processFileExif(filename, all) {
  const exif = await exifr.parse(filename)
  if (exif) {
    logExifDates(exif, all)
  } else {
    try {
      /* eslint-disable */
      new ExifImage({ image: filename }, function (error, exifData) {
        /* eslint-enable */
        if (error) {
          console.log('Error: ' + error.message)
        } else {
          logExifDates(exifData, all)
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
 * @param {boolean} whether to output all exif data
 */
function logExifDates(exif, all) {
  if (exif) {
    if (all) console.log(exif)
    // we flatten as ExifImage provides nested objects in output, whereas exifr does not.
    const flatExif = flatten(exif)
    Object.keys(flatExif)
      .sort()
      .forEach(function (v, i) {
        if (v.toUpperCase().indexOf('DATE') > -1) {
          console.log(v, flatExif[v])
        }
      })
  } else {
    console.log('Error - null exif')
  }
}

// invoke the application
start()
