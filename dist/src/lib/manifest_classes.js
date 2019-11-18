"use strict";
/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
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
 * The reason for this pattern is that end user, who gets an instance of, say, the [[Entity_Impl]] class implementing the [[Entity]] interface,
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
 * Terms defined for [[Entity]] implementations.
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
 * Terms defined for [[LinkedResource]] implementations
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
 * Terms defined for [[LocalizableString]] implementations
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
 * Terms defined for the [[PublicationManifest]] implementations
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
 * Implementation of [[Entity]], superclass for [[Person_Impl]] or [[Organization_Impl]]
 */
class Entity_Impl {
    /** A [[Terms]] instance referring to the terms defined for [[Entity]] */
    get terms() {
        return new EntityTerms();
    }
}
exports.Entity_Impl = Entity_Impl;
;
/**
 * Implementation for a [[Person]]
 */
class Person_Impl extends Entity_Impl {
}
exports.Person_Impl = Person_Impl;
;
/**
 * Implementation for a [[Organization]]
 */
class Organization_Impl extends Entity_Impl {
}
exports.Organization_Impl = Organization_Impl;
;
/**
 * Implementation for [[LocalizableString]]
 */
class LocalizableString_Impl {
    /** A [[Terms]] instance referring to the terms defined for [[LocalizableString]] */
    get terms() {
        return new LocalizableStringTerms();
    }
}
exports.LocalizableString_Impl = LocalizableString_Impl;
;
/**
 * Implementation for [[LinkedResource]]
 */
class LinkedResource_Impl {
    /** A [[Terms]] instance referring to the terms defined for [[LinkedResource]] */
    get terms() {
        return new LinkedResourceTerms();
    }
}
exports.LinkedResource_Impl = LinkedResource_Impl;
;
/**
 * Implementation for [[PublicationManifest]]
 */
class PublicationManifest_Impl {
    constructor() {
        this.id = '';
        this.profile = '';
        this.name = [];
        this.readingOrder = [];
    }
    /** A [[Terms]] instance referring to the terms defined for [[PublicationManifest]] */
    get terms() {
        return new PublicationManifestTerms();
    }
}
exports.PublicationManifest_Impl = PublicationManifest_Impl;
;
//# sourceMappingURL=manifest_classes.js.map