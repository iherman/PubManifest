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
 * "Bridge" between the generic script and a Web page: event handlers to process a manifest file from within an HTML file.
 *
 */
/** The main entries needed to process the manifest */
const process_1 = require("./process");
// All calls use these two profiles in the caller
const profile_1 = require("./lib/profile");
const audiobooks_1 = require("./audiobooks");
const yaml = __importStar(require("yaml"));
const utilities_1 = require("./lib/utilities");
/** Profiles made available through the bridge */
const bridge_profiles = [audiobooks_1.audiobook_profile, profile_1.default_profile];
/**
 * Create a human readable version of the processing results: convert all data into Yaml, and
 * return the generated text
 *
 * @param result - the result of the processing
 * @returns - processed manifest in Yaml and, if not empty, a Yaml version of the [[Logger]] instance
 */
function processedToString(result) {
    const retval = yaml.stringify(result.manifest_object);
    if (!result.logger.isEmpty()) {
        const separator = '\n--- \n# Errors, warnings:\n\n';
        const log = yaml.stringify(result.logger);
        return `${retval}${separator}${log}`;
    }
    else {
        return retval;
    }
}
exports.processedToString = processedToString;
/**
 * Wrapper around the core generation algorithm ([[generate_internal_representation]]) and a conversion of the results into Yaml (in [[processedToString]]).
 *
 * @param json - the JSON string, representing the manifest
 * @param base - the base URL to be used for the processing
 * @returns - human readable, ie, Yaml version of the processing results and, if not empty, the [[Logger]] instance
 */
function generate_from_json_content(json, base = '') {
    const arg = {
        document: undefined,
        base: base,
        text: json
    };
    const logger = new utilities_1.Logger();
    const manifest_object = process_1.generate_internal_representation(arg, logger, bridge_profiles);
    return processedToString({ manifest_object, logger });
}
/**
 * Event handler to convert the content of the `pm_holder` text area and put the result to the `processed_pm` box.
 *
 * This function is ran when the 'process' button is clicked.
 */
function convert() {
    const pm_holder = document.getElementById('pm_holder');
    try {
        if (pm_holder.value !== '') {
            const processed_pm = document.getElementById('processed_pm');
            const data = pm_holder.dataset;
            const result = generate_from_json_content(pm_holder.value, data.url);
            processed_pm.value = result;
        }
    }
    catch (err) {
        console.error(`Error in processing: ${err.message} in ${err.lineNumber}`);
        alert(`Error in processing: ${err.message} in ${err.lineNumber}`);
    }
}
exports.convert = convert;
/**
 * Event handler to read a file from the local machine, and putting its (text) content to the `pm_holder` text area.
 *
 */
function upload_pm(e) {
    const target = e.target;
    const file = target.files[0];
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
        const pm_holder = document.getElementById('pm_holder');
        pm_holder.value = reader.result;
        pm_holder.dataset.url = `file:///${file.name}/`;
        document.getElementById('processed_pm').value = '';
        document.getElementById('pm_url').value = '';
    });
    reader.readAsText(file);
}
exports.upload_pm = upload_pm;
/**
 * Event handler to fetch a JSON via its URL, and put the resulting content into the `pm_holder` text area.
 *
 * @async
 */
async function fetch_pm(e) {
    try {
        const target = e.target;
        const pm_url = target.value;
        const pm_holder = document.getElementById('pm_holder');
        // const json = await fetch_json(pm_url);
        const json = await fetch(pm_url).then((response) => response.text());
        pm_holder.value = json;
        pm_holder.dataset.url = pm_url;
        document.getElementById('processed_pm').value = '';
    }
    catch (err) {
        console.error(`Error in get_pm: ${err.message}`);
        alert(`Error in get_pm: ${err.message}`);
    }
}
exports.fetch_pm = fetch_pm;
//# sourceMappingURL=bridge.js.map