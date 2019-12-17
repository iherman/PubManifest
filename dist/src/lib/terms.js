"use strict";
/**
 * Adding generic term managements to the core manifest interfaces.
 *
 * Each (visible) manifest interface (ie, [[PublicationManifest]], [[LinkedResource]], [[Entity]], and [[LocalizableString]]) are _extended_ to add a `$terms` key with
 * the value a [[Terms]] instance. These instances categorize the keys (terms) defined by the specification for that specific interface, and this information is used
 * in the general algorithm for normalization and checks. Also, simple creation functions are defined to create object instances that implement those interfaces, whereby  `$terms` is
 * initialized to the respective [[Terms]] subclass instances (i.e., [[PublicationManifestTerms]], [[LinkedResourceTerms]], [[EntityTerms]], and [[LocalizableStringTerms]]).
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -------------------------------------------- Convenience variables -------------------------------------
/**
 * A11Y properties that have lists of literals as values
 */
const a11y_properties = [
    'accessMode',
    'accessibilityFeature',
    'accessibilityHazard'
];
/**
 * List of creator properties (all refer to an array of [[Entity]])
 */
const creator_properties = [
    'artist',
    'author',
    'colorist',
    'contributor',
    'creator',
    'editor',
    'illustrator',
    'inker',
    'letterer',
    'penciler',
    'publisher',
    'readBy',
    'translator'
];
// -------------------------------------------- Categorization of terms -------------------------------------
/**
 * Categorization of terms per value types.
 *
 * A wrapper around arrays for terms as single literal values, multiple literal values (i.e., that must be turned into an array of strings),
 * single localizable string and an array of localizable strings, array of entities, array of linked resources, urls, booleans, etc. These arrays
 * are used in generic method calls to handle, e.g., the creation and check of arrays of localizable strings. There are accessors to return combination of terms, used by the main algorithm: all terms that refer to arrays, to literals, resp. URL-s, in some ways (arrays or not), etc.
 *
 * The pattern used for these classes is to
 *
 * - define a number of static variables for each implementation class, listing the relevant terms
 * - define an instance of the [[Terms]] class for each implementation class using this terms.
 *
 * The reason for this pattern is that end user, who gets an instance of, say, an object implementing [[Entity_Impl]],
 * can use generic methods to check, normalize, validate, etc., term values.
 *
 */
class Terms {
    /**
     * Is this term's value supposed to be an array?
     */
    is_array_term(term) {
        return [
            ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_urls,
            ...this.array_of_entities,
            ...this.array_of_links,
            ...this.array_of_miscs
        ].includes(term);
    }
    /**
     * Is this term's value supposed to be an array of Entities?
     */
    is_entities_term(term) {
        return this.array_of_entities.includes(term);
    }
    /**
     * Is this term's value supposed to be an array of localizable strings?
     */
    is_strings_term(term) {
        return this.array_of_strings.includes(term);
    }
    /**
     * Is this term's value supposed to be an array of linked resources?
     */
    is_links_term(term) {
        return this.array_of_links.includes(term);
    }
    /**
     * Is this term's value supposed to be a single URL?
     */
    is_single_url_term(term) {
        return this.single_url.includes(term);
    }
    /**
     * Is this term's value supposed to be a single boolean?
     */
    is_single_boolean_term(term) {
        return this.single_boolean.includes(term);
    }
    /**
     * Is this term's value supposed to be a single number?
     */
    is_single_number_term(term) {
        return this.single_number.includes(term);
    }
    /**
     * Is this term's value a single or a string of literal(s)?
     */
    is_literal_or_literals_term(term) {
        return [...this.single_literal, ...this.array_of_literals].includes(term);
    }
    /**
     * Is this term's value a single or a string of literal(s)?
     */
    is_url_or_urls_term(term) {
        return [...this.single_url, ...this.array_of_urls].includes(term);
    }
    /**
     * Is this term's value supposed to be an array of URLs?
     */
    is_urls_term(term) {
        return this.array_of_urls.includes(term);
    }
    /**
     * Is this term's value a regular term, ie, which does not require special handling
     */
    is_regular_term(term) {
        return [
            ...this.single_literal, ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_entities, ...this.array_of_links,
            ...this.single_url, ...this.array_of_urls,
            ...this.single_boolean
        ].includes(term);
    }
    /**
     * Is this a valid term, ie, defined by the specification
     */
    is_valid_term(term) {
        return this.all_terms.includes(term);
    }
    /**
     * Is this term's value supposed to be map?
     * (Not used at present, added as a placeholder))
     */
    is_map_term(term) {
        return false;
    }
    /**
     * All terms defined for this type
     */
    get all_terms() {
        return [
            ...this.single_literal, ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_entities, ...this.array_of_links,
            ...this.single_url, ...this.array_of_urls,
            ...this.single_boolean,
            ...this.single_misc, ...this.array_of_miscs
        ];
    }
}
exports.Terms = Terms;
/**
 * Terms defined for [[Entity]] instances.
 */
class EntityTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = [];
        this.array_of_literals = ['type', 'identifier'];
        this.array_of_strings = ['name'];
        this.array_of_entities = [];
        this.array_of_links = [];
        this.single_url = ['id'];
        this.array_of_urls = [];
        this.single_boolean = [];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = [];
    }
}
/**
 * Terms defined for [[LinkedResource]] instances
 */
class LinkedResourceTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['encodingFormat', 'integrity', 'duration'];
        this.array_of_literals = ['rel'];
        this.array_of_strings = ['name', 'description'];
        this.array_of_entities = [];
        this.array_of_links = ['alternate'];
        this.single_url = ['url'];
        this.array_of_urls = [];
        this.single_boolean = [];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = [];
    }
}
/**
 * Terms defined for [[LocalizableString]] instances
 */
class LocalizableStringTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['value', 'language', 'direction'];
        this.array_of_literals = [];
        this.array_of_strings = [];
        this.array_of_entities = [];
        this.array_of_links = [];
        this.single_url = [];
        this.array_of_urls = [];
        this.single_boolean = [];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = [];
    }
}
/**
 * Terms defined for the [[PublicationManifest]] instances
 */
class PublicationManifestTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['dateModified', 'datePublished', 'readingProgression'];
        this.array_of_literals = [...a11y_properties, 'inLanguage', 'type', 'conformsTo'];
        this.array_of_strings = ['name', 'accessibilitySummary'];
        this.array_of_entities = [...creator_properties];
        this.array_of_links = ['readingOrder', 'resources', 'links'];
        this.single_url = ['id'];
        this.array_of_urls = ['url'];
        this.single_boolean = ['abridged'];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = ['accessModeSufficient'];
    }
}
/**
 * Creation of a new [[Entity_Impl]] instance, adding an instance of [[EntityTerms]].
 */
function new_Entity_Impl() {
    const retval = {};
    retval.$terms = new EntityTerms();
    return retval;
}
exports.new_Entity_Impl = new_Entity_Impl;
/**
 * Check whether an object is of type [[Entity_Impl]].
 */
function isEntity_Impl(obj) {
    return obj.$terms !== undefined && obj.$terms instanceof EntityTerms;
}
exports.isEntity_Impl = isEntity_Impl;
/**
 * Creation of a new [[LocalizableString_Impl]] instance, adding an instance of [[LocalizableStringTerms]].
 */
function new_LocalizableString_Impl() {
    const retval = {};
    retval.$terms = new LocalizableStringTerms();
    return retval;
}
exports.new_LocalizableString_Impl = new_LocalizableString_Impl;
/**
 * Check whether an object is of type [[LocalizableString_Impl]]
 */
function isLocalizableString_Impl(obj) {
    return obj.$terms !== undefined && obj.$terms instanceof LocalizableStringTerms;
}
exports.isLocalizableString_Impl = isLocalizableString_Impl;
/**
 * Creation of a new [[LinkedResource_Impl]] instance, adding an instance of [[LinkedResourceTerms]].
 */
function new_LinkedResource_Impl() {
    const retval = {};
    retval.$terms = new LinkedResourceTerms();
    return retval;
}
exports.new_LinkedResource_Impl = new_LinkedResource_Impl;
/**
 * Check whether an object is of type [[LinkedResource_Impl]]
 */
function isLinkedResource_Impl(obj) {
    return obj.$terms !== undefined && obj.$terms instanceof LinkedResourceTerms;
}
exports.isLinkedResource_Impl = isLinkedResource_Impl;
/**
 * Creation of a new [[PublicationManifest_Impl]] instance, adding an instance of [[PublicationManifestTerms]].
 */
function new_PublicationManifest_Impl() {
    const retval = {};
    retval.$terms = new PublicationManifestTerms();
    retval.toc = null;
    return retval;
}
exports.new_PublicationManifest_Impl = new_PublicationManifest_Impl;
//# sourceMappingURL=terms.js.map