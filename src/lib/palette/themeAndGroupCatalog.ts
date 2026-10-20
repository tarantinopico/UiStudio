import type {
  ComposeElement,
  ProjectTheme,
  WidgetGroupTemplate,
} from '../../types/models';

/**
 * Built-in reusable Studio Themes (covering Modern Glassmorphism, Material You M3,
 * Lightweight Minimalist, and High-Contrast Neo-Brutalist).
 */
export const BUILT_IN_THEMES: ProjectTheme[] = [
  {
    id: 'theme-aurora-glass',
    name: 'Aurora Glass & Gradient',
    stylePreset: 'modern-glass',
    isDark: true,
    primaryColor: '#6366F1',
    secondaryColor: '#312E81',
    accentColor: '#38BDF8',
    backgroundColor: '#090D16',
    surfaceColor: '#1E293B',
    textColor: '#F8FAFC',
    useGradient: true,
    gradientStart: '#0F172A',
    gradientEnd: '#1E1B4B',
    gradientAngle: 145,
    fontFamily: 'Plus Jakarta Sans',
    glassBlurPx: 16,
    glassOpacity: 0.72,
    defaultCornerRadiusDp: 22,
    borderStrokeWidthDp: 1,
    isBuiltIn: true,
  },
  {
    id: 'theme-material-emerald',
    name: 'Material 3 Emerald Pulse',
    stylePreset: 'material-you',
    isDark: true,
    primaryColor: '#10B981',
    secondaryColor: '#065F46',
    accentColor: '#34D399',
    backgroundColor: '#06120E',
    surfaceColor: '#11261F',
    textColor: '#ECFDF5',
    useGradient: false,
    gradientStart: '#06120E',
    gradientEnd: '#064E3B',
    gradientAngle: 135,
    fontFamily: 'Plus Jakarta Sans',
    glassBlurPx: 0,
    glassOpacity: 1,
    defaultCornerRadiusDp: 20,
    borderStrokeWidthDp: 1,
    isBuiltIn: true,
  },
  {
    id: 'theme-lightweight-paper',
    name: 'Featherlight Minimal (Light)',
    stylePreset: 'lightweight-minimal',
    isDark: false,
    primaryColor: '#0F172A',
    secondaryColor: '#E2E8F0',
    accentColor: '#4F46E5',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    useGradient: false,
    gradientStart: '#F8FAFC',
    gradientEnd: '#EEF2FF',
    gradientAngle: 180,
    fontFamily: 'System Sans',
    glassBlurPx: 0,
    glassOpacity: 1,
    defaultCornerRadiusDp: 12,
    borderStrokeWidthDp: 1,
    isBuiltIn: true,
  },
  {
    id: 'theme-sunset-cyber',
    name: 'Sunset Coral Glass',
    stylePreset: 'modern-glass',
    isDark: true,
    primaryColor: '#F43F5E',
    secondaryColor: '#881337',
    accentColor: '#FB923C',
    backgroundColor: '#120812',
    surfaceColor: '#271224',
    textColor: '#FFF1F2',
    useGradient: true,
    gradientStart: '#180B1A',
    gradientEnd: '#3B0F2B',
    gradientAngle: 160,
    fontFamily: 'Geometric Rounded',
    glassBlurPx: 18,
    glassOpacity: 0.68,
    defaultCornerRadiusDp: 24,
    borderStrokeWidthDp: 1,
    isBuiltIn: true,
  },
  {
    id: 'theme-neo-mono',
    name: 'Developer Brutalist Mono',
    stylePreset: 'neo-brutalist',
    isDark: true,
    primaryColor: '#FACC15',
    secondaryColor: '#27272A',
    accentColor: '#38BDF8',
    backgroundColor: '#09090B',
    surfaceColor: '#18181B',
    textColor: '#FAFAFA',
    useGradient: false,
    gradientStart: '#09090B',
    gradientEnd: '#18181B',
    gradientAngle: 135,
    fontFamily: 'JetBrains Mono',
    glassBlurPx: 0,
    glassOpacity: 1,
    defaultCornerRadiusDp: 6,
    borderStrokeWidthDp: 2,
    isBuiltIn: true,
  },
];

/**
 * Predefined multi-widget groups (Composite UI blocks) ready for 1-tap insertion.
 */
