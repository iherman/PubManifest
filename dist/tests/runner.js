"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple test runner. It is based on the test manifest stored in [index.yaml](https://github.com/iherman/PubManifest/tests/index.yaml),
 * and uses (for the time being) a rudimentary CLI: the runner should be invoked with the test id, which executes [[process_manifest]] on that test entry,
 * displays the resulting processed manifest, as well as the validation and fatal errors as defined in the specification.
 *
 * The tests themselves are separated into two directories: a generic one for the tests running the algorithm as specified in the
 * core [publication manifest spec](https://www.w3.org/TR/pub-manifest/), and a separate audiobooks one, for tests related to the audiobooks extension, specified
 * by the [audiobooks profile spec](https://www.w3.org/TR/audiobooks/).
 *
 * The structure of the yaml is organized by separate test suites for the two categories (see [[TestSuite]], referring to [[DocumentTests]]).
 * For each document there are some metadata and a series of section tests (see [[SectionTests]]), corresponding to some sections in the specifications. Finally,
 * each section tests is a series of individual tests (see [[Test]]).
 *
 * A test is, usually, a JSON-LD file for a manifest, to make things simpler to test. Alternatively, some tests are in html (the `format` entry in [[Test]] should be set to `html` for those cases), pointing to a Primary Entry Point.
 *
 */
/** The configuration file is in YAML, need this input */
const yamljs_1 = __importDefault(require("yamljs"));
const fs = require('fs');
const process_1 = require("../src/process");
// All calls use these two profiles in the caller
const profile_1 = require("../src/lib/profile");
const audiobooks_1 = require("../src/audiobooks");
const test_profiles = [audiobooks_1.audiobook_profile, profile_1.default_profile];
;
/**
 * Generate a flattened version of the test suite, setting the URL of each test on the fly.
 *
 * @param file_name - name of the test manifest file
 */
function get_tests(file_name) {
    const process_doc_tests = (doc_test) => {
        const base = doc_test.url;
        doc_test.tests.forEach((section_tests) => {
            section_tests.tests.forEach((test) => {
                test.url = (test.format && test.format === 'html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
                flattened_suite[`${test.id}`] = test;
            });
        });
    };
    const test_suite = yamljs_1.default.parse(fs.readFileSync(file_name, 'utf-8'));
    // console.log(JSON.stringify(test_suite, null, 4)); process.exit(0)
    const flattened_suite = {};
    process_doc_tests(test_suite.generic);
    process_doc_tests(test_suite.audio);
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
const test_index = process.argv[2] || "m0";
run_test(tests[test_index].url);
//# sourceMappingURL=runner.js.map