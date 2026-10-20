/**
 * Core data models for ComposeStudio PWA.
 * Defines TypeScript interfaces for Projects, Screens, ComposeElements,
 * ProjectTheme, WidgetGroupTemplate, ElementProps, GridSettings, and Serialization.
 */

export type EditorMode = 'simple' | 'pro';
export type LayoutMode = 'free' | 'grid';
export type MaterialVersion = 'm3' | 'm2';
export type DeviceCategory = 'phone' | 'tablet' | 'custom';
export type MobileEditorLayout = 'classic-sheets' | 'thumb-cockpit';

export type DesignStylePreset =
  | 'modern-glass'
  | 'material-you'
  | 'lightweight-minimal'
  | 'neo-brutalist';

export type ProjectFontFamily =
  | 'Plus Jakarta Sans'
  | 'JetBrains Mono'
  | 'System Sans'
  | 'Editorial Serif'
  | 'Geometric Rounded';

export interface ProjectTheme {
  id: string;
  name: string;
  stylePreset: DesignStylePreset;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  useGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  fontFamily: ProjectFontFamily;
  glassBlurPx: number;
  glassOpacity: number;
  defaultCornerRadiusDp: number;
  borderStrokeWidthDp: number;
  isBuiltIn?: boolean;
}

export type WidgetCategory =
  | 'layout'
  | 'inputs'
  | 'surfaces'
  | 'navigation'
  | 'feedback';

export type WidgetType =
  // Layout
  | 'Box'
  | 'Column'
  | 'Row'
  | 'LazyColumn'
  | 'LazyRow'
  | 'ConstraintLayout'
  | 'Spacer'
  | 'Scaffold'
  // Core & Inputs
  | 'Text'
  | 'Button'
  | 'IconButton'
  | 'Icon'
  | 'Image'
  | 'TextField'
  | 'Switch'
  | 'Checkbox'
  | 'RadioButton'
  | 'Slider'
  // Surfaces & Display
  | 'Card'
  | 'Surface'
  | 'Divider'
  | 'Chip'
  | 'Badge'
  // Navigation & Bars
  | 'TopAppBar'
  | 'BottomNavigationBar'
  | 'NavigationRail'
  | 'FAB'
  | 'TabRow'
  // Progress & Custom
  | 'LinearProgressIndicator'
  | 'CircularProgressIndicator'
  | 'CustomPlaceholder';

export type HorizontalAlignment = 'Start' | 'CenterHorizontally' | 'End';
export type VerticalAlignment = 'Top' | 'CenterVertically' | 'Bottom';
export type ArrangementType =
  | 'Start'
  | 'Center'
  | 'End'
  | 'SpaceBetween'
  | 'SpaceAround'
  | 'SpaceEvenly';

export type FontWeightOption = 'Normal' | 'Medium' | 'SemiBold' | 'Bold';

export interface ConstraintAnchors {
  topToTopOf?: string;
  bottomToBottomOf?: string;
  startToStartOf?: string;
  endToEndOf?: string;
  marginTop: number;
  marginStart: number;
}

