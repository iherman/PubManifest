import { PublicationManifest, LinkedResource, LocalizableString } from "./manifest";
import { create_manifest_object } from "./utils";
import { Logger } from "./logger";

const test_authored = `
{
    "@context" : ["https://schema.org", "https://www.w3.org/ns/pub-context"],
    "name" : "My Wonderful Book",
    "id" : "ISBN1234567890",
    "url": "urn:abcdefghij",
    "type" : ["CreativeWork"],
    "author": "John Smith",
    "readingOrder" : [
        "namivan.html",
        {
            "type": "LinkedResource",
            "url": "ezvan.html",
            "name": "this is the second chapter"
        }
    ]
}
`;





const logger = new Logger();
const manifest_object = create_manifest_object(test_authored, logger);
console.log(manifest_object)
// console.log(">>>", manifest_object.readingOrder )





console.log(logger.toString());

