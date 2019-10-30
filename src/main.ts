/**
 * This module is just a simple entry point, providing a rudimentary CLI.
 */

/**
 * For local testing: the base to the test URL-s. The CLI argument is appended to this URL as `test_{arg}.json` and is expected to point at
 * a bona fide publication manifest
 */
const base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';

/**
 * For local testing: default if no argument is given on the command line.
 */
const default_test = 'lo';

import { generate_representation } from "./process";
import { Logger } from "./utilities";



/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
async function main(url: string) {
    const logger = new Logger();
    try {
        const manifest_object = await generate_representation(url, '', logger);
        console.log(JSON.stringify(manifest_object, null, 4))
        console.log(logger.toString());
    } catch(e) {
        console.log(e)
    }
}

// Look at the process.argv for arguments
// print process.argv
const test_url = (process.argv[2] !== undefined) ? `${base}test_${process.argv[2]}.jsonld` : `${base}test_${default_test}.jsonld`;
main(test_url);



