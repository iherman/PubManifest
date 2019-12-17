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

/** Base URL for all files, this should be adapted to the local environment... */
const test_base_general = 'http://localhost:8001/LocalData/github/Publishing/publ-tests/publication_manifest/manifest_processing/tests';
const test_base_audio = 'http://localhost:8001/LocalData/github/Publishing/publ-tests/audiobooks/manifest_processing/tests';
const test_base_toc = 'http://localhost:8001/LocalData/github/Publishing/publ-tests/publication_manifest/toc_processing/tests';

import { process_manifest, ProcessResult } from '../src/process';
import { URL } from '../src/manifest';
import { fetch_json } from '../src/lib/discovery';

// All calls use these two profiles in the caller
import { Profile, default_profile } from '../src/lib/profile';
import { audiobook_profile } from '../src/audiobooks';
import { processedToString } from '../src/bridge';


import * as _ from 'underscore';

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
    "media-type"?: string;

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
    date: string;

    /** Base URL; it is combined with the `id` value in [[Test]] to set the final URL of the tests */
    href: URL;
    tests: SectionTests[];
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
 * @param prefix - prefix added to the id of the test for the file name
 */
async function get_tests(file_name: string, prefix: string): Promise<FlattenedSuite> {
    const process_doc_tests = (doc_test: DocumentTests) => {
        const base = `${file_name.split('/').slice(0,-1).join('/')}/`;

        doc_test.tests.forEach((section_tests: SectionTests): void => {
            section_tests.tests.forEach((test: Test): void => {
                test.url = (test['media-type'] && test['media-type'] === 'text/html') ? `${base}${prefix}${test.id}.html` : `${base}${prefix}${test.id}.jsonld`;
                flattened_suite[`${test.id}`] = test;
            })
        });
    }

    const index_body: string = await fetch_json(file_name);
    const test_suite: DocumentTests = JSON.parse(index_body);

    const flattened_suite: FlattenedSuite = {};
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
async function run_test(url: URL) {
    try {
        const results: ProcessResult = await process_manifest(url, test_profiles, true);
        console.log(processedToString(results));
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
    const g_tests = async (flag: string): Promise<FlattenedSuite> => {
        let test_base: string;
        let prefix: string = '';
        switch (flag) {
            case 'm':
                test_base = test_base_general;
                prefix = 'test_';
                break;
            case 'a':
                test_base = test_base_audio;
                prefix = 'test_';
                break;
            case 's':
            case 'c':
                test_base = test_base_toc
                break;
        };
        const retval = await get_tests(`${test_base}/index.json`, prefix)
        return retval;
    }
    const preamble_run_test = async (name: string)=> {
        if (name[0] === 'm' || name[0] === 'a' || name[0] === 's' || name[0] === 'c') {
            const tests: FlattenedSuite = await g_tests(name[0]);
            run_test(tests[name].url);
        } else {
            throw new Error('Abnormal test id...');
        }
    }

    try {
        if (process.argv && process.argv.length > 2) {
            if (process.argv[2] === '-sm' || process.argv[2] === '-sa') {
                const label = process.argv[2][2];
                const tests = await g_tests(label);
                const scores = generate_scores(tests);
                console.log(JSON.stringify(scores, null, 4));
            } else if (process.argv[2] === '-l') {
                // run a local test that is not registered in the official test suite
                run_test(process.argv[3]);
            } else {
                preamble_run_test(process.argv[2]);
            }
        } else {
            preamble_run_test('m4.01');
        }
    } catch(e) {
        console.log(`Something went very wrong: ${e.message}`);
        process.exit(1);
    }
}

main();
