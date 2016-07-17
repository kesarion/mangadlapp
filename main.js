'use strict';

const electron = require('electron');
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const co = require('co');

const Manga = require('manga-dl');

var manga;

ipcMain.on('search', (event, name) => co(function *() {
    event.sender.send('manga', yield Manga.findManga(name));
}));

ipcMain.on('getVolumes', (event, url) => co(function *() {
    manga = new Manga(url);
    event.sender.send('volumes', yield manga.getVolumes());
}));

ipcMain.on('saveVolumes', event => co(function *() {
    dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    }, path => {
        if (path) {
            event.sender.send('saveToPath', path);
        } else {
            console.log('Path not selected!');
        }
    });
}));


// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 755, titleBarStyle: 'hidden' });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    /*if (process.platform !== 'darwin') {
        app.quit()
    }*/
    app.quit()
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});