export const BUILT_IN_WIDGET_GROUPS: WidgetGroupTemplate[] = [
  {
    id: 'group-bottom-nav-fab',
    name: 'Bottom Bar + Floating Action Dock',
    description: 'Material 3 NavigationBar paired with an elevated QR/Create FAB.',
    category: 'Navigation',
    isBuiltIn: true,
    createdAt: 1700000000000,
    elements: [
      {
        type: 'BottomNavigationBar',
        name: 'DockNavigationBar',
        x: 0,
        y: 72,
        width: 412,
        height: 80,
        locked: false,
        hidden: false,
        props: {
          backgroundColor: '#0F172A',
          contentColor: '#818CF8',
          itemsList: ['Home', 'Wallet', 'Analytics', 'Profile'],
          selectedIndex: 0,
        },
      },
      {
        type: 'FAB',
        name: 'DockFloatingAction',
        x: 252,
        y: 0,
        width: 140,
        height: 56,
        locked: false,
        hidden: false,
        props: {
          text: 'Quick Action',
          iconName: 'Zap',
          backgroundColor: '#6366F1',
          contentColor: '#FFFFFF',
          cornerRadius: 18,
          elevation: 6,
        },
      },
    ],
  },
  {
    id: 'group-hero-balance-actions',
    name: 'Glass Balance Card + Quick Actions',
    description: 'Frosted glass portfolio card with Send and Receive action buttons.',
    category: 'Finance',
    isBuiltIn: true,
    createdAt: 1700000000001,
    elements: [
      {
        type: 'Card',
        name: 'GlassPortfolioCard',
        x: 0,
        y: 0,
        width: 372,
        height: 148,
        locked: false,
        hidden: false,
        props: {
          text: '$42,890.00',
          secondaryText: 'Available Liquidity · +8.4% APR',
          backgroundColor: '#312E81',
          gradientEndColor: '#1E1B4B',
          useGradientBg: true,
          glassEffect: true,
          glassBlur: 16,
          glassOpacity: 0.82,
          contentColor: '#FFFFFF',
          borderColor: '#6366F1',
          borderWidth: 1,
          padding: 20,
          cornerRadius: 24,
          fontSize: 26,
          fontWeight: 'Bold',
        },
      },
      {
        type: 'Button',
        name: 'SendActionBtn',
        x: 0,
        y: 164,
        width: 180,
        height: 48,
        locked: false,
        hidden: false,
        props: {
          text: 'Send Instant',
          backgroundColor: '#6366F1',
          contentColor: '#FFFFFF',
          cornerRadius: 24,
          fontSize: 14,
          fontWeight: 'SemiBold',
        },
      },
      {
        type: 'Button',
        name: 'RequestActionBtn',
        x: 192,
        y: 164,
        width: 180,
        height: 48,
        locked: false,
        hidden: false,
        props: {
          text: 'Receive QR',
          backgroundColor: '#1E293B',
          contentColor: '#E2E8F0',
          borderColor: '#475569',
          borderWidth: 1,
          cornerRadius: 24,
          fontSize: 14,
          fontWeight: 'SemiBold',
        },
      },
    ],
  },
  {
    id: 'group-search-filter-strip',
    name: 'Search Bar + Filter Chips Row',
    description: 'Outlined search input with horizontal category FilterChips.',
    category: 'Headers',
    isBuiltIn: true,
    createdAt: 1700000000002,
    elements: [
      {
        type: 'TextField',
        name: 'GlobalSearchField',
        x: 0,
        y: 0,
        width: 372,
        height: 56,
        locked: false,
        hidden: false,
        props: {
          text: 'Search components, templates...',
          secondaryText: 'Quick Search',
          backgroundColor: '#0F172A',
          contentColor: '#F8FAFC',
          borderColor: '#6366F1',
          borderWidth: 1,
          cornerRadius: 16,
        },
      },
      {
        type: 'Chip',
        name: 'ChipAll',
        x: 0,
        y: 68,
        width: 112,
        height: 36,
        locked: false,
        hidden: false,
        props: {
          text: 'All Items',
          checked: true,
          backgroundColor: '#6366F1',
          contentColor: '#FFFFFF',
          cornerRadius: 12,
        },
      },
      {
        type: 'Chip',
        name: 'ChipTrending',
        x: 124,
        y: 68,
        width: 118,
        height: 36,
        locked: false,
        hidden: false,
        props: {
          text: 'Trending',
          checked: false,
          backgroundColor: '#1E293B',
          contentColor: '#CBD5E1',
          cornerRadius: 12,
        },
      },
      {
        type: 'Chip',
        name: 'ChipSaved',
        x: 254,
        y: 68,
        width: 118,
        height: 36,
        locked: false,
        hidden: false,
        props: {
          text: 'Saved',
          checked: false,
          backgroundColor: '#1E293B',
          contentColor: '#CBD5E1',
          cornerRadius: 12,
        },
      },
    ],
  },
  {
    id: 'group-media-player-card',
    name: 'Glass Media Player Deck',
    description: 'Now-playing audio card with progress slider and play controls.',
    category: 'Media',
    isBuiltIn: true,
    createdAt: 1700000000003,
    elements: [
      {
        type: 'Card',
        name: 'NowPlayingSurface',
        x: 0,
        y: 0,
        width: 372,
        height: 152,
        locked: false,
        hidden: false,
        props: {
          text: 'Midnight Synthwave · Live Mix',
          secondaryText: 'Dolby Atmos Spatial Audio · 24-bit FLAC',
          backgroundColor: '#1E1B4B',
          glassEffect: true,
          glassBlur: 18,
          glassOpacity: 0.78,
          contentColor: '#F8FAFC',
          borderColor: '#6366F1',
          borderWidth: 1,
          cornerRadius: 24,
          padding: 18,
        },
      },
      {
        type: 'Slider',
        name: 'TrackSeekSlider',
        x: 18,
        y: 92,
        width: 268,
        height: 44,
        locked: false,
        hidden: false,
        props: {
          text: '02:41 / 03:58',
          progress: 0.68,
          backgroundColor: '#38BDF8',
          contentColor: '#E2E8F0',
        },
      },
      {
        type: 'IconButton',
        name: 'PlayPauseButton',
        x: 304,
        y: 88,
        width: 48,
        height: 48,
        locked: false,
        hidden: false,
        props: {
          iconName: 'Play',
          backgroundColor: '#6366F1',
          contentColor: '#FFFFFF',
          cornerRadius: 24,
        },
      },
    ],
  },
];

