"use strict";
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
 * @author Ivan Herman <ivan@w3.org>
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/** Base URL for all files, this should be adapted to the local environment... */
const test_base_general = 'http://localhost:8001/LocalData/github/Publishing/publ-tests/publication_manifest/manifest_processing/tests';
const test_base_audio = 'http://localhost:8001/LocalData/github/Publishing/publ-tests/audiobooks/manifest_processing/tests';
const process_1 = require("../src/process");
const discovery_1 = require("../src/lib/discovery");
// All calls use these two profiles in the caller
const profile_1 = require("../src/lib/profile");
const audiobooks_1 = require("../src/audiobooks");
const bridge_1 = require("../src/bridge");
const _ = __importStar(require("underscore"));
const test_profiles = [audiobooks_1.audiobook_profile, profile_1.default_profile];
;
/**
 * Generate a flattened version of the test suite, setting the URL of each test on the fly.
 *
 * @async
 * @param file_name - name of the test manifest file
 */
async function get_tests(file_name) {
    const process_doc_tests = (doc_test) => {
        const base = `${file_name.split('/').slice(0, -1).join('/')}/`;
        doc_test.tests.forEach((section_tests) => {
            section_tests.tests.forEach((test) => {
                test.url = (test['media-type'] && test['media-type'] === 'text/html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
                flattened_suite[`${test.id}`] = test;
            });
        });
    };
    const index_body = await discovery_1.fetch_json(file_name);
    const test_suite = JSON.parse(index_body);
    const flattened_suite = {};
    process_doc_tests(test_suite);
    return flattened_suite;
}
/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class on standard output, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
async function run_test(url) {
    try {
        const results = await process_1.process_manifest(url, test_profiles, true);
        console.log(bridge_1.processedToString(results));
    }
    catch (e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}
/**
 * Generate score object, to be submitted to the test suite reporting
 *
 * @param all_tests
 */
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
/**
 *
 * Run a test, or dump a general score object on the standard output. The choice depends on the -s flag of the command line.
 *
 * @async
 */
async function main() {
    const g_tests = async (flag) => {
        const retval = (flag === 'm') ? await get_tests(`${test_base_general}/index.json`) : await get_tests(`${test_base_audio}/index.json`);
        return retval;
    };
    const preamble_run_test = async (name) => {
        if (name[0] === 'm' || name[0] === 'a') {
            const tests = await g_tests(name[0]);
            run_test(tests[name].url);
        }
        else {
            throw new Error('Abnormal test id...');
        }
    };
    try {
        if (process.argv && process.argv.length > 2) {
            if (process.argv[2] === '-sm' || process.argv[2] === '-sa') {
                const label = process.argv[2][2];
                const tests = await g_tests(label);
                const scores = generate_scores(tests);
                console.log(JSON.stringify(scores, null, 4));
            }
            else if (process.argv[2] === '-l') {
                // run a local test that is not registered in the official test suite
                run_test(process.argv[3]);
            }
            else {
                preamble_run_test(process.argv[2]);
            }
        }
        else {
            preamble_run_test('m4.01');
        }
    }
    catch (e) {
        console.log(`Something went very wrong: ${e.message}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runner.js.map