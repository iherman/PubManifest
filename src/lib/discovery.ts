/**
 * Utilities to get hold of the manifest, either by:
 *
 * - retrieving it from an HTML file when embedded via a `<script>` element; or
 * - retrieving it via an HTML file when it is referred to via a `<link>` element; or
 * - retrieving it via a direct reference to a JSON resource
 *
 * This corresponds to the [§6 Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery) section of the specification.
 *
 */
/**
 * This is just a type alias, i.e., a URL is simply a string, but it is better for the function documentations...
 */
export type URL = string;

/** Media type for JSON */
const json_content_type = 'application/json';
/** Media type for JSON-LD */
const jsonld_content_type = 'application/ld+json';
/** Media type for HTML */
const html_content_type = 'text/html';

/**
 * The arguments to be used by the [[generate_internal_representation]] function.
 */
export interface GenerationArguments {
    text: string;
    base: URL;
    document: HTMLDocument
}

import * as node_fetch from 'node-fetch';
import * as urlHandler from 'url';
import * as validUrl   from 'valid-url';
import * as jsdom      from 'jsdom';

/**
 * The effective fetch implementation run by the rest of the code.
 *
 * If the code is ran in a browser, we get an error message whereby
 * only the fetch implementation in the Window is acceptable for the browser. However, there is
 * no default fetch implementation for `node.js`, hence the necessity to import 'node-fetch' for that case.
 *
 * I guess this makes this entry a bit polyfill like:-)
 */
const my_fetch: ((arg:string) => Promise<any>) = (process !== undefined) ? node_fetch.default : fetch;


/**
* Basic sanity check on a URL that is supposed to be used to retrieve a Web Resource.
*
* The function returns a (possibly slightly modified) version of the URL if everything is fine, or a null value if
* the input argument is not a URL (but should be used as a filename).
*
* There might be errors, however, in the case it is a URL.
*
* The checks are as follows:
*
* 1. Check whether the protocol is http(s). Other protocols are not accepted (actually rejected by fetch, too);
* 2. Run the URL through a valid-url check, which looks at the validity of the URL in terms of
*    characters used, for example;
* 3. Check that the port (if specified) is in the allowed range, ie, > 1024;
*
* @param address - the URL to be checked.
* @returns  - the URL itself (which might be slightly improved by the valid-url method) or null if this is, in fact, not a URL
* @throws  if it pretends to be a URL, but it is not acceptable for some reasons.
*/
function check_Web_url(address: URL): URL {
    const parsed = urlHandler.parse(address);
    if (parsed.protocol === null) {
        // This is not a URL, should be used as a file name
        throw new Error(`"${address}": Invalid URL: no protocol`);
    }

    // Check whether we use the right protocol
    if (['http:', 'https:'].includes(parsed.protocol) === false) {
       throw new Error(`"${address}": URL is not dereferencable`);
    }

    // Run through the URL validator
    const retval = validUrl.isWebUri(address);
    if (retval === undefined) {
        throw new Error(`"${address}": the URL isn't valid`);
    }

    // Check the port
    if (parsed.port !== null) {
        try {
            const portNumber = Number(parsed.port);
            if (portNumber <= 1024) {
                throw new Error(`"${address}": Unsafe port number used in URL (${parsed.port})`);
            }
        } catch(e) {
            throw new Error(`"${address}": Invalid port number used in URL (${parsed.port})`);
        }
    }
    // If we got this far, this is a proper URL, ready to be used.
    return retval;
}

/**
 * The types of documents that are considered in this module
 */
enum ContentType {
    json = 'json',
    html = 'html',
};

/**
 * Get Web resource via a fetch. A sanity (security) check of the URL using [[check_Web_url]] is ran to avoid errors.
 *
 * @async
 * @param resource_url - The URL of the resource to be fetched
 * @param format - Expected format. Default is JSON (ie, application/json).  Accepted values are HTML, and JSON (including the 'derivatives', ie, application/XXX+json)
 * @return - Promise encapsulating the body of the resource. The appropriate parsing should be done by the caller
 * @throws Error if something goes wrong with fetch
 */
