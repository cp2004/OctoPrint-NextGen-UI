# Next Gen UI

**Proof Of Concept OctoPrint UI with React & Material UI**

**This UI is *not for production use*, it will explode if you try to do anything more than test it**

**It does not indicate any upcoming features to OctoPrint, my plugins nor does it suggest that
this UI may ever be available for production use.**

If you are a professional JavaScript/React developer, please turn away and save yourself some pain.

## Install
```
https://github.com/cp2004/OctoPrint-NextGen-UI/releases/latest/download/release.zip
```

## Usage

Don't use it...

If you must: Install the plugin, then add `?nextgen` on to the URL, like `http://localhost:5000/?nextgen`. Then it should open the alternative UI.

## Development

Frontend development is done using Create React App, to take advantage of things like auto-reloading.
To start the dev server, after installing dependencies:
```
npm run start
```

The development server will (by default) run on `http://localhost:3000`, but OctoPrint is running on a separate server.
To avoid issues, a proxy is configured which will proxy all requests unknown to `http://localhost:5000`. Adjust for your
development environment in **both** `nextgenui/package.json` and the top of `nextgenui/src/components/Main.js`, for the socket.

To build a release, and copy the output into the OctoPrint plugin:
```
npm run release
```

When a release is built, the UI is served under `/?nextgen` to access it.
