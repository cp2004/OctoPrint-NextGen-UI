/*
 * Copies files from build into the plugin for distribution
 */

// Check if static is empty

const fs = require("fs")
const path = require("path")

const pluginStaticPath = path.join(__dirname, "../octoprint_nextgenui/static")
console.log(pluginStaticPath)

if (fs.existsSync(pluginStaticPath)){
    fs.rmdirSync(pluginStaticPath, {recursive: true})
}

const copydir = require("copy-dir")
copydir.sync("./build", "../octoprint_nextgenui/static")
