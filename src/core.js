const fs = require("fs");

const IPFS = require("./util/ipfs");
const crypto = require("./util/crypto");

async function putCommand(documentPath, options = {}) {
    console.log("Implement me!");
}

function parseDocument(documentPath) {
    //@TODO: Read file and print contents.
}

async function getCommand(hash, options = {}) {
    console.log("Implement me!");
}

module.exports = {
    putCommand,
    getCommand,
};
