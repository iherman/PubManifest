/**
 * Adding generic term managements to the core manifest interfaces.
 *
 * Each (visible) manifest interface (ie, [[PublicationManifest]], [[LinkedResource]], [[Entity]], and [[LocalizableString]]) are _extended_ to add a `$terms` key with
 * the value a [[Terms]] instance. These instances categorize the keys (terms) defined by the specification for that specific interface, and this information is used
 * in the general algorithm for normalization and checks. Also, simple creation functions are defined to create object instances that implement those interfaces, whereby  `$terms` is
 * initialized to the respective [[Terms]] subclass instances (i.e., [[PublicationManifestTerms]], [[LinkedResourceTerms]], [[EntityTerms]], and [[LocalizableStringTerms]]).
 *
 */

/**
 * The core interfaces that are implemented in this module
 */
import {
    URL,
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection
} from '../manifest';

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
export abstract class Terms {
    /** Terms referring to a single literal (e.g., `id`) */
    protected single_literal   : string[];

    /** Terms referring to an array (list) of literals (e.g., the terms in [[a11y_properties]]) */
    protected array_of_literals: string[];

    /** Terms referring to an array of (localizable) strings (e.g., `name`) */
    protected array_of_strings : string[];

    /** Terms referring to an array of entities (e.g., the terms in [[creator_properties]]) */
    protected array_of_entities: string[];

    /** Terms referring to an array of linked resources (e.g., `readingOrder`) */
    protected array_of_links   : string[];

    /** Terms referring to a single URL (not used at present, added as a placeholder) */
    protected single_url       : string[];

    /** Terms referring to an array of URLs (e.g., `url`) */
    protected array_of_urls    : string[];

    /** Terms referring to a single boolean (e.g., `abridged`) */
    protected single_boolean   : string[];

    /** Terms referring to a single number (e.g., `length`) */
    protected single_number    : string[];

    /** Terms referring to a single value not listed above (not used at present, added as a placeholder) */
    protected single_misc      : string[];

    /** Terms referring to an array of values not listed above (e.g., `accessModeSufficient`) */
    protected array_of_miscs   : string[];

