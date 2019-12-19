import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { ebtMain } from 'electron-baidu-tongji'
import { autoUpdater } from 'electron-updater'
import host from './host';
ebtMain(ipcMain)

const curVersion = require('../../package.json').version;

let winURL = ""
let mainWindow
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
    winURL = `file://${__dirname}/index.html`;
} else {
    app.getVersion = () => curVersion;
    winURL = `http://localhost:9080`;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        "width": 1216,
        "height": 830,
        "minWidth": 980,
        "minHeight": 600,
        "autoHideMenuBar": true,
        "webPreferences": {
            "nodeIntegration": true,
            "webSecurity": false,
        }
    });
    mainWindow.loadURL(winURL);
    mainWindow.on('closed', () => { mainWindow = null });
    host.start(mainWindow);
    if (process.env.NODE_ENV === 'production') {
        autoUpdater.checkForUpdates();
    }
    //todo 打开的提交窗口，windows系统不应该有菜单
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        let focusWin = BrowserWindow.getFocusedWindow()
        focusWin && focusWin.toggleDevTools()
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('imgUploadMain', (event, message) => {
    mainWindow.webContents.send('imgUploadMsgFromMain', message);
});
ipcMain.on('articlePublishMain', (event, message) => {
    mainWindow.webContents.send('articlePublishMsgFromMain', message);
});

ipcMain.on('updateMain', (event, message) => {
    autoUpdater.quitAndInstall()
})

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updateMsgFromMain');
})