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
    let documentNode = await getDocumentNodeByHash(hash);

    //@TODO: Extract hash and relative path from hash and get node at that path.

    if (options.expand) {
        documentNode = await expandDocumentNodeLinks(documentNode);
    }

    console.log(JSON.stringify(documentNode));
}

async function getDocumentNodeByHash(hash) {
    const ipfs = await IPFS.instance();

    let object = await ipfs.object.get(hash);

    return parseIPFSObject(object);
}

async function getDocumentNodeAtPath(node, path) {
    //@TODO: Implement relative node paths.
}

function parseIPFSObject(object) {
    let data = object.data.toString();

    data = JSON.parse(data);

    return {
        "hash": object._cid.toBaseEncodedString(),
        "data": data,
        "links": object.links.reduce((acc, link) => {
            acc[link.name] = link._cid.toBaseEncodedString();

            return acc
        }, {}),
    };
}

async function expandDocumentNodeLinks(node) {
    for (let linkName in node.links) {
        let linkHash = node.links[linkName];

        let linkNode = await getDocumentNodeByHash(linkHash);

        let expandedLink = await expandDocumentNodeLinks(linkNode);

        node.links[linkName] = expandedLink;
    }

    return node;
}


module.exports = {
    putCommand,
    getCommand,
};
