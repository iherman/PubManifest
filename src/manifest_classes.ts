/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */

import {
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection } from './manifest';

// -------------------------------------------- Convenience variables -------------------------------------

// A11Y properties that have arrays of literals as values
const a11y_properties = [
    'accessMode',
    'accessibilityFeature',
    'accessibilityControl',
    'accessibilityHazard'
];

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
 * Categorization of terms per value types: arrays for terms as single literal values, multiple literal values (ie, must be turned into an array of strings),
 * single localizable string and an array of localizable strings, array of entities, array of linked resources, urls, booleans, etc.
 *
 * These arrays are used in generic method calls to handle, e.g., the creation and check of arrays of localizable strings.
 *
 * There is methods to return combination of terms, used by the main algorithm: all terms that refer to arrays, to literals, resp. URL-s, in some ways (arrays or not), etc.
 *
 * The pattern used for this class is to
 *
 * - define a number of static variables for each class listing the relevant terms
 * - define a static instance of the Terms class for each class using this terms.
 *
 * The reason for this pattern is that end user, who gets an instance of, say, the Entity_Impl class implementing the Entity interface
 * can debug (e.g., dump the class into JSON) without being bothered by the various term arrays.
 *
 */
export class Terms {
    single_literal:    string[];
    array_of_literals: string[];
    array_of_strings:  string[];
    array_of_entities: string[];
    array_of_links:    string[];
    single_url:        string[];
    array_of_urls:     string[];
    single_boolean:    string[];
    single_number:     string[];
    single_misc:       string[];
    array_of_miscs:    string[];

    constructor(single_literal:    string[],
                array_of_literals: string[],
                array_of_strings:  string[],
                array_of_entities: string[],
                array_of_links:    string[],
                single_url:        string[],
                array_of_urls:     string[],
                single_boolean:    string[],
                single_number:     string[],
                single_misc:       string[],
                array_of_miscs:    string[],
                ) {
        this.single_literal    = single_literal;
        this.array_of_literals = array_of_literals;
        this.array_of_strings  = array_of_strings;
        this.array_of_entities = array_of_entities;
        this.array_of_links    = array_of_links;
        this.single_url        = single_url;
        this.array_of_urls     = array_of_urls;
        this.single_boolean    = single_boolean;
        this.single_number     = single_number;
        this.single_misc       = single_misc;
        this.array_of_miscs    = array_of_miscs;
    }

    /**
     * All the terms that expect arrays as values
     */
    get array_terms() {
        return [
            ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_urls,
            ...this.array_of_entities,
            ...this.array_of_links,
            ...this.array_of_miscs
        ]
    }

    /**
     * All the terms that expect literals, either as individual values or arrays
     */
    get array_or_single_literals() {
        return [...this.single_literal, ...this.array_of_literals];
    }

    /**
     * All the terms that expect URLs, either as individual values or arrays
     */
    get array_or_single_urls() {
        return [...this.single_url, ...this.array_of_urls];
    }

    /**
     * All the terms that expect a single map (not an array of maps!)
     */
    get maps(): string[] {
        // This method is special; the main algorithm refers to this, although it never return anything in practice: it corresponds to the case
        // where there is a term whose value is a single map (as opposed to arrays). Such situation does not occur as of now, but
        // it may in the future...
        return [];
    }

    /**
     * All the terms
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

// -------------------------------- Type alias for URL (which are strings, in fact) -------------

export type URL = string;


// -------------------------------------------- Implementations of the manifest interfaces -------------------------------------
export type RecognizedTypes_Impl = Person_Impl | Organization_Impl | LinkedResource_Impl;

/**
 * Entities, ie, persons or organizations
 */
export class Entity_Impl implements Entity {
    /**
     * Terms used for object of this type
     */
    static single_literal:    string[] = ['id'];
    static array_of_literals: string[] = ['type', 'identifier'];
    static array_of_strings:  string[] = ['name'];
    static array_of_entities: string[] = [];
    static array_of_links:    string[] = [];
    static single_url:        string[] = [];
    static array_of_urls:     string[] = [];
    static single_boolean:    string[] = [];
    static single_number:     string[] = [];
    static single_misc:       string[] = [];
    static array_of_miscs:    string[] = [];

    static terms: Terms = new Terms(
        Entity_Impl.single_literal,
        Entity_Impl.array_of_literals,
        Entity_Impl.array_of_strings,
        Entity_Impl.array_of_entities,
        Entity_Impl.array_of_links,
        Entity_Impl.single_url,
        Entity_Impl.array_of_urls,
        Entity_Impl.single_boolean,
        Entity_Impl.single_number,
        Entity_Impl.single_misc,
        Entity_Impl.array_of_miscs
    );

    type       : string[];
    name       : LocalizableString[];
    id         : string;
    url        : string;
    identifier : string[];

