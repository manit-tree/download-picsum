#!/usr/bin/env node

import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { program } from 'commander';


function get_default(x, y) {
    if (x == undefined || x == null) {
        return y;
    }

    return x;
}

async function download(url) {
    let res = await fetch(url);
    let filename;

    if (res.status == 200) {
        let re = /filename="(.+)"/
        let arr = res.headers.get('content-disposition').match(re);

        if (arr.length == 2) {
            filename = arr[1];
        }

        if (filename) {
            if (!fs.existsSync(filename)) {
                console.log(`download ${filename}`);
                let fileStream = fs.createWriteStream(filename, {flags: 'wx'});
                await finished(Readable.fromWeb(res.body).pipe(fileStream));
            }
        }
    }
}

program.name('download-picsum');
program.description('CLI to download images from picsum.photos');
program.requiredOption('-s, --size <image size>','Example: 800x600');
program.option('-i, --items <number>', 'Example: 25', 25);
program.action(options => {
    let re = /(\d+)x(\d+)/;
    let matches = options.size.match(re);

    if (matches && matches.length == 3) {
        for (let i = 1; i <= options.items; i++) {
            download(`https://picsum.photos/${matches[1]}/${matches[2]}`);
        }
    } else {
        program.error('invalid size: ' + options.size);
    }

})

program.showHelpAfterError();
program.parse();