    /**
     * Is this term's value supposed to be an array?
     */
    is_array_term(term: string): boolean {
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
    is_entities_term(term: string): boolean {
        return this.array_of_entities.includes(term);
    }

    /**
     * Is this term's value supposed to be an array of localizable strings?
     */
    is_strings_term(term: string): boolean {
        return this.array_of_strings.includes(term);
    }

    /**
     * Is this term's value supposed to be an array of linked resources?
     */
    is_links_term(term: string): boolean {
        return this.array_of_links.includes(term);
    }

    /**
     * Is this term's value supposed to be a single URL?
     */
    is_single_url_term(term: string): boolean {
        return this.single_url.includes(term);
    }

    /**
     * Is this term's value supposed to be a single boolean?
     */
    is_single_boolean_term(term: string): boolean {
        return this.single_boolean.includes(term);
    }

    /**
     * Is this term's value supposed to be a single number?
     */
    is_single_number_term(term: string): boolean {
        return this.single_number.includes(term);
    }

    /**
     * Is this term's value a single or a string of literal(s)?
     */
    is_literal_or_literals_term(term: string): boolean {
        return [...this.single_literal, ...this.array_of_literals].includes(term);
    }

    /**
     * Is this term's value a single or a string of literal(s)?
     */
    is_url_or_urls_term(term: string): boolean {
        return [...this.single_url, ...this.array_of_urls].includes(term)
    }

    /**
     * Is this term's value supposed to be an array of URLs?
     */
    is_urls_term(term: string): boolean {
        return this.array_of_urls.includes(term);
    }

    /**
     * Is this term's value a regular term, ie, which does not require special handling
     */
    is_regular_term(term: string): boolean {
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
    is_valid_term(term: string): boolean {
        return this.all_terms.includes(term);
    }

    /**
     * Is this term's value supposed to be map?
     * (Not used at present, added as a placeholder))
     */
    is_map_term(term: string): boolean {
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

/**
 * Terms defined for [[Entity]] instances.
 */
class EntityTerms extends Terms {
    protected single_literal   : string[] = [];
    protected array_of_literals: string[] = ['type', 'identifier'];
    protected array_of_strings : string[] = ['name'];
    protected array_of_entities: string[] = [];
    protected array_of_links   : string[] = [];
    protected single_url       : string[] = ['id'];
    protected array_of_urls    : string[] = [];
    protected single_boolean   : string[] = [];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = [];
}

/**
 * Terms defined for [[LinkedResource]] instances
 */
class LinkedResourceTerms extends Terms {
    protected single_literal   : string[] = ['encodingFormat', 'integrity', 'duration'];
    protected array_of_literals: string[] = ['rel'];
    protected array_of_strings : string[] = ['name', 'description'];
    protected array_of_entities: string[] = [];
    protected array_of_links   : string[] = ['alternate'];
    protected single_url       : string[] = ['url'];
    protected array_of_urls    : string[] = [];
    protected single_boolean   : string[] = [];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = [];
}

/**
 * Terms defined for [[LocalizableString]] instances
 */
class LocalizableStringTerms extends Terms {
    protected single_literal   : string[] = ['value', 'language', 'direction'];
    protected array_of_literals: string[] = [];
    protected array_of_strings : string[] = [];
    protected array_of_entities: string[] = [];
    protected array_of_links   : string[] = [];
    protected single_url       : string[] = [];
    protected array_of_urls    : string[] = [];
    protected single_boolean   : string[] = [];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = [];
}

/**
 * Terms defined for the [[PublicationManifest]] instances
 */
class PublicationManifestTerms extends Terms {
    protected single_literal   : string[] = ['dateModified', 'datePublished', 'readingProgression'];
    protected array_of_literals: string[] = [...a11y_properties, 'inLanguage', 'type', 'conformsTo'];
    protected array_of_strings : string[] = ['name', 'accessibilitySummary'];
    protected array_of_entities: string[] = [...creator_properties];
    protected array_of_links   : string[] = ['readingOrder', 'resources', 'links'];
    protected single_url       : string[] = ['id'];
    protected array_of_urls    : string[] = ['url'];
    protected single_boolean   : string[] = ['abridged'];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = ['accessModeSufficient'];
}

/**
 * The notion of "recognizable types" appears in the processing algorithm section, and is a good shorthand in the code...
 */
export type RecognizedTypes_Impl = Person_Impl | Organization_Impl | LinkedResource_Impl;


/**
 * Adding the extra [[Terms]] reference; this is a common interface type for all manifest subtypes.
 */
interface Impl {
    /** A [[Terms]] instance referring to the terms defined for a respective interface of interest */
    $terms: Terms;
}

/**
 * Extension of [[Entity]] adding a reference to entity specific terms. aliased by [[Person_Impl]] or [[Organization_Impl]]
 */
export interface Entity_Impl extends Entity, Impl {}

/**
 * Creation of a new [[Entity_Impl]] instance, adding an instance of [[EntityTerms]].
 */
export function new_Entity_Impl(): Entity_Impl {
    const retval = {} as Entity_Impl;
    retval.$terms = new EntityTerms();
    return retval;
}

/**
 * Check whether an object is of type [[Entity_Impl]].
 */
export function isEntity_Impl(obj: any): boolean {
    return obj.$terms !== undefined && obj.$terms instanceof EntityTerms;
}

/**
 * An alias to [[Entity_Impl]].
 */
export type Person_Impl = Entity_Impl;

/**
 * An alias to [[Entity_Impl]].
 */
export type Organization_Impl = Entity_Impl;


/**
 * Extension of [[LocalizableString]] adding a reference to entity specific terms.
 */
export interface LocalizableString_Impl extends LocalizableString, Impl {
    /**  This is necessary for some of the generic code although, strictly speaking, a localizable string should not have any more terms... */
    [index: string] : any;
}

/**
 * Creation of a new [[LocalizableString_Impl]] instance, adding an instance of [[LocalizableStringTerms]].
 */
export function new_LocalizableString_Impl(): LocalizableString_Impl {
    const retval = {} as LocalizableString_Impl;
    retval.$terms = new LocalizableStringTerms();
    return retval;
}

/**
 * Check whether an object is of type [[LocalizableString_Impl]]
 */
export function isLocalizableString_Impl(obj: any): boolean {
    return obj.$terms !== undefined && obj.$terms instanceof LocalizableStringTerms;
}

/**
 * Extension of [[LinkedResource]] adding a reference to entity specific terms.
 */
export interface LinkedResource_Impl extends LinkedResource, Impl {}

/**
 * Creation of a new [[LinkedResource_Impl]] instance, adding an instance of [[LinkedResourceTerms]].
 */
export function new_LinkedResource_Impl(): LinkedResource_Impl {
    const retval = {} as LinkedResource_Impl;
    retval.$terms = new LinkedResourceTerms();
    return retval;
}

/**
 * Check whether an object is of type [[LinkedResource_Impl]]
 */
export function isLinkedResource_Impl(obj: any): boolean {
    return obj.$terms !== undefined && obj.$terms instanceof LinkedResourceTerms;
}

/**
 * Extension of [[PublicationManifest]] adding a reference to entity specific terms.
 */
export interface PublicationManifest_Impl extends PublicationManifest, Impl {}

/**
 * Creation of a new [[PublicationManifest_Impl]] instance, adding an instance of [[PublicationManifestTerms]].
 */
export function new_PublicationManifest_Impl(): PublicationManifest_Impl {
    const retval = {} as PublicationManifest_Impl;
    retval.$terms = new PublicationManifestTerms();
    return retval;
}
