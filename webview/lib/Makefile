lib = ../../dist/src/
modules = $(lib)/audiobooks.js $(lib)/bridge.js $(lib)/process.js $(lib)/manifest.js $(lib)/process.js $(lib)/lib/discovery.js $(lib)/lib/profile.js $(lib)/lib/terms.js $(lib)/lib/utilities.js

../js/pm.js : main.js $(modules)
	browserify main.js > ../js/pm.js
	terser ../js/pm.js > ../js/pm.min.js
