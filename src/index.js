#!/usr/bin/env node

const program = require('commander');

const core = require("./core");

program
    .command('put <path>')
    .option('-p, --password = <password>', 'Password protect the document', null)
    .description('Put document from the data file as a graph of IPFS objects.')
    .action(async (path, cmd) => {
        await core.putCommand(path, {
            password: cmd.password,
        });
    });

program
    .command("get <hash>")
    .option('-e, --expand', 'Expand links')
    .option('-p, --password = <password>', 'Decrypt document with password', null)
    .description("Get the document element at specific hash")
    .action(async (hash, cmd) => {
        await core.getCommand(hash, {
            expand: cmd.expand,
            password: cmd.password,
        });
    });

// Print help when no command is found
program.command("*", null, {
    noHelp: true,
    isDefault: true
}).action(_ => {
    program.outputHelp()
});

program.parse(process.argv);

// Print help when using cli without arguments.
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

