'use strict';

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;
const path = require('path');

/*var selectedManga = {};*/

angular.module('mangadlapp', ['ngAnimate'])
/*    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller:'ListController as list',
                templateUrl:'list.html'
            })
            .when('/manga', {
                controller:'MangaController as manga',
                templateUrl:'manga.html'
            })
            .otherwise({
                redirectTo:'/'
            });
    })*/

    .controller('ListController',
        function($timeout) {
            var list = this;

            list.name = '';
            list.mangas = [];
            list.manga = {};
            list.manga.volumes = null;
            list.loading = false;
            list.downloading = false;

            ipcRenderer.on('manga', (event, manga) => {
                $timeout(() => {
                    list.mangas = manga;
                    list.loading = false;
                }, 0);
            });

            ipcRenderer.on('volumes', (event, volumes) => {
                $timeout(() => {
                    list.manga.volumes = volumes;
                    for (let volume of list.manga.volumes) {
                        volume.selected = true;
                    }
                    list.loading = false;
                }, 0);
            });

            ipcRenderer.on('loading', (event, data) => {
                $timeout(() => {
                    let done = true;
                    for (let volume of list.manga.volumes) {
                        if (volume.name == data.name) {
                            volume.loading = data.loading;
                        }
                        
                        if (volume.selected && volume.loading !== 100) {
                            done = false;
                        }
                    }

                    if (done) {
                        list.downloading = false;
                    }
                }, 0);
            });

            ipcRenderer.on('saveToPath', (event, path) => {
                list.downloading = true;
                list.manga.path = path;

                let volumes = [];
                for (let volume = 0; volume < list.manga.volumes.length; volume++) {
                    if (list.manga.volumes[volume].selected) {
                        volumes.push(volume);
                    }
                }

                const windowID = BrowserWindow.getAllWindows()[0].id;
                const downloader = `file://${__dirname}/downloader.html`;
                let win = new BrowserWindow({ width: 400, height: 400, show: false });
                win.loadURL(downloader);

                win.webContents.on('did-finish-load', function () {
                    win.webContents.send('save', list.manga, volumes, windowID)
                });
            });

            list.search = () => {
                list.loading = true;
                ipcRenderer.send('search', list.name);
            };

            list.select = (index) => {
                list.loading = true;
                list.manga = list.mangas[index];
                ipcRenderer.send('getVolumes', list.manga.url);
                return false;
            };

            list.selection = $event => {
                if (!list.downloading) {
                    let selected = $event.target.checked;
                    for (let volume of list.manga.volumes) {
                        volume.selected = selected;
                    }
                }
            };

            list.save = () => {
                ipcRenderer.send('saveVolumes');
            };
        });
/*

    .controller('MangaController',
        function($location, $routeParams, $timeout) {
            var manga = this;
            //var url = $routeParams.url;

            manga.url = selectedManga.url;
            manga.name = selectedManga.name;
            manga.image = selectedManga.image;
            manga.description = selectedManga.description;
            manga.volumes = [];

            ipcRenderer.on('volumes', (event, volumes) => {
                $timeout(() => {
                    manga.volumes = volumes;
                }, 0);
            });

            ipcRenderer.send('getVolumes', manga.url);
        });

*/
