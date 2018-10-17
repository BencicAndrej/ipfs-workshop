const fs = require("fs");

const IPFS = require("./util/ipfs");
const crypto = require("./util/crypto");

async function putCommand(documentPath, options = {}) {
    const documentRoot = parseDocument(documentPath);

    console.log(JSON.stringify(documentRoot));
}

function parseDocument(documentPath) {
    const data = fs.readFileSync(documentPath);

    return JSON.parse(data);
}

async function createIPFSNode(node) {
    const ipfs = await IPFS.instance();

    //@TODO: Implement saving node to IPFS.
}

async function getCommand(hash, options = {}) {
    console.log("Implement me!");
}

module.exports = {
    putCommand,
    getCommand,
};
