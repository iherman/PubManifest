
enum traverse {
    exit,
    proceed
};


const skipped_elements: string[] = [];
const heading_content_elements: string[] = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HGROUP'];
const list_elements: string[] = ['UL', 'OL'];
const list_item_elements: string[] = ['LI'];
const anchor_elements: string[] = ['A'];
const toc_elements = [...heading_content_elements, ...list_elements, ...list_item_elements, ...anchor_elements];

/**
 * Depth-first traversal of a DOM tree: for each interesting child element it calls the 'enter' function,
 * recursively goes down to the children and calls an 'exit' function.
 *
 * @param element - next element to handle
 * @param enter - 'enter element' call-back
 * @param exit = 'exit element' call-back
 */

function HTML_depth_first(element: HTMLElement, enter: ((entry:HTMLElement)=>traverse), exit: ((entry:HTMLElement)=>void) ): void {
    element.childNodes.forEach((child: HTMLElement) =>  {
        // 'Entering' the element, although some cases should be filtered out right away
        if (skipped_elements.includes(child.tagName) || child.hidden) {
            return;
        }
        // If the element is to be handled, go there with enter
        const toc_element: boolean = toc_elements.includes(child.tagName);

        const traverse_further: traverse = toc_element ? enter(child) : traverse.proceed;
        if (traverse_further === traverse.proceed) HTML_depth_first(child, enter, exit)
        if (toc_element) exit(child);
    });
};

/**
 * Get the text content of an element.
 * The spec gives a choice between using the text content of an element or
 * the result of doing an accessible name calculation. For now, simply do the
 * former.
 *
 * @param element - element whose text content is collected
 * @return - text content
 */
function text_content(element: HTMLElement): string {
    return element.innerText;
}


/* ----------------------- */

export interface TocBranch {
    name: string;
    url: string;
    type: string;
    rel: string;
    entries: TocBranch[];
}

export interface ToC {
    name: string;
    entries: TocBranch[];
}

export function generate_TOC(nav: HTMLElement): ToC {
    // The real 'meat' is in the six functions below.
    // Everything else is scaffolding...
    const enter_heading_content = (entry: HTMLElement) :traverse => {
        // Step 4.1
        if (toc.name === '' && branches.length === 0) {
            toc.name = text_content(entry);
            if (toc.name === '') toc.name = null;
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
        } else {
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
        }
    };

    const enter_list_item_element = (entry: HTMLElement) :traverse => {
        // Step 4.4
        current_toc_branch = {
            name    : "",
            url     : "",
            type    : "",
            rel     : "",
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
        if (branches.length !== 0) {
            if (current_toc_branch.entries.length !== 0 && current_toc_branch.name === '') {
                current_toc_branch.name = null;
            }
            if (current_toc_branch.entries.length === 0 && current_toc_branch.name === '') {
                return;
            }
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
                current_toc_branch.name = text_content(entry);
                if (current_toc_branch.name === '') current_toc_branch.name = null;

                // Step 4.6.2.2
                const url = (<HTMLAnchorElement>entry).href;
                // things are to be checked here, that is left for later!!!
                current_toc_branch.url = url;
            }
        }

        return traverse.exit;
    };

    const enter_element = (entry: HTMLElement): traverse => {
        if (heading_content_elements.includes((entry.tagName))) {
            return enter_heading_content(entry);
        } else if (list_elements.includes(entry.tagName)) {
            return enter_list_element(entry)
        } else if (list_item_elements.includes(entry.tagName)) {
            return enter_list_item_element(entry);
        } else if (anchor_elements.includes(entry.tagName)) {
            return enter_anchor_element(entry);
        } else {
            // default...
            return traverse.proceed;
        }
    };
    const exit_element = (entry: HTMLElement) => {
        if (list_elements.includes(entry.tagName)) {
            exit_list_element(entry);
        } else if (list_item_elements.includes(entry.tagName)) {
            exit_list_item_element(entry);
        }
    };

    const toc: ToC = {
        name: '',
        entries: []
    };
    let current_toc_branch: TocBranch = null;
    const branches: TocBranch[] = [];

    // Depth first traversal of the nav element with the enter/exit functions above
    HTML_depth_first(nav, enter_element, exit_element);

    // Return either a real ToC or undefined...
    return toc.entries.length !== 0 ? toc : undefined;
}
