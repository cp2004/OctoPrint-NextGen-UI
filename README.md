# Next Gen UI

**TODO:** Describe what your plugin does.

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/cp2004/OctoPrint-NextGen-UI/archive/master.zip

**TODO:** Describe how to install your plugin, if more needs to be done than just installing it via pip or through
the plugin manager.

## Configuration

**TODO:** Describe your plugin's configuration options (if any).


## Development

Frontend development is done using Create React App, to take advantage of things like auto-reloading.
To start the dev server:
```
npm run start
```

The development server will (by default) run on `http://localhost:3000`, but OctoPrint is running on a separate server.
To avoid issues, a proxy is configured which will proxy all requests unknown to `http://localhost:5000`. Adjust for your
development environment in `package.json` accordingly.

To build a release, and copy the output into the plugin:
```
npm run release
```
