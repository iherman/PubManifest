"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = require("./manifest");
const canonicalManifest = manifest_1.Canonical.create_canonical('Na akkor mi van');
console.log(canonicalManifest.accessMode);
// this should fail, at least run-time...
canonicalManifest._accessMode = ['asdfasf'];
console.log(canonicalManifest.accessMode);
