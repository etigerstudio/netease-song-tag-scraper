const NodeID3 = require('node-id3');
const request = require('request');
const fs = require('fs');
const path = require('path');
const url = require('url');

function writeTagToFile(tag, file, success, failure) {
    let dir = path.dirname(file);
    fetchAlbumArt(tag.albumArtURL, path.join(dir, '.album_arts'), (albumArtPath) => {
        let _tags = {
            title: tag.title,
            artist: tag.artist,
            album: tag.album,
            APIC: albumArtPath,
        };

        NodeID3.write(_tags, file, function (err, buffer) {
            if (err) {
                failure(err);
            } else {
                fs.unlinkSync(albumArtPath);
                let newName = getProperFilename(tag) + path.extname(file);
                fs.rename(file, path.join(dir, newName), (err) => {
                    if (err) {
                        console.log('Failed to rename "' + path.basename(file) + '" to "'
                            + getProperFilename(tag) + path.extname(file) + '".');
                        success(path.basename(file));
                    } else {
                        success(newName);
                    }
                });
            }
        })
    }, (err) => {
        failure(err);
    });
}

function fetchAlbumArt(albumArtURL, savePath, success, failure) {
    let filePath = path.join(savePath, path.basename(new URL(albumArtURL).pathname));

    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }
    let file = fs.createWriteStream(filePath);

    request
        .get(albumArtURL)
        .on('error', (err) => {
            failure(err)
        })
        .pipe(file)
        .on('close', function () {
            success(filePath);
        })
        .on('error', function (err) {
            fs.unlink(filePath);
            failure(err);
        });
}

function purgeAlbumArts(basePath) {
    let savePath = path.join(basePath, '.album_arts');
    if (fs.existsSync(savePath)) {
        fs.rmdirSync(savePath);
    }
}

function getProperFilename(tag) {
    return tag.title + ' - ' + tag.artist + ' - ' + tag.album;
}

module.exports.writeTagToFile = writeTagToFile;
module.exports.purgeAlbumArts = purgeAlbumArts;