import { Profile } from './lib/profile';
import { GlobalData } from './lib/global';
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


export const audiobook_profile: Profile = {
    identifier: 'https://www.w3.org/TR/audiobooks/',
    generate_internal_representation(global_data: GlobalData, processed: PublicationManifest): PublicationManifest {
        return processed;
    },
    normalize_data(global_data: GlobalData, context: PublicationManifest_Impl | RecognizedTypes_Impl, term: string, value: any): any {
        return value;
    },
    data_validation(global_data: GlobalData, data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    },
    add_default_values(global_data: GlobalData, data: PublicationManifest_Impl, document: HTMLDocument): PublicationManifest_Impl {
        return data;
    }
}
