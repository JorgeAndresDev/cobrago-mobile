import { registerRootComponent } from 'expo';
import { Buffer } from 'buffer';

// @ts-ignore
global.Buffer = Buffer;

// ─────────────────────────────────────────────────────────────────
// Filtro de errores conocidos de librerías de terceros
// El evento "topSvgLayout" es un bug de compatibilidad de
// react-native-svg con Expo Go SDK 56. No afecta la funcionalidad.
// Este filtro se puede eliminar cuando se actualice la librería.
// ─────────────────────────────────────────────────────────────────
const _originalConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const message = args[0]?.toString?.() ?? '';
  if (message.includes('topSvgLayout')) return;
  _originalConsoleError(...args);
};

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
