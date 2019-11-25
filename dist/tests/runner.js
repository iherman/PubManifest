"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple test runner. It is based on the test manifest stored in [index.json](https://github.com/iherman/PubManifest/tests/index.json),
 * and uses (for the time being) a rudimentary CLI: the runner should be invoked with the test id, which executes [[process_manifest]] on that test entry,
 * displays the resulting processed manifest, as well as the validation and fatal errors as defined in the specification.
 *
 * The tests themselves are separated into two directories: a generic one for the tests running the algorithm as specified in the
 * core [publication manifest spec](https://www.w3.org/TR/pub-manifest/), and a separate audiobooks one, for tests related to the audiobooks extension, specified
 * by the [audiobooks profile spec](https://www.w3.org/TR/audiobooks/).
 *
 * The structure of the JSON is organized by separate test suites for the two categories (see [[TestSuite]], referring to [[DocumentTests]]).
 * For each document there are some metadata and a series of section tests (see [[SectionTests]]), corresponding to some sections in the specifications. Finally,
 * each section tests is a series of individual tests (see [[Test]]).
 *
 * A test is, usually, a JSON-LD file for a manifest, to make things simpler to test. Alternatively, some tests are in html (the `format` entry in [[Test]] should be set to `html` for those cases), pointing to a Primary Entry Point.
 *
 */
/** The configuration file is in YAML, need this input */
const fs = require('fs');
const process_1 = require("../src/process");
// All calls use these two profiles in the caller
const profile_1 = require("../src/lib/profile");
const audiobooks_1 = require("../src/audiobooks");
const _ = __importStar(require("underscore"));
const test_profiles = [audiobooks_1.audiobook_profile, profile_1.default_profile];
;
/**
 * Generate a flattened version of the test suite, setting the URL of each test on the fly.
 *
 * @param file_name - name of the test manifest file
 */
function get_tests(file_name) {
    const process_doc_tests = (doc_test) => {
        let base;
        // For local use, the base should be set to localhost...
        if (doc_test.href === 'https://www.w3.org/TR/pub-manifest/') {
            base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/generic/';
        }
        else {
            base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/audiobooks/';
        }
        doc_test.tests.forEach((section_tests) => {
            section_tests.tests.forEach((test) => {
                test.url = (test.format && test.format === 'html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
                flattened_suite[`${test.id}`] = test;
            });
        });
    };
    const test_suite = JSON.parse(fs.readFileSync(file_name, 'utf-8'));
    // console.log(JSON.stringify(test_suite, null, 4)); process.exit(0)
    const flattened_suite = {};
    process_doc_tests(test_suite.generic);
    process_doc_tests(test_suite.audiobooks);
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
        const results = await process_1.process_manifest(url, test_profiles, true);
        console.log(JSON.stringify(results.manifest_object, (key, value) => key === '$terms' ? undefined : value, 4));
        console.log(results.logger.toString());
    }
    catch (e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}
function generate_scores(all_tests) {
    let retval = {};
    retval.$name = "PubManifest";
    retval.$description = "Test implementation of the algorithm in Typescript.";
    retval.$href = "https://github.com/iherman/PubManifest/";
    const keys = _.allKeys(all_tests);
    keys.forEach((key) => {
        retval[key] = true;
    });
    return retval;
}
// This is the local test run
const tests = get_tests('tests/index.json');
if (process.argv && process.argv.length >= 2) {
    if (process.argv[2] === '-s') {
        // print scores
        const scores = generate_scores(tests);
        console.log(JSON.stringify(scores, null, 4));
    }
    else {
        run_test(tests[process.argv[2]].url);
    }
}
else {
    run_test(tests['m4.01'].url);
}
//# sourceMappingURL=runner.js.map