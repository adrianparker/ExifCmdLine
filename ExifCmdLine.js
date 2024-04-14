#!/usr/bin/env node --no-warnings

import exifr from 'exifr'
import ExifImage from 'exif'
import argv from 'argv'
import file from './package.json' with { type: "json" }

/**
 * Validates command line arguments and if they look correct, invokes EXIF extraction. 
 * Otherwise will output some information on correct invocation and exits.
 */
function start() {
  console.log('ExifCmdLine v ' + file.version)
  argv.version(file.version)
  argv.option({
    name: 'filename',
    short: 'f',
    type: 'path',
    description: 'Path of image file',
    example: "'ExifCmdLine --filename=FOO.jpeg' or 'ExifCmdLine -f BAR.jpg'"
  })
  let args = argv.run()
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
  processFileExif (args.options.filename)
}

/**
 * 
 * @param {*} filename 
 */
async function processFileExif (filename) {
  const exif = await exifr.parse(filename)
  if (exif) {
    //console.log('Using exifr...')
    logExifData(exif)
  } else {
    try {
      new ExifImage({ image: filename }, function (error, exifData) {
        if (error)
          console.log('Error: ' + error.message);
        else
          //console.log('Using ExifImage...')
          logExifData(exifData)
      });

    } catch (error) {
      console.log('Error: ' + error);
    }
  }
}

start()

function logExifData(exif) {
  if(exif){
    //console.log(exif)
    Object.keys(exif)
      .sort()
      .forEach(function (v, i) {
        if (v.toUpperCase().indexOf('DATE') > -1) {
          console.log(v, exif[v])
        }
      })
  }
}

