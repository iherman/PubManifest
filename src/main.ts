/**
 * This module is just a simple entry point, providing a rudimentary CLI.
 */

/**
 * For local testing: the base to the test URL-s. The CLI argument is appended to this URL as `test_{arg}.json` and is expected to point at
 * a bona fide publication manifest
 */
import { process_manifest, ProcessResult } from "./process";
import { URL } from "./manifest";


/* ====================================================================================================
 A rudimentary CLI for testing
====================================================================================================== */

/**
 * Base URL for the test suite
 */
const base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';

/**
 * For local testing: default if no argument is given on the command line.
 */
const default_test = 'correct';

/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
async function test(url: URL) {
    try {
        const results: ProcessResult = await process_manifest(url);
        console.log(JSON.stringify(results.manifest_object, null, 4));
        console.log(results.logger.toString());
    } catch(e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}

// Look at the process.argv for arguments
// print process.argv

let test_url;
if (process.argv[2] !== undefined) {
    test_url = process.argv[2].endsWith('.html') ? `${base}${process.argv[2]}` : `${base}test_${process.argv[2]}.jsonld`
} else {
    test_url = `${base}test_${default_test}.jsonld`;
}
test(test_url);
