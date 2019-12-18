
import { TocEntry, ToC, PublicationManifest, LinkedResource } from '../manifest';
import { Global, toc_query_selector, remove_url_fragment } from './utilities';
import { fetch_html } from './discovery';
import * as urlHandler from 'url';

/** Sectioning Content Elements, see  https://html.spec.whatwg.org/multipage/dom.html#sectioning-content-2 */
const sectioning_content_elements: string[] = ['ARTICLE', 'ASIDE', 'NAV', 'SECTION'];
/** Sectioning Root Elements, https://html.spec.whatwg.org/multipage/sections.html#sectioning-root */
const sectioning_root_elements: string[] = ['BLOCKQUOTE', 'BODY', 'DETAILS', 'DIALOG', 'FIELDSET', 'FIGURE', 'TD'];
/** Per spec, Sectioning elements are skipped, see step 4.7 */
const skipped_elements: string[] = [...sectioning_content_elements, ...sectioning_root_elements];

const heading_content_elements: string[] = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HGROUP'];
const list_elements: string[] = ['UL', 'OL'];
const list_item_elements: string[] = ['LI'];
const anchor_elements: string[] = ['A'];

/** Internal type to control the exact flow in [[core_element_cycle]] */
enum traverse {
    exit,
    proceed
};

/**
 * Depth-first traversal of a DOM tree: for each interesting child element:
 *
 * 1. it calls the `enter` function, which also returns a [[traverse]] value
 * 2. unless the result of the previous step is to to exit right away, goes down to the children recursively
 * 3. calls the `exit` function
 *
 * All these actions happen on elements that are of interest for the process. If that is not the case, just go to children without entering `enter` and `exit`.
 *
 * @param element - element to handle
 * @param enter - 'enter element' call-back
 * @param exit - 'exit element' call-back
 */
function core_element_cycle(element: HTMLElement, enter: ((entry:HTMLElement)=>traverse), exit: ((entry:HTMLElement)=>void) ): void {
    element.childNodes.forEach((child: HTMLElement) =>  {
        if (enter(child) === traverse.proceed) {
            core_element_cycle(child, enter, exit)
        }
        exit(child);
    });
};

/**
 * Get the text content of an element.
 * The spec gives a choice between using the text content of an element or
 * the result of doing an accessible name calculation. For now, simply do the
 * former.
 *
 * Also, in all cases the function is called, the assignment of the result is `null` instead of an empty string, so this is returned.
 *
 * @param element - element whose text content is collected
 * @return - text content, null if the text is empty
 */
function text_content(element: HTMLElement): string {
    //@@@ Maybe it should be innerText for a proper HTML file? To be tested!
    const txt = element.textContent;
    return (txt === '') ? null : txt;
}

/**
 * Extract the Table of Content data from the HTML source.
 *
 * This is the implementation of the core [§C.3 User Agent Processing algorithm](https://www.w3.org/TR/pub-manifest/#app-toc-ua) of the specification.
 *
 * @param toc_element - the DOM element to extract the data from
 * @param manifest - the (already processed) publication manifest
 * @returns - the Table of Content structure; if there are no valid entries, the function returns `null`
 */
