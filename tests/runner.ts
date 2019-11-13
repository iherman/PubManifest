/**
 * Simple test runner. It is based on the test manifest stored in [index.yaml](https://github.com/iherman/PubManifest/tests/index.yaml),
 * and uses (for the time being) a rudimentary CLI: the runner should be invoked with the test number, which executes [[process_manifest]] on that test entry,
 * displays the resulting processed manifest, as well as the validation and fatal errors as defined in the specification.
 *
 */
/** The configuration file is in YAML, need this input */
import yaml from 'yamljs';
const fs = require('fs');
import { process_manifest, ProcessResult } from "../src/process";
import { URL } from "../src/manifest";

// All calls use these two profiles in the caller
import { Profile, default_profile } from '../src/lib/profile';
import { audiobook_profile } from '../src/audiobooks';

const test_profiles: Profile[] = [audiobook_profile, default_profile];


/**
 * Interface for a single test. The `format` key defines whether the test is an HTML or a JSON-LD file.
 *
 * Note that the test manifest entry does not include the `url` value; this is calculated run-time.
 */
interface Test {
    id: Number;
    format?: string;
    description: string;
    actions: string;
    errors: string;
    url?: URL;
    success?: boolean;
};

/**
 * Interface for all tests related to a (specification) section with the title in `section` and the URL in `ref`
 */
interface SectionTests {
    section: string | string[];
    ref: URL | URL[];
    tests: Test[];
}

/**
 * The full test suite.
 */
interface TestSuite {
    title: string;
    date: string;
    url: URL;
    tests: SectionTests[];
}

/**
 * The preprocessing creates a flattened version of the test suite, keyed by the (string version of) each test.
 */
interface FlattenedSuite {
    [index: string]: Test
}

/**
 * Generate a flattened version of the test suite, setting the URL of each test on the fly.
 *
 * @param file_name - name of the test manifest file
 */
function get_tests(file_name: string): FlattenedSuite {
    const test_suite: TestSuite = yaml.parse(fs.readFileSync(file_name, 'utf-8'));
    const base = test_suite.url;
    const flattened_suite: FlattenedSuite = {};
    test_suite.tests.forEach((section_tests: SectionTests): void => {
        section_tests.tests.forEach((test: Test): void => {
            test.url = (test.format && test.format === 'html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
            flattened_suite[`${test.id}`] = test;
        })
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
async function run_test(url: URL) {
    try {
        const results: ProcessResult = await process_manifest(url, test_profiles);
        console.log(JSON.stringify(results.manifest_object, null, 4));
        console.log(results.logger.toString());
    } catch(e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}

// This is the local test run
const tests = get_tests('tests/index.yaml');
const test_index = process.argv[2] || "0";
run_test(tests[test_index].url);
