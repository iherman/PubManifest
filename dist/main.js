"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("./process");
const utilities_1 = require("./utilities");
const base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';
const default_test = 'lo';
function main(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new utilities_1.Logger();
        try {
            const manifest_object = yield process_1.generate_representation(url, '', logger);
            console.log(JSON.stringify(manifest_object, null, 4));
            console.log(logger.toString());
        }
        catch (e) {
            console.log(e);
        }
    });
}
// Look at the process.argv for arguments
// print process.argv
const test_url = (process.argv[2] !== undefined) ? `${base}test_${process.argv[2]}.json` : `${base}test_${default_test}.json`;
main(test_url);
//# sourceMappingURL=main.js.map