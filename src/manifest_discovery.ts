/**
 * Utilities to get hold of the manifest, either retrieving it from an HTML file when embedded or vis a JSON URL
 */
import * as fetch from 'node-fetch';
import * as urlHandler from 'url';
import * as validUrl from 'valid-url';
import * as contentType from 'content-type';
import * as dom from 'jsdom';
import { Logger } from './utilities';
import { URL } from './manifest';

const json_content_type = 'application/json';
const jsonld_content_type = 'application/ld+json';
const html_content_type = 'text/html';


/**
* Basic sanity check on the URL.
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
* The function can be used in two modes.
* 1. If a logger is defined, it is used to issue an error. This may be used to check the various URL-s in the manifest
* 2. If a logger is not defined (that is the default), an exception is raised. That should be used when the URL is dereferenced.
*
* @param address - the URL to be checked.
* @param logger - if defined, errors are logged instead of throwing exceptions
* @returns  - the URL itself (which might be slightly improved by the valid-url method) or null if this is, in fact, not a URL; if there is a logger message, it returns null.
* @throws  if it pretends to be a URL, but it is not acceptable for some reasons.
*/
function check_url(address: URL, logger: Logger = undefined) {
    const parsed = urlHandler.parse(address);
    if (parsed.protocol === null) {
        // This is not a URL, should be used as a file name
        if (logger) {
            logger.log_fatal_error(`"${address}": Invalid URL: no protocol`);
            return null;
        }
        throw new Error(`"${address}": Invalid URL: no protocol`);
    }

    // Check whether we use the right protocol
    if (['http:', 'https:'].includes(parsed.protocol) === false) {
        if (logger) {
            logger.log_fatal_error(`"${address}": URL is not dereferencable`);
            return null;
        }
        throw new Error(`"${address}": URL is not dereferencable`);
    }

    // Run through the URL validator
    const retval = validUrl.isWebUri(address);
    if (retval === undefined) {
        if (logger) {
            logger.log_fatal_error(`"${address}": the URL isn't valid`);
            return null;
        }
        throw new Error(`"${address}": the URL isn't valid`);
    }

    // Check the port
    if (parsed.port !== null) {
        try {
            const portNumber = Number(parsed.port);
            if (portNumber <= 1024) {
                if (logger) {
                    logger.log_fatal_error(`"${address}": Unsafe port number used in URL (${parsed.port})`);
                    return null;
                } else {
                    throw new Error(`"${address}": Unsafe port number used in URL (${parsed.port})`);
                }
            }
        } catch(e) {
            if (logger) {
                logger.log_fatal_error(`"${address}": Invalid port number used in URL (${parsed.port})`);
                return null;
            }
            throw new Error(`"${address}": Invalid port number used in URL (${parsed.port})`);
        }
    }
    // If we got this far, this is a proper URL, ready to be used.
    return retval;
}


/**
 * Get Web resource via a fetch. There is a sanity (security) check on the URL to avoid possible security errors.
 *
 * @async
 * @param resource_url - The URL of the resource to be fetched
 * @param content_type - Expected content. Default is JSON (ie, application/json).  Accepted values are HTML, and JSON (including the 'derivatives', ie, application/XXX+json)
 * @return - Promise encapsulating the body of the resource. The appropriate parsing should be done by the caller
 * @throws - Error if something goes wrong with fetch
 */
async function fetch_resource(resource_url: URL, json: boolean = true): Promise<any> {
    // If there is a problem, an exception is raised
    return new Promise((resolve, reject) => {
        try {
            // This is a real URL, whose content must be accessed via HTTP(S)
            // An exception is raised if the URL has security/sanity issues.
            const final_url = check_url(resource_url);
            fetch.default(final_url)
                .then((response) => {
                    if (response.ok) {
                        // If the response content type is set (which is usually the case, but not always in all cases...)
                        const response_type = response.headers.get('content-type');
                        if (response_type && response_type !== '') {
                            // check whether we got what we wanted
                            if (json) {
                                if (response_type === json_content_type || response_type === jsonld_content_type) {
                                    resolve(response.text());
                                }
                            } else {
                                // we expect HTML then
                                if (response_type === html_content_type) {
                                    resolve(response.text());
                                }
                            }
                            reject(new Error(`unexpected content type, expected ${json? 'json': 'html'}`));
                        } else {
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
 * Fetch an HTML file
 *
 * @async
 * @param html_url - URL to be fetched
 * @return - DOM object for the parsed HTML
 * @throws - Error if something goes wrong with fetch or the DOM Parsing
 */
async function fetch_html(html_url: URL): Promise<dom.JSDOM> {
    try {
        const body = await fetch_resource(html_url, false);
        const retval = new dom.JSDOM(body, { url: html_url });
        return retval;
    } catch (err) {
        throw new Error(`HTML parsing error in ${html_url}: ${err}`);
    }
}


/**
 * Fetch the (text) content of a JSON file.
 *
 * @async
 * @param json_url - URL to be fetched
 * @return JSON content; "{}" if something is not correct (and a warning is issued)
 * @throws - Error if something goes wrong with fetch
 */
async function fetch_json(json_url: URL): Promise<string> {
    try {
        const body = await fetch_resource(json_url);
        return body;
    } catch (err) {
        throw new Error(`JSON fetch error in ${json_url}: ${err}`);
    }
}









/* ------ */


async function test() {
    const data: dom.JSDOM = await fetch_html('http://localhost:8001/LocalData/github/Attic/WPManifest/tests/entry_with_script.html');

    //const data: string = await fetch_json('http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/test_301.jsonld');

    console.log(data);
}

test();





