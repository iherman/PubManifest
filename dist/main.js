"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convert_1 = require("./convert");
const utilities_1 = require("./utilities");
const test = `
{
    "@context" : ["https://schema.org", "https://www.w3.org/ns/pub-context", {"language":"en-US"}],
    "name" : "My Wonderful Book",
    "id" : "ISBN1234567890",
    "url": "urn:abcdefghij",
    "type" : ["CreativeWork"],
    "author": [
        "John Smith",
        {
            "name" : "Bill Holiday",
            "url" : "http://example.org/BH",
            "identifier": "123456789"
        },
        {
            "url" : "http://just.a.url/"
        }
    ],

    "readingOrder" : [
        "namivan.html",
        {
            "type": "LinkedResource",
            "url": "ezvan.html",
            "name": "this is the second chapter",
            "description" : {
                "value" : "Ez az igazi!",
                "language": "hu"
            }
        },
        {
            "name": "Without a url..."
        }
    ]
}
`;
const logger = new utilities_1.Logger();
const manifest_object = convert_1.process_manifest(test, logger);
console.log(manifest_object);
// console.log(manifest_object.author[0].name)
// console.log(">>>", manifest_object.readingOrder )
console.log(logger.toString());
