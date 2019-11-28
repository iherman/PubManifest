/**
 * "Bridge" between the generic script and a Web page: event handlers to process a manifest file from within an HTML file.
 *
 */
/** The main entries needed to process the manifest */
import { process_manifest, ProcessResult, generate_internal_representation } from './process';
import { discover_manifest, GenerationArguments } from './lib/discovery';
// All calls use these two profiles in the caller
import { Profile, default_profile } from './lib/profile';
import { audiobook_profile } from './audiobooks';
import * as yaml from 'yaml';
import { Logger } from './lib/utilities';

/** Profiles made available through the bridge */
const bridge_profiles: Profile[] = [audiobook_profile, default_profile];

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
 * @param json - the JSON string, representing the manifest
 * @param base - the base URL to be used for the processing
 * @returns - human readable, ie, Yaml version of the processing results and, if not empty, the [[Logger]] instance
 */
function generate_from_json_content(json: string, base = ''): string {
    const arg: GenerationArguments = {
        document : undefined,
        base     : base,
        text     : json
    };
    const logger: Logger = new Logger();
    const manifest_object = generate_internal_representation(arg, logger, bridge_profiles);
    return processedToString({manifest_object, logger});
}

/**
 * Event handler to convert the content of the `pm_holder` text area and put the result to the `processed_pm` box.
 *
 * This function is ran when the 'process' button is clicked.
 */
export function convert(): void {
    const pm_holder = document.getElementById('pm_holder') as HTMLTextAreaElement;
    try {
        if (pm_holder.value !== '') {
            const processed_pm = document.getElementById('processed_pm') as HTMLTextAreaElement;
            const data = pm_holder.dataset;
            const result = generate_from_json_content(pm_holder.value, data.url);
            processed_pm.value = result;
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
        const pm_holder = document.getElementById('pm_holder') as HTMLTextAreaElement;
        pm_holder.value = reader.result as string;
        pm_holder.dataset.url = `file:///${file.name}/`;
        (<HTMLTextAreaElement>document.getElementById('processed_pm')).value = '';
        (<HTMLInputElement>document.getElementById('pm_url')).value = '';
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
        // const json = await fetch_json(pm_url);
        const json = await fetch(pm_url).then((response) => response.text());
        pm_holder.value = json;
        pm_holder.dataset.url = pm_url;
        (<HTMLTextAreaElement>document.getElementById('processed_pm')).value = '';
    } catch (err) {
        console.error(`Error in get_pm: ${err.message}`);
        alert(`Error in get_pm: ${err.message}`);
    }
}
