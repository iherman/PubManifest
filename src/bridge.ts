/**
 * "Bridge" between the generic script and a Web page: event handlers to process a manifest file from within an HTML file.
 *
 */
/** The main entries needed to process the manifest */
import { ProcessResult, generate_internal_representation } from './process';
import { discover_manifest, GenerationArguments } from './lib/discovery';
import { Logger } from './lib/utilities';

import * as yaml from 'yaml';

import { Profile, default_profile } from './lib/profile';
import { audiobook_profile } from './audiobooks';

/** Profiles made available through the bridge */
const bridge_profiles: Profile[] = [audiobook_profile, default_profile];

/* It is pretty ugly to use a global variable across event handlers, but I do not have too much simple choices... */
let global_document: HTMLDocument = undefined;


/**
 * Create a human readable version of the processing results: convert all data into Yaml, and
 * return the generated text
 *
 * @param result - the result of the processing
 * @returns - processed manifest in Yaml and, if not empty, a Yaml version of the [[Logger]] instance
 */
export function processedToString(result: ProcessResult): string {
    const retval: string = yaml.stringify(result.manifest_object);
    if (!result.logger.isEmpty()) {
        const separator = '\n--- \n# Errors, warnings:\n\n';
        const log = yaml.stringify(result.logger);
        return `${retval}${separator}${log}`
    } else {
        return retval
    }
}

/**
 * Wrapper around the core generation algorithm ([[generate_internal_representation]]) and a conversion of the results into Yaml (in [[processedToString]]).
 *
 * @async
 * @param json - the JSON string, representing the manifest
 * @param base - the base URL to be used for the processing
 * @returns - human readable, ie, Yaml version of the processing results and, if not empty, the [[Logger]] instance
 */
async function generate_from_pm_holder(json: string, base = ''): Promise<string> {
    const arg: GenerationArguments = {
        document : global_document,
        base     : base,
        text     : json
    };
    const logger: Logger = new Logger();
    const manifest_object = await generate_internal_representation(arg, logger, bridge_profiles);
    return processedToString({manifest_object, logger});
}

/**
 * Event handler to convert the content of the `pm_holder` text area and put the result to the `processed_pm` box.
 *
 * This function is ran when the 'process' button is clicked.
 */
export async function convert(): Promise<void> {
    const pm_holder = document.getElementById('pm_holder') as HTMLTextAreaElement;
    try {
        if (pm_holder.value !== '') {
            const processed_pm = document.getElementById('processed_pm') as HTMLTextAreaElement;
            const pep_url = document.getElementById('pep_url') as HTMLTextAreaElement;
            const data = pm_holder.dataset;
            const result = await generate_from_pm_holder(pm_holder.value, data.url);
            processed_pm.value = result;
            if (global_document === undefined) {
                pep_url.value = ''
            } else {
                pep_url.value = global_document.documentURI;
            }
        }
    } catch (err) {
        console.error(`Error in processing: ${err.message} in ${err.lineNumber}`);
        alert(`Error in processing: ${err.message} in ${err.lineNumber}`);
    }
}

/**
 * Event handler to read a file from the local machine, and putting its (text) content to the `pm_holder` text area.
 *
 */
export function upload_pm(e: InputEvent): void {
    const target = e.target as HTMLInputElement;
    const file: File = target.files[0];
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
        clear();
        const pm_holder = document.getElementById('pm_holder') as HTMLTextAreaElement;
        pm_holder.value = reader.result as string;
        pm_holder.dataset.url = `file:///${file.name}/`;
    });
    reader.readAsText(file);
}

/**
 * Event handler to fetch a JSON via its URL, and put the resulting content into the `pm_holder` text area.
 *
 * @async
 */
export async function fetch_pm(e: InputEvent) {
    try {
        const target = e.target as HTMLInputElement;
        const pm_url = target.value;
        const pm_holder = document.getElementById('pm_holder') as HTMLTextAreaElement;

        const args: GenerationArguments = await discover_manifest(pm_url);

        pm_holder.dataset.url = pm_url;
        global_document = args.document;
        pm_holder.value = args.text;
        (<HTMLTextAreaElement>document.getElementById('processed_pm')).value = '';
        (<HTMLTextAreaElement>document.getElementById('pep_url')).value = '';
    } catch (err) {
        console.error(`Error in get_pm: ${err.message}`);
        alert(`Error in get_pm: ${err.message}`);
    }
}

/**
 * Event handler to clear all result fields.
 */
export function clear() {
    (<HTMLTextAreaElement>document.getElementById('pm_holder')).value = '';
    (<HTMLTextAreaElement>document.getElementById('pep_url')).value = '';
    (<HTMLTextAreaElement>document.getElementById('processed_pm')).value = '';
    global_document = undefined;
}
