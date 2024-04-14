#!/usr/bin/env node

import exifr from 'exifr'
import ExifImage from 'exif'
import argv from 'argv'
import { flatten } from 'flat'
import { readFileSync } from 'fs'
const packageJSON = JSON.parse(readFileSync('./package.json'))

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
  const args = argv.run()
  if (Object.getOwnPropertyNames(args.options).length === 0) {
    console.log('No command line options supplied. You should supply at minimum filename via -f option.')
    argv.help()
    process.exit(1)
  }
  if ((Object.getOwnPropertyNames(args.options).length !== 1) ||
    (args.options.filename === null)) {
    console.log('Please provide only filename command line option.')
    argv.help()
    process.exit(2)
  }
  processFileExif(args.options.filename)
}

/**
 * Attempts to read EXIF data from given file. If the first attemp to read using exifr does not work, tries using ExifImage.
 * If data is extracted, calls logging function.
 * @param {*} filename of image to attempt to read EXIF data from
 */
async function processFileExif(filename) {
  const exif = await exifr.parse(filename)
  if (exif) {
    logExifDates(exif)
  } else {
    try {
      /* eslint-disable */
      new ExifImage({ image: filename }, function (error, exifData) {
        /* eslint-enable */
        if (error) {
          console.log('Error: ' + error.message)
        } else {
          logExifDates(exifData)
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
 */
function logExifDates(exif) {
  if (exif) {
    // we flatten as ExifImage provides nested objects in output, whereas exifr does not.
    const flatExif = flatten(exif)
    Object.keys(flatExif)
      .sort()
      .forEach(function (v, i) {
        if (v.toUpperCase().indexOf('DATE') > -1) {
          console.log(v, flatExif[v])
        }
      })
  }
}

// invoke the application
start()
