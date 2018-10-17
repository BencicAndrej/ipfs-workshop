const IPFS = require("ipfs");

let ipfs = null;

/**
 * @return {Promise<IPFS>}
 */
const create = () => {
    return new Promise((resolve, reject) => {
        const ipfs = new IPFS({
            repo: './datadir',
            start: false,
        });

        ipfs.on('error', reject);
        ipfs.on('ready', () => resolve(ipfs));
    })
};

/**
 * @return {Promise<IPFS>}
 */
const instance = async () => {
    if (ipfs === null) {
        ipfs = await create()
    }

    return ipfs
};

module.exports = {
    instance,
};
