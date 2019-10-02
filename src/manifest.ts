export interface CreatorInfo {
    type?              : string[];
    name               : LocalizableString[];
    id?                : string;
    url?               : string;
    identifier?        : string[];
    // [propName: string] : any;
};

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
    rel?               : LocalizableString[];
    integrity?         : string;
    length?            : number;
    // [propName: string] : any;
};

export interface PublicationManifest {
    type                  : string[];
    id                    : string;

    accessMode?           : string[];
    accessModeSufficient? : string[];
    accessibilityFeature? : string[];
    accessibilityHazard?  : string[];
    accessibilitySummary? : LocalizableString [];
    artist?               : CreatorInfo[];
    author?               : CreatorInfo[];
    colorist?             : CreatorInfo[];
    contributor?          : CreatorInfo[];
    creator?              : CreatorInfo[];
    editor?               : CreatorInfo[];
    illustrator?          : CreatorInfo[];
    inker?                : CreatorInfo[];
    letterer?             : CreatorInfo[];
    penciler?             : CreatorInfo[];
    publisher?            : CreatorInfo[];
    readBy?               : CreatorInfo[];
    translator?           : CreatorInfo[];

    url?                  : string[];
    duration?             : string;
    inLanguage?           : string[];
    dateModified?         : string;
    datePublished?        : string;
    readingProgression?   : ProgressionDirection;
    name                  : LocalizableString[];
    readingOrder          : LinkedResource[];
    resources?            : LinkedResource[];
    links?                : LinkedResource[];

    // [propName: string]    : any;
};

