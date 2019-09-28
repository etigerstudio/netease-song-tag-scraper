const writer = require('./writer');
const Tag = require('./tag');
const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const fs = require('fs');

    let files = [];
    fs.readdirSync(dir).forEach(file => {
        if (!fs.statSync(path.join(dir, file)).isDirectory()) {
            files.push(file);
        }
    });

    for (let file of files) {
        // TODO: Parse ID from comment key.
        let id = parseIDFromFileName(file);
        if (id) {
            Tag.fetchTagByID(id, (tag) => {
                let filePath = path.join(dir, file);
                writer.writeTagToFile(tag, filePath, (newName) => {
                    console.log('Tags successfully written to "' + newName + '".')
                }, (err) => {
                    logError(file, err);
                });
            }, (err) => {
                logError(file, err);
            });
        }
    }

    process.on('exit', (code) => {
        if (files.length > 0) {
            writer.purgeAlbumArts(dir);
            console.log('Temporary image files purged.');
        }
    });
}

function parseIDFromFileName(name) {
    let numberPattern = new RegExp(/\d+/g);
    let numbers = name.match(numberPattern);
    if (numbers) {
        let longestNumber = '';
        for (let n of numbers) {
            if (n.length > longestNumber.length) {
                longestNumber = n;
            }
        }
        if (longestNumber.length > 1) {
            return longestNumber;
        }
    }

    return '';
}

function logError(file, err) {
    console.error('Error occurred when processing "' + file + '". Error description: ' + err);
}

if (process.argv.length >= 3) {
    processDir(process.argv[2]);
} else {
    console.log('Please specify a directory to process.')
}