async function fetch_resource(resource_url: URL, format: ContentType): Promise<any> {
    // If there is a problem, an exception is raised
    return new Promise((resolve, reject) => {
        try {
            // This is a real URL, whose content must be accessed via HTTP(S)
            // An exception is raised if the URL has security/sanity issues.
            const final_url = check_Web_url(resource_url);
            my_fetch(final_url)
                .then((response) => {
                    if (response.ok) {
                        // If the response content type is set (which is usually the case, but not in all cases...)
                        const response_type = response.headers.get('content-type');
                        if (typeof response_type === "string" && response_type) {

                            const responseTypeArray = response_type.replace(/\s/g, '').split(';');
                            // check whether we got what we wanted
                            if (format === ContentType.json) {
                                if (responseTypeArray.find((v) => v === json_content_type || v === jsonld_content_type)) {
                                    resolve(response.text());
                                }
                            } else {
                                // we expect HTML then
                                if (responseTypeArray.includes(html_content_type)) {
                                    resolve(response.text());
                                }
                            }
                            reject(new Error(`unexpected content type, expected ${format === ContentType.json? 'json': 'html'}`));
                        } else {
                            // No type information on return, let us hope this is something proper
                            // TODO: (in case of a full implementation) to do something intelligent if there is no response header content type.
                            resolve(response.text());
                        }
                    } else {
                        reject(new Error(`HTTP response ${response.status}: ${response.statusText}`));
                    }
                })
                .catch((err) => {
                    reject(new Error(`Problem accessing ${final_url}: ${err}`));
                });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 * Fetch an HTML file via [[fetch_resource]] and parse the result into the DOM.
 *
 * @async
 * @param html_url - URL to be fetched
 * @return - DOM object for the parsed HTML
 * @throws Error if something goes wrong with fetch or DOM Parsing
 */
export async function fetch_html(html_url: URL): Promise<jsdom.JSDOM> {
    try {
        const body = await fetch_resource(html_url, ContentType.html);
        const retval = new jsdom.JSDOM(body, { url: html_url });
        return retval;
    } catch (err) {
        throw new Error(`HTML parsing error in ${html_url}: ${err}`);
    }
}


/**
 * Fetch the (text) content of a JSON file via via [[fetch_resource]]
 *
 * @async
 * @param json_url - URL to be fetched
 * @return - JSON content
 * @throws Error if something goes wrong with fetch
 */
export async function fetch_json(json_url: URL): Promise<string> {
    try {
        const body = await fetch_resource(json_url, ContentType.json);
        return body;
    } catch (err) {
        throw new Error(`JSON fetch error in ${json_url}: ${err}`);
    }
}


/**
 * Obtain the manifest starting with the DOM of the primary entry page. This function retrieves the manifest (either from a
 * script element or fetching a separate file).
 *
 * This corresponds to [§4.1 Linking](https://www.w3.org/TR/pub-manifest/#manifest-link) and [§4.2](https://www.w3.org/TR/pub-manifest/#manifest-embed) in the [§4. Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery) section.
 *
 *
 * @async
 * @param dom - the DOM of the primary entry page
 * @return - object with entries describing the manifest: `manifest_text`, `base`, `origin`
 * @throws if something goes wrong while trying to get hold of the manifest
 */
async function obtain_manifest(dom: jsdom.JSDOM): Promise<GenerationArguments> {
    try {
        const origin = dom.window.document.location.href;
        const document: HTMLDocument = dom.window.document;
        let text: string = '';
        let base: URL  = '';

        // Find the link element that returns the reference to the manifest
        const link = document.querySelector('link[rel*="publication"]') as HTMLLinkElement;
        if (!link) {
            // No manifest reference!
            throw new Error(`No manifest reference found in ${origin}`);
        }
        const ref = link.getAttribute('href');

        if (ref[0] === '#') {
            // The manifest ought to be local in the file
            const script = document.querySelector(`script${ref}`) as HTMLScriptElement;
            if (script) {
                text = script.text;
                base = script.baseURI;
            } else {
                throw new Error(`Manifest in ${origin} not found`);
            }
        } else {
            // The manifest file must be fetched
            // Note that the 'href' attributes takes care of the possible relative URL-s, which is handy...
            try {
                text = await fetch_json(link.href);
                base = link.href;
            } catch (err) {
                throw new Error(`Problems reaching Manifest at ${link.href} (${err.message})`);
            }
        }
        return { text, base, document }
    } catch (err) {
        throw new Error(`Manifest processing error: ${err.message}`)
    }
}

/**
 * Discovering the manifest.
 *
 * This corresponds to the [§4 Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery) section, including the
 * possibility to process a JSON file link directly (corresponding to [§4.3](https://www.w3.org/TR/pub-manifest/#manifest-other-discovery)).
 *
 * The decision on whether the incoming URL refers to an HTML or a JSON resource is rudimentary: it looks at the suffix of the URL (`.json` or `.jsonld` for a JSON
 * content, `.html` for HTML). This is fine for a test environment; real implementations should do something more sophisticated.
 *
 * @async
 * @param address - The address of either the manifest itself, or the primary entry page.
 * @throws if something goes wrong during discovery
 */
export async function discover_manifest(address: URL): Promise<GenerationArguments>  {
    try {
        const parsedURL = urlHandler.parse(address);
        if (parsedURL.path.endsWith('.json') || parsedURL.path.endsWith('.jsonld')) {
            const text = await fetch_json(address);
            const base = address;
            const document: HTMLDocument = undefined;
            return {text, base, document};
        } else if (parsedURL.path.endsWith('.html')) {
            const dom = await fetch_html(address);
            const retval = obtain_manifest(dom);
            return retval;
        } else {
            throw new Error(`unrecognized suffix (${parsedURL.path})`);
        }
    } catch (err) {
        throw new Error(`Problems discovering the manifest (${err.message})`);
    }
}
