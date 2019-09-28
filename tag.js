const cheerio = require('cheerio');
const request = require('request');

class Tag {
    title;
    artist;
    album;
    albumArtURL;

    constructor(title, artist, album, albumArtURL) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.albumArtURL = albumArtURL;
    }

    static getTagByID(id, callback) {
        request({
            method: 'GET',
            url: 'https://music.163.com/song?id=' + id,
        }, (err, res, body) => {
            if (err) return callback(console.error(err));

            let $ = cheerio.load(body);
            let title = $('.f-cb .tit .f-ff2').text();
            let smallCover = $('.f-cb .u-cover img').attr('src');
            let fullCover = smallCover.substring(0, smallCover.lastIndexOf('?'));
            let description = $('.f-cb .des');
            let artist = description.eq(1).children('span').children('a').text();
            let album = description.eq(2).children('a').text();

            callback(new Tag(title, artist, album, fullCover));
        });
    }
}
