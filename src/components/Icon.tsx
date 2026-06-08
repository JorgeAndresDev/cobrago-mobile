/**
 * Icon.tsx — Componente central de iconografía
 * Usa @expo/vector-icons (Ionicons/MaterialIcons) que usa fuentes TTF.
 * NO usa react-native-svg, eliminando el error "topSvgLayout" en dispositivos.
 */
import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type MaterialIconsName = React.ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Mapa de nombres semánticos → Ionicons
const ICON_MAP: Record<string, IoniconsName> = {
  // Navegación
  'arrow-left':       'arrow-back',
  'arrow-right':      'arrow-forward',
  'chevron-right':    'chevron-forward',
  'x':                'close',

  // Dashboard / General
  'trending-up':      'trending-up',
  'inbox':            'albums-outline',
  'info':             'information-circle-outline',
  'search':           'search-outline',
  'refresh':          'refresh',

  // Clientes
  'users':            'people',
  'user':             'person',
  'user-plus':        'person-add',
  'user-check':       'person-done',
  'phone':            'call-outline',
  'phone-call':       'call',
  'map-pin':          'location-outline',
  'trash':            'trash-outline',
  'edit':             'create-outline',
  'create':           'create-outline',
  'pencil':           'pencil-outline',
  'plus':             'add',
  'id-card':          'card-outline',

  // Préstamos / Finanzas
  'banknote':         'cash',
  'wallet':           'wallet-outline',
  'calculator':       'calculator-outline',
  'percent':          'pricetag-outline',
  'hash':             'keypad-outline',
  'file-text':        'document-text-outline',

  // Estado
  'check-circle':     'checkmark-circle',
  'alert-circle':     'alert-circle-outline',
  'clock':            'time-outline',
  'calendar':         'calendar-outline',
  'calendar-days':    'calendar-outline',

  // Perfil / Ajustes
  'lock':             'lock-closed-outline',
  'palette':          'color-palette-outline',
  'log-out':          'log-out-outline',
  'shield-check':     'shield-checkmark-outline',
  'mail':             'mail-outline',
  'life-buoy':        'help-circle-outline',
  'eye':              'eye-outline',
  'eye-off':          'eye-off-outline',

  // Fallback
  'default':          'ellipse-outline',
};

export const Icon = ({ name, size = 20, color = '#fff', style }: IconProps) => {
  const iconName = ICON_MAP[name] ?? ICON_MAP['default'];
  return <Ionicons name={iconName} size={size} color={color} style={style} />;
};

export default Icon;
