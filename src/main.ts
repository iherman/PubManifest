import { generate_representation } from "./process";
import { Logger } from "./utilities";

const base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';
const default_test = 'lo';

async function main(url: string) {
    const logger = new Logger();
    try {
        const manifest_object = await generate_representation(url, '', logger);
        console.log(JSON.stringify(manifest_object, null, 4))
        console.log(logger.toString());
    } catch(e) {
        console.log(e)
    }
}

// Look at the process.argv for arguments
// print process.argv
const test_url = (process.argv[2] !== undefined) ? `${base}test_${process.argv[2]}.json` : `${base}test_${default_test}.json`;
main(test_url);



