"use strict";
/**
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
const test_url = (process.argv[2] !== undefined) ? `${base}test_${process.argv[2]}.jsonld` : `${base}test_${default_test}.jsonld`;
main(test_url);
//# sourceMappingURL=main.js.map