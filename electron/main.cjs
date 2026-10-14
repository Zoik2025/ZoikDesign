const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Bloqueo de instancia única: Si el usuario hace doble clic otra vez, enfoca la ventana existente
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, '../dist/logo.svg');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0a0d14',
    title: 'Zoik Design',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0d14',
      symbolColor: '#cbd5e1',
      height: 38,
    },
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    show: true, // Mostrar de inmediato para garantizar apertura instantánea
  });

  // Eliminar menú nativo de Windows ("Archivo Edición...")
  Menu.setApplicationMenu(null);

  // Cargar siempre los archivos locales compilados de dist/index.html
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const indexPath = path.join(__dirname, '../dist/index.html');

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      mainWindow.loadFile(indexPath);
    });
  } else {
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
