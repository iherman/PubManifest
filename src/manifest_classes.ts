/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */

import { PublicationManifest, LinkedResource, LocalizableString, Entity, ProgressionDirection } from './manifest';

// -------------------------------------------- Convenience variables -------------------------------------
const a11y_properties = [
    'accessMode',
    'accessModeSufficient',
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
 * There is a method to return the full list of terms; for that to work, there is an extra array for miscellaneous terms that need
 * otherwise special consideration anyway (e.g., 'length')
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
    misc:              string[];

    constructor(single_literal:    string[],
                array_of_literals: string[],
                array_of_strings:  string[],
                array_of_entities: string[],
                array_of_links:    string[],
                single_url:        string[],
                array_of_urls:     string[],
                single_boolean:    string[],
                misc:              string[]
                ) {
        this.single_literal    = single_literal;
        this.array_of_literals = array_of_literals;
        this.array_of_strings  = array_of_strings;
        this.array_of_entities = array_of_entities;
        this.array_of_links    = array_of_links;
        this.single_url        = single_url;
        this.array_of_urls     = array_of_urls;
        this.single_boolean    = single_boolean;
        this.misc              = misc;
    }

    get array_terms() {
        return [...this.array_of_literals, ...this.array_of_strings, ...this.array_of_urls, ...this.array_of_entities, ...this.array_of_links]
    }

    /**
     * Return an array of all the terms
     */
    all_terms(): string[] {
        return [
            ...this.single_literal, ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_entities, ...this.array_of_links,
            ...this.single_url, ...this.array_of_urls,
            ...this.single_boolean,
            ...this.misc
        ];
    }
}

// -------------------------------- Type alias for URL (which are strings, in fact) -------------

export type URL = string;

// -------------------------------------------- toString utilities ------------------------------
const obj_array_toString = <T>(objects: T[], join_string: string) :string => {
    if (objects === undefined || objects.length === 0) return '';
    return objects.map((obj: T) :string => obj.toString()).join(join_string);
}

// -------------------------------------------- Implementations of the manifest interfaces -------------------------------------
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
    static misc:              string[] = [];

    static terms: Terms = new Terms(
        Entity_Impl.single_literal,
        Entity_Impl.array_of_literals,
        Entity_Impl.array_of_strings,
        Entity_Impl.array_of_entities,
        Entity_Impl.array_of_links,
        Entity_Impl.single_url,
        Entity_Impl.array_of_urls,
        Entity_Impl.single_boolean,
        Entity_Impl.misc
    );
    get terms() {
        return Entity_Impl.terms;
    }

    type       : string[];
    name       : LocalizableString[];
    id         : string;
    url        : string;
    identifier : string[];

    [propName  : string] : any;
};

/**
 * Localizable Strings, i.e., string values with possible languages
 */
export class LocalizableString_Impl implements LocalizableString {
    value     : string;
    language  : string;
    direction : string;
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
    static misc:              string[] = ['length'];

    static terms: Terms = new Terms(
        LinkedResource_Impl.single_literal,
        LinkedResource_Impl.array_of_literals,
        LinkedResource_Impl.array_of_strings,
        LinkedResource_Impl.array_of_entities,
        LinkedResource_Impl.array_of_links,
        LinkedResource_Impl.single_url,
        LinkedResource_Impl.array_of_urls,
        LinkedResource_Impl.single_boolean,
        LinkedResource_Impl.misc
    );
    get terms() {
        return LinkedResource_Impl.terms;
    }

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
    static misc:              string[] = [];

    static terms: Terms = new Terms(
        PublicationManifest_Impl.single_literal,
        PublicationManifest_Impl.array_of_literals,
        PublicationManifest_Impl.array_of_strings,
        PublicationManifest_Impl.array_of_entities,
        PublicationManifest_Impl.array_of_links,
        PublicationManifest_Impl.single_url,
        PublicationManifest_Impl.array_of_urls,
        PublicationManifest_Impl.single_boolean,
        PublicationManifest_Impl.misc
    );
    get terms() {
        return PublicationManifest_Impl.terms;
    }

    type                 : string[] = ['CreativeWork'];
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
