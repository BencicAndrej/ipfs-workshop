const fs = require("fs");

const IPFS = require("./util/ipfs");
const crypto = require("./util/crypto");

async function putCommand(documentPath, options = {}) {
    const documentRoot = parseDocument(documentPath);

    const ipfsRoot = await createIPFSNode(documentRoot, options.password);

    const documentNode = parseIPFSObject(ipfsRoot, options.password);

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
        const linkPassword = password ? crypto.derive(password, link) : null;
        const linkNode = await createIPFSNode(node.links[link], linkPassword);

        obj = await ipfs.object.patch.addLink(obj.multihash, {
            name: link,
            size: linkNode.size,
            multihash: linkNode.multihash,
        });
    }

    let data = JSON.stringify(node.data);
    if (password) {
        data = crypto.encrypt(password, data);
    }

    return await ipfs.object.patch.setData(
        obj.multihash, Buffer.from(data));
}

async function getCommand(hash, options = {}) {
    let path;
    [hash, ...path] = hash.split("/").filter(el => el.length > 0);

    let documentNode = await getDocumentNodeByHash(hash, options.password);

    if (path.length > 0) {
        documentNode = await getDocumentNodeAtPath(documentNode, path, options.password);
    }

    if (options.expand) {
        documentNode = await expandDocumentNodeLinks(documentNode, documentNode.password);
    }

    console.log(JSON.stringify(documentNode));
}

async function getDocumentNodeByHash(hash, password = null) {
    const ipfs = await IPFS.instance();

    let object = await ipfs.object.get(hash);

    return parseIPFSObject(object, password);
}

async function getDocumentNodeAtPath(node, path, password = null) {
    for (let i = 0; i < path.length; i++) {
        const linkName = path[i];

        const linkHash = node.links[linkName];
        if (!linkHash) {
            throw new Error(`link not found: ${linkName}`)
        }

        const linkPassword = password ? crypto.derive(password, linkName) : null;

        node = await getDocumentNodeByHash(linkHash, linkPassword);
    }

    return node;
}

function parseIPFSObject(object, password = null) {
    let data = object.data.toString();

    let passwordMatch = false;
    if (password) {
        data = crypto.decrypt(password, data);

        passwordMatch = true;
    }

    try {
        data = JSON.parse(data);
    } catch (e) {
    }

    return {
        "hash": object._cid.toBaseEncodedString(),
        "data": data,
        "password": passwordMatch ? password : null,
        "links": object.links.reduce((acc, link) => {
            acc[link.name] = link._cid.toBaseEncodedString();

            return acc
        }, {}),
    };
}

async function expandDocumentNodeLinks(node, password = null) {
    for (let linkName in node.links) {
        let linkHash = node.links[linkName];

        const linkPassword = password ? crypto.derive(password, linkName) : null;

        let linkNode = await getDocumentNodeByHash(linkHash, linkPassword);

        let expandedLink = await expandDocumentNodeLinks(linkNode, linkPassword);

        node.links[linkName] = expandedLink;
    }

    return node;
}


module.exports = {
    putCommand,
    getCommand,
};
