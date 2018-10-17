const fs = require("fs");

const IPFS = require("./util/ipfs");
const crypto = require("./util/crypto");

async function putCommand(documentPath, options = {}) {
    const documentRoot = parseDocument(documentPath);

    const ipfsRoot = await createIPFSNode(documentRoot);

    console.log(ipfsRoot.toJSON().multihash);
}

function parseDocument(documentPath) {
    const data = fs.readFileSync(documentPath);

    return JSON.parse(data);
}

async function createIPFSNode(node) {
    const ipfs = await IPFS.instance();

    let obj = await ipfs.object.new();

    //@TODO: Add links to IPFS object.

    let data = JSON.stringify(node.data);

    return await ipfs.object.patch.setData(
        obj.multihash, Buffer.from(data));
}

async function getCommand(hash, options = {}) {
    console.log("Implement me!");
}

module.exports = {
    putCommand,
    getCommand,
};
