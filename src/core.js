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

    for (let link in node.links || {}) {
        const linkNode = await createIPFSNode(node.links[link]);

        obj = await ipfs.object.patch.addLink(obj.multihash, {
            name: link,
            size: linkNode.size,
            multihash: linkNode.multihash,
        });
    }

    let data = JSON.stringify(node.data);

    return await ipfs.object.patch.setData(
        obj.multihash, Buffer.from(data));
}

async function getCommand(hash, options = {}) {
    //@TODO: Implement get command.
}

async function getDocumentNodeByHash(hash) {
    const ipfs = await IPFS.instance();

    //@TODO: Implement node get by hash.

    return parseIPFSObject(object);
}


function parseIPFSObject(object) {
    //@TODO: Parse IPFS object.
}

module.exports = {
    putCommand,
    getCommand,
};