function extract_TOC(toc_element: HTMLElement, manifest: PublicationManifest ): ToC {
    // The real 'meat' is in the six functions below.
    // Everything else is scaffolding...
    const enter_heading_content = (entry: HTMLElement) :traverse => {
        // Step 4.1
        if (toc.name === '' && branches.length === 0) {
            // this will return null instead of the empty string as defined in the spec
            toc.name = text_content(entry);
        }
        return traverse.exit;
    };

    const enter_list_element = (entry: HTMLElement) :traverse => {
        // Step 4.2
        // Step 4.2.1.
        if (toc.name === '') toc.name = null;

        if (current_toc_branch !== null) {
            // Step 4.2.2.
            if (current_toc_branch.entries === null || current_toc_branch.entries.length !== 0) {
                return traverse.exit;
            } else {
                branches.push(current_toc_branch);
                current_toc_branch = null;
            }
        } else if (branches.length === 0) {
            // Step 4.2.3.
            if (toc.entries === null || toc.entries.length !== 0) {
                return traverse.exit;
            }
        }
        return traverse.proceed;
    };

    const exit_list_element = (entry: HTMLElement) => {
        // Step 4.3
        if (branches.length !== 0) {
            current_toc_branch = branches.pop();
        } else if (toc.entries.length === 0) {
            toc.entries = null;
        }
    };

    const enter_list_item_element = (entry: HTMLElement) :traverse => {
        // Step 4.4
        current_toc_branch = {
            name    : "",
            url     : "",
            type    : "",
            rel     : null,
            entries : [],
        }
        return traverse.proceed;
    };

    const exit_list_item_element = (entry: HTMLElement) => {
        // Step 4.5.1
        if (current_toc_branch.entries.length === 0) {
            current_toc_branch.entries = null;
        }

        // Step 4.5.2
        if (current_toc_branch.name === '') {
            if (current_toc_branch.entries !== null) {
                current_toc_branch.name = null;
            } else {
                current_toc_branch = null;
                return;
            }
        }

        // Step 4.5.3
        if (branches.length !== 0) {
            branches[branches.length - 1].entries.push(current_toc_branch);
        } else {
            toc.entries.push(current_toc_branch);
        }

        current_toc_branch = null;
    };

    const enter_anchor_element = (entry: HTMLElement) :traverse => {
        if (current_toc_branch !== null) {
            // Step 4.6.1
            if (current_toc_branch.name !== '') {
                return traverse.exit;
            } else {
                // Step 4.6.2.1
                // the function returns null instead of an empty string, as required by the spec
                current_toc_branch.name = text_content(entry);

                const anchor: HTMLAnchorElement = entry as HTMLAnchorElement;

                // Step 4.6.2.2
                // Note that, by this step, the HTML parser has already turned the relative URL into an absolute one!
                // Also check that the URL is part of the resources listed in the manifest
                const url = anchor.hasAttribute('href') ? anchor.href : null;
                if (url !== null) {
                    if (manifest.uniqueResources.includes(remove_url_fragment(url))) {
                        current_toc_branch.url = url
                    } else {
                        Global.logger.log_light_validation_error(`The ToC reference "${url}" does not appear in the resources listed in the manifest.`);
                        current_toc_branch.url = null;
                    }
                } else {
                    current_toc_branch.url = null;
                }

                // Step 4.6.2.3
                current_toc_branch.type = anchor.hasAttribute('type') ? anchor.type.trim() : null;

                // Step 4.6.2.4
                if (anchor.hasAttribute('rel')) {
                    const rel = anchor.rel.trim().split(' ');
                    current_toc_branch.rel = (rel.length !== 0) ? rel : null;
                } else {
                    current_toc_branch.rel = null;
                }
            }
        }
        return traverse.exit;
    };

    const enter_element = (entry: HTMLElement): traverse => {
        if (heading_content_elements.includes((entry.tagName))) {
            // Step 4.1
            return enter_heading_content(entry);
        } else if (list_elements.includes(entry.tagName)) {
            // Step 4.2
            return enter_list_element(entry)
        } else if (list_item_elements.includes(entry.tagName)) {
            // Step 4.4
            return enter_list_item_element(entry);
        } else if (anchor_elements.includes(entry.tagName)) {
            // Step 4.6
            return enter_anchor_element(entry);
        } else if (skipped_elements.includes(entry.tagName) || entry.hidden === true) {
            // Step 4.7
            return traverse.exit;
        } else {
            // Step 4.8
            return traverse.proceed;
        }
    };
    const exit_element = (entry: HTMLElement) => {
        if (list_elements.includes(entry.tagName)) {
            // Step 4.3
            exit_list_element(entry);
        } else if (list_item_elements.includes(entry.tagName)) {
            // Step 4.5
            exit_list_item_element(entry);
        }
        // Step 4.8
    };

    const toc: ToC = {
        name: '',
        entries: []
    };
    let current_toc_branch: TocEntry = null;
    const branches: TocEntry[] = [];

    // Depth first traversal of the nav element with the enter/exit functions above
    core_element_cycle(toc_element, enter_element, exit_element);

    // Return either a real ToC or undefined...
    return toc.entries.length !== 0 ? toc : null;
}


/**
 * Extract the ToC, if available, via the manifest information. This is the implementation of
 * the [§C.3 User Agent Processing algorithm](https://www.w3.org/TR/pub-manifest/#app-toc-ua) of the specification: after finding the relevant element
 * that is supposed to contain the ToC, the heavy lifting is done in [[extract_TOC]].
 *
 * The function is asynchronous because, possibly, the HTML resource, containing the ToC, must be fetched.
 *
 * @async
 * @param manifest - the processed manifest
 */
export async function generate_TOC(manifest: PublicationManifest): Promise<ToC> {
    const locate_toc_element = async (): Promise<HTMLElement> => {
        const linked_resources = (manifest.resources) ? [...manifest.readingOrder, ...manifest.resources] : manifest.readingOrder;
        const resource: LinkedResource = linked_resources.find((link) => (link.rel && link.rel.includes('contents')));

        if (resource !== undefined && resource.url !== '') {
            const parsed = urlHandler.parse(resource.url);
            const fragment = parsed.hash;
            delete parsed.hash;
            const absolute_url = urlHandler.format(parsed);

            /* TODO: There can be an optimization step here: if the Global document url is the same as this absolute url, then there is no reason to go through another fetch */

            // Try to get hold of the HTML resource
            let html_dom: Document = null;
            try {
                const dom = await fetch_html(absolute_url);
                html_dom = dom.window.document;
            } catch(e) {
                Global.logger.log_light_validation_error(`Problems fetching ToC resource (${e.message})`);
                return null;
            }

            // Branch out on whether there is a fragment ID or not...
            if (fragment !== null) {
                const nav: HTMLElement = html_dom.getElementById(fragment);
                if (nav !== null && nav.hasAttribute('role') && nav.getAttribute('role').trim().split(' ').includes('doc-toc')) {
                    // This is indeed a toc element, we can proceed to extract the content
                    return nav;
                } else {
                    Global.logger.log_light_validation_error(`ToC entry with ${resource.url} not found`);
                }
                // If we get there, there is no valid TOC, so we fall through the whole branch to the closure of the function
            } else {
                const nav: HTMLElement = html_dom.querySelector(toc_query_selector);
                if (nav !== null) {
                    return nav;
                } else {
                    Global.logger.log_light_validation_error(`ToC entry in ${resource.url} not found`);
                }
                // If we get there, there is no valid TOC, so we fall through the whole branch to the closure of the function
            }
        } else {
            return null;
        }
    }

    const toc_element: HTMLElement = Global.profile.get_toc_element(manifest) || await locate_toc_element();
    return toc_element !== null ? extract_TOC(toc_element, manifest) : null;
}