/**
 * Applies a ProjectTheme to a list of ComposeElements (used when applying a theme
 * to a screen or when inserting a Widget Group with "Use Theme Colors" enabled).
 */
export function applyThemeToElements<
  T extends Pick<ComposeElement, 'type' | 'props'>
>(elements: T[], theme: ProjectTheme): T[] {
  const isGlass = theme.stylePreset === 'modern-glass' || theme.glassBlurPx > 0;

  return elements.map((el) => {
    const newProps = { ...el.props };
    newProps.fontFamily = theme.fontFamily;

    switch (el.type) {
      case 'Button':
      case 'FAB':
        newProps.backgroundColor = theme.primaryColor;
        newProps.contentColor = theme.isDark ? '#FFFFFF' : '#FFFFFF';
        newProps.cornerRadius = Math.max(12, theme.defaultCornerRadiusDp);
        if (theme.useGradient) {
          newProps.useGradientBg = true;
          newProps.gradientEndColor = theme.accentColor;
        } else {
          newProps.useGradientBg = false;
        }
        break;

      case 'Card':
      case 'Surface':
      case 'Column':
      case 'Row':
      case 'Box':
        newProps.backgroundColor = theme.surfaceColor;
        newProps.contentColor = theme.textColor;
        newProps.cornerRadius = theme.defaultCornerRadiusDp;
        newProps.borderWidth = theme.borderStrokeWidthDp;
        newProps.borderColor = theme.primaryColor;
        newProps.glassEffect = isGlass;
        newProps.glassBlur = theme.glassBlurPx;
        newProps.glassOpacity = theme.glassOpacity;
        if (theme.useGradient && el.type === 'Card') {
          newProps.useGradientBg = true;
          newProps.gradientEndColor = theme.secondaryColor;
        }
        break;

      case 'TopAppBar':
      case 'BottomNavigationBar':
      case 'NavigationRail':
      case 'TabRow':
        newProps.backgroundColor = theme.surfaceColor;
        newProps.contentColor = theme.primaryColor;
        newProps.glassEffect = isGlass;
        newProps.glassBlur = theme.glassBlurPx;
        break;

      case 'Text':
        newProps.contentColor = theme.textColor;
        break;

      case 'Icon':
      case 'IconButton':
      case 'Chip':
      case 'Switch':
      case 'Checkbox':
      case 'RadioButton':
      case 'Slider':
      case 'LinearProgressIndicator':
      case 'CircularProgressIndicator':
        newProps.backgroundColor = theme.primaryColor;
        newProps.contentColor = theme.textColor;
        break;

      case 'TextField':
        newProps.backgroundColor = theme.backgroundColor;
        newProps.contentColor = theme.textColor;
        newProps.borderColor = theme.primaryColor;
        newProps.cornerRadius = Math.min(16, theme.defaultCornerRadiusDp);
        break;

      default:
        break;
    }

    return {
      ...el,
      props: newProps,
    };
  });
}
