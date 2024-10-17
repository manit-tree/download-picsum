#!/usr/bin/env node

import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

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

/*
for (let i=1;i<=10;i++) {
    download('https://picsum.photos/800/600');
}
*/

function get_default(x, y) {
    if (x == undefined || x == null) {
        return y;
    }

    return x;
}

let size = get_default(argv.size, '800x600');
let items = get_default(argv.items, 25);
let arr = size.split('x');

for (let i = 1; i <= items; i++) {
    download(`https://picsum.photos/${arr[0]}/${arr[1]}`);
}
