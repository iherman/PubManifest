export interface CreatorInfo {
    type?              : string[];
    name               : LocalizableString[];
    id?                : string;
    url?               : string;
    // [propName: string] : any;
};

export enum TextDirection {
    ltr,
    rtl,
    auto
};

export interface LocalizableString {
    value     : string;
    language? : string;
};

export enum ProgressionDirection {
    ltr,
    rtl
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
    inLanguage?           : string;
    inDirection?          : TextDirection;
    dateModified?         : string;
    datePublished?        : string;
    readingProgression?   : ProgressionDirection;
    name                  : LocalizableString[];
    readingOrder          : LinkedResource[];
    resources?            : LinkedResource[];
    links?                : LinkedResource[];

    // [propName: string]    : any;
};

