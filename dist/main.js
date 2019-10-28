"use strict";
/**
 * Implementation (with minor omission, see comments) of the Processing steps as defined in
 * [§4 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing).
 *
 * Because the primary goal of all this is checking the processing algorithm,
 * there is (currently) no implementation of the extraction from an HTML file or handling extensions. Accordingly,
 * the "Add HTML Defaults" step ([§4.4.3](https://www.w3.org/TR/pub-manifest/#dfn-add-html-defaults)) is not implemented either.
 *
 * Implementation specificities:
 *
 * - when the document says 'failure is returned', this appears in the code as returning the Javascript value `undefined` or, when the function returns a boolean, `false`.
 * - the 'context' is implemented via one of the `*_Impl` class instances corresponding to the TS Interface definitions for the internal representations. All these classes have a reference to a [[Terms]] instance that classifies the terms defined for that class (type).
 * Note, however, that the HTML related functions (e.g., extracting `<title>`) is _not_ implemented
 * at this point.
 *
 * Also, the implementation is a bit more complicated than it would be in Javascript, mainly due to the requirements of Typescript.
 * For example, the original object, parsed from JSON, cannot be directly modified and returned as `processed`; instead, Typescript classes, duly defined as
 * implementing the Typescript interfaces, must be created with the key/values set.
 *
 * This module is just a simple entry point, providing a rudimentary CLI.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * For local testing: the base to the test URL-s. The CLI argument is appended to this URL as `test_{arg}.json` and is expected to point at
 * a bona fide publication manifest
 */
const base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';
/**
 * For local testing: default if no argument is given on the command line.
 */
const default_test = 'lo';
const process_1 = require("./process");
const utilities_1 = require("./utilities");
/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
function main(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new utilities_1.Logger();
        try {
            const manifest_object = yield process_1.generate_representation(url, '', logger);
            console.log(JSON.stringify(manifest_object, null, 4));
            console.log(logger.toString());
        }
        catch (e) {
            console.log(e);
        }
    });
}
// Look at the process.argv for arguments
// print process.argv
const test_url = (process.argv[2] !== undefined) ? `${base}test_${process.argv[2]}.json` : `${base}test_${default_test}.json`;
main(test_url);
//# sourceMappingURL=main.js.map