#!/usr/bin/env node

import argv from 'argv'
import { processFileExif } from './fileProcessor.js'
import { logToConsole } from './exifLogger.js'
// when eslint can handle JSON module imports
// import packageJSON from './package.json' with { type: "json" }
const packageJSON = {
  version: '1.0.2'
}

/**
 * Validates command line arguments and if they look OK, invokes EXIF extraction and logs it to console.
 * Otherwise will output some information on correct invocation and exit.
 */
async function start () {
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
  const exifData = await processFileExif(args.options.filename, args.options.zone, !!args.options.all)
  logToConsole(exifData)
}

// invoke the application
start()
