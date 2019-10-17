import { PublicationManifest, LinkedResource, LocalizableString } from "./manifest";
import { process_manifest } from "./convert";
import { Logger } from "./utilities";

async function main(url: string) {
    const logger = new Logger();
    const manifest_object = await process_manifest(url, logger);
    console.log(JSON.stringify(manifest_object, null, 4))
    console.log(logger.toString());
}

main('http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/basic.json');