export interface ElementProps {
  /** Primary display text, title, or label */
  text?: string;
  /** Secondary text, placeholder, or subtitle */
  secondaryText?: string;
  /** Icon identifier from our 55+ vector icon library */
  iconName?: string;
  /** Color mode for the icon ('theme' | 'custom' | 'vibrant') */
  iconColorMode?: 'theme' | 'custom' | 'vibrant';
  /** Custom icon tint hex */
  iconTint?: string;
  /** Background color in hex (#RRGGBB or #AARRGGBB) */
  backgroundColor?: string;
  /** Optional CSS/Compose linear gradient background */
  gradientEndColor?: string;
  useGradientBg?: boolean;
  gradientAngle?: number;
  /** Glassmorphism frosted blur effect */
  glassEffect?: boolean;
  glassBlur?: number;
  glassOpacity?: number;
  /** Content / foreground / text color in hex */
  contentColor?: string;
  /** Border stroke color in hex */
  borderColor?: string;
  /** Border width in dp */
  borderWidth?: number;
  /** Uniform or individual padding in dp */
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  /** Corner radius in dp */
  cornerRadius?: number;
  /** Shadow / tonal elevation in dp */
  elevation?: number;
  /** Typography font size in sp */
  fontSize?: number;
  /** Font weight */
  fontWeight?: FontWeightOption;
  /** Optional font family override */
  fontFamily?: ProjectFontFamily;
  /** Text or content alignment */
  horizontalAlignment?: HorizontalAlignment;
  verticalAlignment?: VerticalAlignment;
  /** Layout arrangement for Column / Row / Lazy lists */
  arrangement?: ArrangementType;
  /** Item spacing (Arrangement.spacedBy) in dp */
  itemSpacing?: number;
  /** Interactive widget boolean state (Switch, Checkbox, RadioButton, Chip) */
  checked?: boolean;
  /** Numeric progress or slider value (0.0 to 1.0) */
  progress?: number;
  /** Comma-separated items for TabRow, BottomNavigationBar, LazyColumn, etc. */
  itemsList?: string[];
  /** Selected tab or nav index */
  selectedIndex?: number;
  /** Fill max width modifier flag */
  fillMaxWidth?: boolean;
  /** Fill max height modifier flag */
  fillMaxHeight?: boolean;
  /** Opacity (0.1 to 1.0) */
  alpha?: number;
  /** ConstraintLayout anchors (used in Pro mode / ConstraintLayout) */
  constraints?: ConstraintAnchors;
}

export interface ComposeElement {
  id: string;
  type: WidgetType;
  name: string;
  parentId: string | null;
  /** X position in dp relative to canvas or parent container */
  x: number;
  /** Y position in dp relative to canvas or parent container */
  y: number;
  /** Width in dp */
  width: number;
  /** Height in dp */
  height: number;
  /** Layer ordering index */
  zIndex: number;
  /** Locked in canvas / layers */
  locked: boolean;
  /** Hidden in canvas / codegen */
  hidden: boolean;
  /** Expanded in layer tree */
  expanded?: boolean;
  /** Widget-specific and styling properties */
  props: ElementProps;
}

export interface WidgetGroupTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isBuiltIn?: boolean;
  createdAt: number;
  /** Relative elements (x/y relative to group top-left 0,0) */
  elements: Omit<ComposeElement, 'id' | 'zIndex' | 'parentId'>[];
}

export interface GuideLine {
  id: string;
  axis: 'horizontal' | 'vertical';
  positionDp: number;
}

export interface GridSettings {
  enabled: boolean;
  sizeDp: number;
  columns: number;
  gutterDp: number;
  marginDp: number;
  snapToGrid: boolean;
  snapToElements: boolean;
  snapToGuides: boolean;
}

export interface Screen {
  id: string;
  name: string;
  backgroundColor: string;
  useGradientBg?: boolean;
  gradientEndColor?: string;
  gradientAngle?: number;
  isDarkPreview: boolean;
  elements: ComposeElement[];
  guides: GuideLine[];
}

export interface DevicePreset {
  id: string;
  name: string;
  category: DeviceCategory;
  widthDp: number;
  heightDp: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  devicePresetId: string;
  widthDp: number;
  heightDp: number;
  editorMode: EditorMode;
  layoutMode: LayoutMode;
  materialVersion: MaterialVersion;
  theme?: ProjectTheme;
  gridSettings: GridSettings;
  screens: Screen[];
  activeScreenId: string;
}

export interface HistoryEntry {
  timestamp: number;
  label: string;
  screens: Screen[];
  activeScreenId: string;
  layoutMode: LayoutMode;
}

export interface SnapLine {
  axis: 'horizontal' | 'vertical';
  positionDp: number;
  label?: string;
  source: 'grid' | 'element' | 'guide' | 'edge';
}

export interface SerializedProject {
  schemaVersion: 1;
  exportedAt: string;
  app: 'ComposeStudio';
  project: Project;
}
