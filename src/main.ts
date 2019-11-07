/**
 * This module is just a simple entry point, providing a rudimentary CLI.
 */

/**
 * For local testing: the base to the test URL-s. The CLI argument is appended to this URL as `test_{arg}.json` and is expected to point at
 * a bona fide publication manifest
 */
import { generate_internal_representation } from "./process";
import { Logger } from "./utilities";
import { URL } from "./manifest";
import { GenerationArguments, discover_manifest } from './manifest_discovery';
import { PublicationManifest } from './manifest';

/**
 * The result of processing a manifest: the generated object as a [[PublicationManifest]] implementation as well as a [[Logger]] instance with the (possible) error messages.
 */
interface ProcessResult {
    manifest_object: PublicationManifest;
    logger: Logger;
}

/**
 * Process a manifest:
 *
 * 1. discover the manifest, per [§4 Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery)
 * 2. generate a publication manifest object, per [§5 Processing a Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing)
 *
 * @async
 * @param url - The address of either the JSON file or the Primary entry point in HTML
 * @return - the generated manifest object and a logger
 */
export async function process_manifest(url: URL): Promise<ProcessResult> {
    const logger = new Logger();
    let manifest_object = {} as PublicationManifest;

    let args: GenerationArguments;
    try {
        args = await discover_manifest(url);
    } catch(err) {
        logger.log_fatal_error(`The manifest could not be discovered (${err.message})`);
        return {manifest_object, logger}
    }

    try {
        manifest_object = await generate_internal_representation(args, logger);
    } catch(err) {
        logger.log_fatal_error(`Some extra error occurred during generation (${err.message})`);
    }
    return {manifest_object, logger}
}


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
async function test(url: string) {
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
