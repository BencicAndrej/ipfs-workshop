const fs = require("fs");

const IPFS = require("./util/ipfs");
const crypto = require("./util/crypto");

async function putCommand(documentPath, options = {}) {
    const documentRoot = parseDocument(documentPath);

    const ipfsRoot = await createIPFSNode(documentRoot, options.password);

    const documentNode = parseIPFSObject(ipfsRoot);

    console.log(JSON.stringify(documentNode));
}

function parseDocument(documentPath) {
    const data = fs.readFileSync(documentPath);

    return JSON.parse(data);
}

async function createIPFSNode(node, password = null) {
    const ipfs = await IPFS.instance();

    let obj = await ipfs.object.new();

    for (let link in node.links || {}) {
        const linkNode = await createIPFSNode(node.links[link], password);

        obj = await ipfs.object.patch.addLink(obj.multihash, {
            name: link,
            size: linkNode.size,
            multihash: linkNode.multihash,
        });
    }

    let data = JSON.stringify(node.data);
    if (password) {
        //@TODO: Encrypt node data on put.
    }

    return await ipfs.object.patch.setData(
        obj.multihash, Buffer.from(data));
}

async function getCommand(hash, options = {}) {
    let path;
    [hash, ...path] = hash.split("/").filter(el => el.length > 0);

    let documentNode = await getDocumentNodeByHash(hash);

    if (path.length > 0) {
        documentNode = await getDocumentNodeAtPath(documentNode, path);
    }

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
    for (let i = 0; i < path.length; i++) {
        const linkName = path[i];

        const linkHash = node.links[linkName];
        if (!linkHash) {
            throw new Error(`link not found: ${linkName}`)
        }

        node = await getDocumentNodeByHash(linkHash);
    }

    return node;
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
