import { Logger } from './utilities';
import { URL } from '../manifest';
import { Profile } from './profile';

/**
 * "Global data" object.
 *
 * These values are, conceptually, global variables shared among functions and extensions
 */
export class GlobalData {
    /** A [[Logger]] instance used to store the fatal and validation errors during processing. */
    logger : Logger;
    /** Global language tag declaration */
    lang   : string = '';
    /** Global base direction declaration */
    dir    : string = '';
    /** Global base URL */
    base   : URL = '';
    /** Final profile for the User Agent (stored only for testing purpose, not really used). */
    profile: Profile;
};

