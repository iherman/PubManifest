"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple test runner. It is based on the test manifest stored in [index.yaml](https://github.com/iherman/PubManifest/tests/index.yaml),
 * and uses (for the time being) a rudimentary CLI: the runner should be invoked with the test number, which executes [[process_manifest]] on that test entry,
 * displays the resulting processed manifest, as well as the validation and fatal errors as defined in the specification.
 *
 */
/** The configuration file is in YAML, need this input */
const yamljs_1 = __importDefault(require("yamljs"));
const fs = require('fs');
const process_1 = require("../src/process");
// All calls use these two profiles in the caller
const profile_1 = require("../src/lib/profile");
const audiobooks_1 = require("../src/audiobooks");
const test_profiles = [audiobooks_1.audiobook_profile, profile_1.default_profile,];
;
/**
 * Generate a flattened version of the test suite, setting the URL of each test on the fly.
 *
 * @param file_name - name of the test manifest file
 */
function get_tests(file_name) {
    const test_suite = yamljs_1.default.parse(fs.readFileSync(file_name, 'utf-8'));
    const base = test_suite.url;
    const flattened_suite = {};
    test_suite.tests.forEach((section_tests) => {
        section_tests.tests.forEach((test) => {
            test.url = (test.format && test.format === 'html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
            flattened_suite[`${test.id}`] = test;
        });
    });
    return flattened_suite;
}
/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
async function run_test(url) {
    try {
        const results = await process_1.process_manifest(url, test_profiles);
        console.log(JSON.stringify(results.manifest_object, null, 4));
        console.log(results.logger.toString());
    }
    catch (e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}
// This is the local test run
const tests = get_tests('tests/index.yaml');
const test_index = process.argv[2] || "0";
run_test(tests[test_index].url);
//# sourceMappingURL=runner.js.map