    [propName  : string] : any;
};

export class Person_Impl extends Entity_Impl  implements Person {};
export class Organization_Impl extends Entity_Impl  implements Organization {};

/**
 * Localizable Strings, i.e., string values with possible languages
 */
export class LocalizableString_Impl implements LocalizableString {
    static single_literal:    string[] = ['value', 'language', 'direction'];
    static array_of_literals: string[] = [];
    static array_of_strings:  string[] = [];
    static array_of_entities: string[] = [];
    static array_of_links:    string[] = [];
    static single_url:        string[] = [];
    static array_of_urls:     string[] = [];
    static single_boolean:    string[] = [];
    static single_number:     string[] = [];
    static single_misc:       string[] = [];
    static array_of_miscs:    string[] = [];

    static terms: Terms = new Terms(
        LocalizableString_Impl.single_literal,
        LocalizableString_Impl.array_of_literals,
        LocalizableString_Impl.array_of_strings,
        LocalizableString_Impl.array_of_entities,
        LocalizableString_Impl.array_of_links,
        LocalizableString_Impl.single_url,
        LocalizableString_Impl.array_of_urls,
        LocalizableString_Impl.single_boolean,
        LocalizableString_Impl.single_number,
        LocalizableString_Impl.single_misc,
        LocalizableString_Impl.array_of_miscs
    );

    value     : string;
    language  : string;
    direction : string;

    [propName  : string] : any;
};

/**
 * Linked Resources (ie, references to publication resources)
 */
export class LinkedResource_Impl implements LinkedResource {

    static single_literal:    string[] = ['encodingFormat', 'integrity'];
    static array_of_literals: string[] = ['rel'];
    static array_of_strings:  string[] = ['name', 'description'];
    static array_of_entities: string[] = [];
    static array_of_links:    string[] = ['alternate'];
    static single_url:        string[] = ['url'];
    static array_of_urls:     string[] = [];
    static single_boolean:    string[] = [];
    static single_number:     string[] = ['length'];
    static single_misc:       string[] = [];
    static array_of_miscs:    string[] = [];

    static terms: Terms = new Terms(
        LinkedResource_Impl.single_literal,
        LinkedResource_Impl.array_of_literals,
        LinkedResource_Impl.array_of_strings,
        LinkedResource_Impl.array_of_entities,
        LinkedResource_Impl.array_of_links,
        LinkedResource_Impl.single_url,
        LinkedResource_Impl.array_of_urls,
        LinkedResource_Impl.single_boolean,
        LinkedResource_Impl.single_number,
        LinkedResource_Impl.single_misc,
        LinkedResource_Impl.array_of_miscs
    );

    url            : string;
    encodingFormat : string;
    name           : LocalizableString[];
    description    : LocalizableString;
    rel            : string[];
    integrity      : string;
    length         : number;
    alternate      : LinkedResource[];

    [propName: string] : any;
};

/**
 * The top level class for a publication manifest
 */
export class PublicationManifest_Impl implements PublicationManifest {
    static single_literal:    string[] = ['dateModified', 'datePublished', 'id', 'readingProgression'];
    static array_of_literals: string[] = [...a11y_properties, 'inLanguage', 'type', 'conformsTo'];
    static array_of_strings:  string[] = ['name', 'accessibilitySummary'];
    static array_of_entities: string[] = [...creator_properties];
    static array_of_links:    string[] = ['readingOrder', 'resources', 'links'];
    static single_url:        string[] = [];
    static array_of_urls:     string[] = ['url'];
    static single_boolean:    string[] = ['abridged'];
    static single_number:     string[] = [];
    static single_misc:       string[] = [];
    static array_of_miscs:    string[] = ['accessModeSufficient'];

    static terms: Terms = new Terms(
        PublicationManifest_Impl.single_literal,
        PublicationManifest_Impl.array_of_literals,
        PublicationManifest_Impl.array_of_strings,
        PublicationManifest_Impl.array_of_entities,
        PublicationManifest_Impl.array_of_links,
        PublicationManifest_Impl.single_url,
        PublicationManifest_Impl.array_of_urls,
        PublicationManifest_Impl.single_boolean,
        PublicationManifest_Impl.single_number,
        PublicationManifest_Impl.single_misc,
        PublicationManifest_Impl.array_of_miscs
    );

    type                 : string[];
    id                   : string = '';
    profile              : string = '';
    conformsTo           : string[];

    accessMode           : string[];
    accessModeSufficient : string[];
    accessibilityFeature : string[];
    accessibilityHazard  : string[];
    accessibilitySummary : LocalizableString[];
    artist               : Entity[];
    author               : Entity[];
    colorist             : Entity[];
    contributor          : Entity[];
    creator              : Entity[];
    editor               : Entity[];
    illustrator          : Entity[];
    inker                : Entity[];
    letterer             : Entity[];
    penciler             : Entity[];
    publisher            : Entity[];
    readBy               : Entity[];
    translator           : Entity[];

    url                  : string[];
    duration             : string;
    inLanguage           : string[];
    dateModified         : string;
    datePublished        : string;
    abridged             : boolean;
    readingProgression   : ProgressionDirection = ProgressionDirection.ltr;
    name                 : LocalizableString[] = [];
    readingOrder         : LinkedResource[] = [];
    resources            : LinkedResource[];
    links                : LinkedResource[];

    [propName: string] : any;
};
