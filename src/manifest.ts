export type RecognizedTypes = Person | Organization | LinkedResource;

export interface Entity {
    type?       : string[];
    name        : LocalizableString[];
    id?         : string;
    url?        : string;
    identifier? : string[];
    // [propName: string] : any;
};

export interface Person extends Entity {};

export interface Organization extends Entity {};

export interface LocalizableString {
    value      : string;
    language?  : string;
    direction? : string;
};

export enum ProgressionDirection {
    ltr = 'ltr',
    rtl = 'rtl',
};

export interface LinkedResource {
    url                : string;
    encodingFormat?    : string;
    name?              : LocalizableString[];
    description?       : LocalizableString;
    rel?               : string[];
    integrity?         : string;
    length?            : number;
    alternate?         : LinkedResource[];
    // [propName: string] : any;
};

export interface PublicationManifest {
    type?                 : string[];
    id?                   : string;
    profile               : string;
    conformsTo            : string[];

    accessMode?           : string[];
    accessModeSufficient? : string[];
    accessibilityFeature? : string[];
    accessibilityHazard?  : string[];
    accessibilitySummary? : LocalizableString [];
    artist?               : Entity[];
    author?               : Entity[];
    colorist?             : Entity[];
    contributor?          : Entity[];
    creator?              : Entity[];
    editor?               : Entity[];
    illustrator?          : Entity[];
    inker?                : Entity[];
    letterer?             : Entity[];
    penciler?             : Entity[];
    publisher?            : Entity[];
    readBy?               : Entity[];
    translator?           : Entity[];

    url?                  : string[];
    duration?             : string;
    inLanguage?           : string[];
    dateModified?         : string;
    datePublished?        : string;
    abridged?             : boolean;
    readingProgression?   : ProgressionDirection;
    name                  : LocalizableString[];
    readingOrder          : LinkedResource[];
    resources?            : LinkedResource[];
    links?                : LinkedResource[];
    // [propName: string] : any;
};

