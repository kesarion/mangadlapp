'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const co = require('co');
const Manga = require('../../downloaders/mangafox.me');

var manga;

ipcRenderer.on('save', (event, save) => co(function *() {
    manga = new Manga(save.url, save.path);

    for (let volume of save.volumes) {
        let loadingStarted = false;
        let interval = setInterval(function () {
            if (manga.loading[volume]) {
                loadingStarted = true;
                event.sender.send('progress', manga.loading);
                console.log(`${manga.loading[volume].done} Done ${manga.loading[volume].buffered} Buffered ${manga.loading[volume].total} Total`);
            } else if (loadingStarted) {
                console.log(`Volume ${volume} saved!`);
                clearInterval(interval);
            }
        }, 3000);
        yield manga.saveVolume(volume);
    }

    manga = null;
}));

ipcRenderer.send('ready', true);
