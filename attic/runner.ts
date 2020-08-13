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
 *http://localhost:8001/LocalData/github/Publishing/pub_manifest_api_tests/tests/index.json
 */
/** Base URL for all files, this should be adapted to the local environment... */
const test_base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';

import { process_manifest, ProcessResult } from '../src/process';
import { URL } from '../src/manifest';

// All calls use these two profiles in the caller
import { Profile, default_profile } from '../src/lib/profile';
import { audiobook_profile } from '../src/audiobooks';
import * as _ from 'underscore';
import { fetch_json } from "../src/lib/discovery";

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

    /** This is not used in the JSON file, only during processing; URL of the test */
    url?: URL;
};

/**
 * Interface for all tests related to a (specification) _section_ with the title in `section` and the URL in `ref`
 */
interface SectionTests {
    /** Section or sections of the document */
    section: string | string[];

    /** URL(s) of the sections */
    href: URL | URL[];

    /** The tests themselves */
    tests: Test[];
}

/**
 * The full test suite for a document
 */
interface DocumentTests {
    title: string;

    /** Base URL; it is combined with the `id` value in [[Test]] to set the final URL of the tests */
    href: URL;

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
    audiobooks: DocumentTests;
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
 * @async
 * @param file_name - name of the test manifest file
 */
async function get_tests(file_name: string): Promise<FlattenedSuite> {
    const process_doc_tests = (doc_test: DocumentTests) => {
        let base: string;
        // For local use, the base should be set to localhost...
        if (doc_test.href === 'https://www.w3.org/TR/pub-manifest/') {
            base = `${test_base}generic/`;
        } else {
            base = '${test_base}audiobooks/'
        }

        doc_test.tests.forEach((section_tests: SectionTests): void => {
            section_tests.tests.forEach((test: Test): void => {
                test.url = (test.format && test.format === 'html') ? `${base}test_${test.id}.html` : `${base}test_${test.id}.jsonld`;
                flattened_suite[`${test.id}`] = test;
            })
        });
    }

    const index_body: string = await fetch_json(`${test_base}${file_name}`);
    const test_suite: TestSuite = JSON.parse(index_body);

    const flattened_suite: FlattenedSuite = {};
    process_doc_tests(test_suite.generic);
    process_doc_tests(test_suite.audiobooks);
    return flattened_suite;
}


/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class on standard output, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
async function run_test(url: URL) {
    try {
        const results: ProcessResult = await process_manifest(url, test_profiles, true);
        console.log(JSON.stringify(results.manifest_object, (key, value) =>  key === '$terms' ? undefined : value, 4));
        console.log(results.logger.toString());
    } catch(e) {
        console.log(`Something went wrong: ${e.message}`);
        process.exit(1);
    }
}

/**
 * Generate score object, to be submitted to the test suite reporting
 *
 * @param all_tests
 */
function generate_scores(all_tests: FlattenedSuite): any {
    let retval = {} as any;
    retval.$name        = "PubManifest";
    retval.$description = "Test implementation of the algorithm in Typescript.";
    retval.$href        = "https://github.com/iherman/PubManifest/";
    const keys = _.allKeys(all_tests);
    keys.forEach((key: string): void => {
        retval[key] = true;
    })
    return retval;
}

/**
 *
 * Run a test, or dump a general score object on the standard output. The choice depends on the -s flag of the command line.
 *
 * @async
 */
async function main() {
    // This is the local test run
    const tests: FlattenedSuite = await get_tests('index.json');

    if (process.argv && process.argv.length >= 2) {
        if (process.argv[2] === '-s') {
            // print scores
            const scores = generate_scores(tests);
            console.log(JSON.stringify(scores, null, 4));
        } else {
            run_test(tests[process.argv[2]].url);
        }
    } else {
        run_test(tests['m4.01'].url);
    }
}


main();
