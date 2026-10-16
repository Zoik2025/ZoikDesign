const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const logFile = 'C:\\Users\\User\\electron_run.log';
function log(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
}

log('--- Main process starting ---');

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.stack || err}`);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});

app.setAppUserModelId('com.zoikdesign.app');

// Desactivar aceleración por hardware para evitar congelamientos, cuelgues de GPU y pantallas negras
app.disableHardwareAcceleration();

let mainWindow = null;

function createWindow() {
  log('createWindow called');
  try {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 920,
      minWidth: 1100,
      minHeight: 700,
      backgroundColor: '#0a0d14',
      title: 'Zoik Design',
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
      },
      show: true,
    });
    log('BrowserWindow created successfully');

    Menu.setApplicationMenu(null);

    const indexPath = path.join(__dirname, '../dist/index.html');
    log('Loading file: ' + indexPath + ' exists: ' + fs.existsSync(indexPath));

    mainWindow.loadFile(indexPath).then(() => {
      log('mainWindow.loadFile promise resolved successfully');
    }).catch(err => {
      log('mainWindow.loadFile error: ' + err.message);
    });

    mainWindow.webContents.on('render-process-gone', (event, details) => {
      log('render-process-gone: ' + JSON.stringify(details));
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log(`did-fail-load: ${errorCode} ${errorDescription}`);
    });

    mainWindow.on('close', () => {
      log('mainWindow close event fired');
    });

    mainWindow.on('closed', () => {
      log('mainWindow closed event fired');
      mainWindow = null;
    });
  } catch (err) {
    log('Error in createWindow: ' + err.stack);
  }
}

app.whenReady().then(() => {
  log('app.whenReady fired');
  createWindow();
});

app.on('window-all-closed', () => {
  log('window-all-closed fired');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  log('app activate fired');
  if (mainWindow === null) {
    createWindow();
  }
});
