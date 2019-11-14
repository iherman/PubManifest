/**
 * Module implementing the audiobook profile specific extension functions.
 *
 */

 /** The main interface defining what a Profile is for this implementation */
import { Profile } from './lib/profile';

/** Global data class */
import { Global } from './lib/utilities';

import {
    URL,
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection,
    RecognizedTypes
} from './manifest';

import {
    Entity_Impl,
    Person_Impl,
    Organization_Impl,
    LocalizableString_Impl,
    LinkedResource_Impl,
    RecognizedTypes_Impl,
    PublicationManifest_Impl,
    Terms
} from './lib/manifest_classes';

/**
 * Audiobook profile file instance. See [[Profile]] for the generic specification of this class;
 */
export const audiobook_profile: Profile = {
    identifier: 'https://www.w3.org/TR/audiobooks/',
    generate_internal_representation(processed: PublicationManifest): PublicationManifest {
        return processed;
    },
    normalize_data(context: PublicationManifest_Impl | RecognizedTypes_Impl, term: string, value: any): any {
        return value;
    },
    data_validation(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    },
    add_default_values(data: PublicationManifest_Impl, document: HTMLDocument): PublicationManifest_Impl {
        return data;
    }
}
