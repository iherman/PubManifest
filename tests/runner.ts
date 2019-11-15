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
import yaml from 'yamljs';
const fs = require('fs');
import { process_manifest, ProcessResult } from '../src/process';
import { URL } from '../src/manifest';

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
    /** Identifier to the test (is combined with the document's test URL to set the URL of the test) */
    id: Number;

    /** Format of the test; default is jsonld, can be set to `html` */
    format?: string;

    /** Some words about the test */
    description: string;

    /** Expected effect */
    actions: string;

    /** Expected validation and/or fatal errors */
    errors: string;

    /** This is not used in the YAML file, only during processing; URL of the test */
    url?: URL;
};

/**
 * Interface for all tests related to a (specification) _section_ with the title in `section` and the URL in `ref`
 */
interface SectionTests {
    /** Section or sections of the document */
    section: string | string[];

    /** URL(s) of the sections */
    ref: URL | URL[];

    /** The tests themselves */
    tests: Test[];
}

/**
 * The full test suite for a document
 */
interface DocumentTests {
    title: string;

    /** Base URL; it is combined with the `id` value in [[Test]] to set the final URL of the tests */
    url: URL;

    tests: SectionTests[];
}

/**
 * A full test suite
 */
interface TestSuite {
    title: string;
    date: string;

    /** Tests for the basic manifest algorithm */
    generic: DocumentTests;

    /** Specific tests for the audiobook tests */
    audio: DocumentTests;
}

/**
 * The preprocessing creates a flattened version of the test suite, keyed by the id each test.
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
    const process_doc_tests = (doc_test: DocumentTests) => {
        const base = doc_test.url;
        doc_test.tests.forEach((section_tests: SectionTests): void => {
            section_tests.tests.forEach((test: Test): void => {
                test.url = (test.format && test.format === 'html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
                flattened_suite[`${test.id}`] = test;
            })
        });
    }

    const test_suite: TestSuite = yaml.parse(fs.readFileSync(file_name, 'utf-8'));
    // console.log(JSON.stringify(test_suite, null, 4)); process.exit(0)


    const flattened_suite: FlattenedSuite = {};
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
async function run_test(url: URL) {
    try {
        const results: ProcessResult = await process_manifest(url, test_profiles, true);
        console.log(JSON.stringify(results.manifest_object, null, 4));
        console.log(results.logger.toString());
    } catch(e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}

// This is the local test run
const tests = get_tests('tests/index.yaml');
const test_index = process.argv[2] || "m0";
run_test(tests[test_index].url);
