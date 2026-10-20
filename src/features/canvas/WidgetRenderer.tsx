import React, { memo } from 'react';
import {
  Check,
  Image as ImageIcon,
  MoreVertical,
} from 'lucide-react';
import type { ComposeElement, MaterialVersion, ProjectTheme } from '../../types/models';
import {
  getVectorIconEntry,
  renderVectorIcon,
  renderWidgetTypeIcon,
} from '../../lib/icons/iconLibrary';

interface WidgetRendererProps {
  element: ComposeElement;
  materialVersion: MaterialVersion;
  projectTheme?: ProjectTheme;
  isSelected?: boolean;
  isMultiSelected?: boolean;
}

export function resolveFontFamilyCss(fontFamily?: string): string {
  switch (fontFamily) {
    case 'JetBrains Mono':
      return "'JetBrains Mono', monospace";
    case 'Editorial Serif':
      return "Georgia, 'Times New Roman', serif";
    case 'Geometric Rounded':
      return "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    case 'System Sans':
      return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case 'Plus Jakarta Sans':
    default:
      return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  }
}

/**
 * Memoized visual renderer for all 29 Jetpack Compose widgets.
 * Supports Material 3 & Material 2, 56+ vector icons with theme/vibrant/custom tint,
 * linear gradients, glassmorphism frosted blur, and typography presets.
 */
export const WidgetRenderer: React.FC<WidgetRendererProps> = memo(
  ({ element, materialVersion, projectTheme }) => {
    const { type, props, name, width, height } = element;
    const isM3 = materialVersion === 'm3';

    const bg = props.backgroundColor || 'transparent';
    const fg = props.contentColor || projectTheme?.textColor || '#F8FAFC';
    const radius =
      typeof props.cornerRadius === 'number'
        ? props.cornerRadius
        : projectTheme?.defaultCornerRadiusDp ?? (isM3 ? 16 : 4);
    const pad = props.padding ?? 0;
    const fontSize = props.fontSize ?? 15;
    const fontWeight =
      props.fontWeight === 'Bold'
        ? 700
        : props.fontWeight === 'SemiBold'
          ? 600
          : props.fontWeight === 'Medium'
            ? 500
            : 400;
    const alpha = props.alpha ?? 1;
    const elevation = props.elevation ?? 0;

    const shadowStyle =
      elevation > 0
        ? `0 ${Math.min(elevation * 2, 24)}px ${Math.min(elevation * 4, 36)}px -2px rgba(2, 6, 23, ${isM3 ? 0.36 : 0.52})`
        : undefined;

    const borderStyle =
      props.borderWidth && props.borderWidth > 0
        ? `${props.borderWidth}px solid ${props.borderColor || 'rgba(148, 163, 184, 0.35)'}`
        : undefined;

    const hasGradient = Boolean(props.useGradientBg && props.gradientEndColor);
    const backgroundImageStyle = hasGradient
      ? `linear-gradient(${props.gradientAngle ?? 135}deg, ${bg === 'transparent' ? projectTheme?.primaryColor || '#6366F1' : bg}, ${props.gradientEndColor})`
      : undefined;

    const isGlass = Boolean(props.glassEffect);
    const glassBlurPx = props.glassBlur ?? projectTheme?.glassBlurPx ?? 14;
    const glassOpacity = props.glassOpacity ?? projectTheme?.glassOpacity ?? 0.72;

    const effectiveFontFamily = resolveFontFamilyCss(
      props.fontFamily || projectTheme?.fontFamily
    );

    const resolveIconColor = (fallbackColor: string): string => {
      if (props.iconColorMode === 'vibrant') {
        return getVectorIconEntry(props.iconName).vibrantHex;
      }
      if (props.iconColorMode === 'custom' && props.iconTint) {
        return props.iconTint;
      }
      if (props.iconColorMode === 'theme') {
        return projectTheme?.accentColor || projectTheme?.primaryColor || fallbackColor;
      }
      return props.iconTint || fallbackColor;
    };

    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: hasGradient ? undefined : bg,
      backgroundImage: backgroundImageStyle,
      color: fg,
      borderRadius: `${radius}px`,
      padding: `${pad}px`,
      opacity: isGlass ? Math.min(alpha, Math.max(0.45, glassOpacity)) : alpha,
      boxShadow: shadowStyle,
      border:
        borderStyle ||
        (isGlass ? '1px solid rgba(255, 255, 255, 0.16)' : undefined),
      backdropFilter: isGlass ? `blur(${glassBlurPx}px)` : undefined,
      WebkitBackdropFilter: isGlass ? `blur(${glassBlurPx}px)` : undefined,
      fontSize: `${fontSize}px`,
      fontWeight,
      fontFamily: effectiveFontFamily,
      boxSizing: 'border-box',
      overflow: 'hidden',
      userSelect: 'none',
    };

    switch (type) {
      case 'Column':
      case 'Row':
      case 'Box':
      case 'ConstraintLayout':
      case 'Scaffold': {
        const isRow = type === 'Row';
        return (
          <div
            style={baseStyle}
            className={`relative flex ${isRow ? 'flex-row items-center' : 'flex-col'} border border-dashed border-indigo-400/35`}
          >
            <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] font-mono text-indigo-300/80 bg-indigo-950/60 rounded self-start mb-1 gap-1">
              <span className="inline-flex items-center gap-1">
                {props.iconName
                  ? renderVectorIcon(props.iconName, 'w-3 h-3', {
                      color: resolveIconColor('#A5B4FC'),
                    })
                  : renderWidgetTypeIcon(type, 'w-3 h-3')}
                <span>{type}</span>
              </span>
              <span className="opacity-60">· {name}</span>
            </div>
            {type === 'ConstraintLayout' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-full h-px bg-indigo-400" />
                <div className="h-full w-px bg-indigo-400 absolute" />
              </div>
            )}
          </div>
        );
      }

      case 'Spacer': {
        return (
          <div
            style={{ ...baseStyle, borderRadius: '4px' }}
            className="flex items-center justify-center border border-dotted border-slate-500/40 bg-slate-800/15 text-[10px] font-mono text-slate-400"
          >
            Spacer ({Math.round(width)}×{Math.round(height)}dp)
          </div>
        );
      }

      case 'LazyColumn':
      case 'LazyRow': {
        const items = props.itemsList?.length
          ? props.itemsList
          : ['Item #1', 'Item #2', 'Item #3'];
        const isRow = type === 'LazyRow';
        const spacing = props.itemSpacing ?? 8;

        return (
          <div
            style={baseStyle}
            className={`flex ${isRow ? 'flex-row items-center' : 'flex-col'} overflow-hidden`}
          >
            <div className="text-[10px] font-mono text-indigo-300/90 mb-1.5 px-1 flex items-center justify-between shrink-0">
              <span className="inline-flex items-center gap-1">
                {renderWidgetTypeIcon(type, 'w-3 h-3')}
                <span>{type}</span>
              </span>
              <span className="text-slate-400">{items.length} items</span>
            </div>
            <div
              className={`flex ${isRow ? 'flex-row h-full' : 'flex-col w-full'} flex-1 overflow-hidden`}
              style={{ gap: `${spacing}px` }}
            >
              {items.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className={`${
                    isRow ? 'w-28 h-full flex-col justify-between' : 'w-full py-2.5 px-3 flex-row items-center justify-between'
                  } flex rounded-xl bg-slate-800/75 border border-slate-700/60 text-xs shrink-0`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        color: resolveIconColor('#818CF8'),
                      }}
                    >
                      {props.iconName
                        ? renderVectorIcon(props.iconName, 'w-3.5 h-3.5')
                        : idx + 1}
                    </div>
                    <span className="truncate font-medium text-slate-100">{item}</span>
                  </div>
                  {!isRow && (
                    <span className="text-[10px] font-mono text-slate-400">
                      0{idx + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'Text': {
        const justify =
          props.horizontalAlignment === 'CenterHorizontally'
            ? 'justify-center text-center'
            : props.horizontalAlignment === 'End'
              ? 'justify-end text-right'
              : 'justify-start text-left';
        return (
          <div
            style={baseStyle}
            className={`flex items-center gap-1.5 ${justify} leading-snug tracking-tight`}
          >
            {props.iconName && (
              <span
                className="shrink-0 inline-flex"
                style={{ color: resolveIconColor(fg) }}
              >
                {renderVectorIcon(props.iconName, 'w-4 h-4')}
              </span>
            )}
            <span className="truncate">{props.text || 'Text'}</span>
          </div>
        );
      }

      case 'Button': {
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: isM3
                ? `${props.cornerRadius ?? 999}px`
                : `${props.cornerRadius ?? 6}px`,
            }}
            className="flex items-center justify-center gap-2 px-4 font-semibold tracking-tight shadow-sm"
          >
            {props.iconName && (
              <span
                className="shrink-0 inline-flex"
                style={{ color: resolveIconColor(fg) }}
              >
                {renderVectorIcon(props.iconName, 'w-4 h-4')}
              </span>
            )}
            <span className="truncate">{props.text || 'Button'}</span>
          </div>
        );
      }

      case 'IconButton': {
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: `${props.cornerRadius ?? 999}px`,
              color: resolveIconColor(fg),
            }}
            className="flex items-center justify-center"
          >
            {renderVectorIcon(props.iconName || 'Heart', 'w-5 h-5')}
          </div>
        );
      }

      case 'Icon': {
        return (
          <div
            style={{
              ...baseStyle,
              color: resolveIconColor(fg),
            }}
            className="flex items-center justify-center"
          >
            {renderVectorIcon(props.iconName || 'Sparkles', 'w-6 h-6')}
          </div>
        );
      }

      case 'Image': {
        return (
          <div
            style={baseStyle}
            className="relative flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-800 border border-slate-700/60"
          >
            <div
              className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-1.5"
              style={{ color: resolveIconColor('#A5B4FC') }}
            >
              {props.iconName ? (
                renderVectorIcon(props.iconName, 'w-5 h-5')
              ) : (
                <ImageIcon className="w-5 h-5 text-indigo-300" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-200 truncate max-w-[90%]">
              {props.text || 'AsyncImage'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {Math.round(width)}×{Math.round(height)}dp
            </span>
          </div>
        );
      }

      case 'TextField': {
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: isM3 ? `${props.cornerRadius ?? 12}px` : '4px 4px 0 0',
              border: `1.5px solid ${props.borderColor || '#475569'}`,
            }}
            className="flex flex-col justify-center px-3.5 py-1.5 relative"
          >
            <span className="text-[10px] font-medium text-indigo-400 leading-none mb-1">
              {props.text || 'Label'}
            </span>
            <div className="flex items-center justify-between text-xs opacity-90">
              <span className="truncate">{props.secondaryText || 'Enter value...'}</span>
              <span style={{ color: resolveIconColor('#94A3B8') }}>
                {renderVectorIcon(props.iconName || 'Search', 'w-3.5 h-3.5 opacity-80')}
              </span>
            </div>
          </div>
        );
      }

      case 'Switch': {
        const checked = props.checked ?? true;
        const activeTrack = projectTheme?.primaryColor || '#6366F1';
        return (
          <div
            style={baseStyle}
            className="flex items-center justify-between gap-2 px-1"
          >
            {props.text && (
              <span className="text-xs font-medium truncate flex items-center gap-1.5">
                {props.iconName &&
                  renderVectorIcon(props.iconName, 'w-3.5 h-3.5', {
                    color: resolveIconColor(fg),
                  })}
                {props.text}
              </span>
            )}
            <div
              className="w-11 h-6 rounded-full p-0.5 flex items-center transition-colors shrink-0"
              style={{
                backgroundColor: checked ? activeTrack : '#334155',
                justifyContent: checked ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                {checked && <Check className="w-3 h-3 text-indigo-700" />}
              </div>
            </div>
          </div>
        );
      }

      case 'Checkbox': {
        const checked = props.checked ?? true;
        const activeBg = projectTheme?.primaryColor || '#6366F1';
        return (
          <div style={baseStyle} className="flex items-center gap-2.5 px-1">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: checked ? activeBg : 'transparent',
                borderColor: checked ? activeBg : '#64748B',
              }}
            >
              {checked && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-xs font-medium truncate">
              {props.text || 'Checkbox option'}
            </span>
          </div>
        );
      }

      case 'RadioButton': {
        const checked = props.checked ?? true;
        const activeColor = projectTheme?.primaryColor || '#6366F1';
        return (
          <div style={baseStyle} className="flex items-center gap-2.5 px-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2"
              style={{ borderColor: checked ? activeColor : '#64748B' }}
            >
              {checked && (
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
              )}
            </div>
            <span className="text-xs font-medium truncate">
              {props.text || 'Radio option'}
            </span>
          </div>
        );
      }

      case 'Slider': {
        const pct = Math.round(Math.min(1, Math.max(0, props.progress ?? 0.65)) * 100);
        return (
          <div style={baseStyle} className="flex items-center px-2">
            <div className="w-full h-1.5 bg-slate-700 rounded-full relative flex items-center">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: fg }}
              />
              <div
                className="w-4 h-4 rounded-full shadow-md border-2 border-white absolute -translate-x-1/2"
                style={{ left: `${pct}%`, backgroundColor: fg }}
              />
            </div>
          </div>
        );
      }

      case 'Card':
      case 'Surface': {
        return (
          <div style={baseStyle} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold leading-snug truncate">
                  {props.text || (type === 'Card' ? 'Elevated Card' : 'Surface')}
                </div>
                {props.iconName && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.16)',
                      color: resolveIconColor(fg),
                    }}
                  >
                    {renderVectorIcon(props.iconName, 'w-4 h-4')}
                  </div>
                )}
              </div>
              {props.secondaryText && (
                <div className="text-xs opacity-75 mt-1 line-clamp-2">
                  {props.secondaryText}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono opacity-50 pt-1">
              <span>{isM3 ? 'Material 3' : 'Material 2'}</span>
              <span>{radius}dp</span>
            </div>
          </div>
        );
      }

      case 'Divider': {
        return (
          <div style={baseStyle} className="flex items-center">
            <div
              className="w-full"
              style={{
                height: `${Math.max(1, height)}px`,
                backgroundColor: bg === 'transparent' ? '#334155' : bg,
              }}
            />
          </div>
        );
      }

      case 'Chip': {
        return (
          <div
            style={baseStyle}
            className="flex items-center justify-center gap-1.5 px-3 font-medium text-xs"
          >
            {props.iconName ? (
              <span style={{ color: resolveIconColor(fg) }}>
                {renderVectorIcon(props.iconName, 'w-3.5 h-3.5 shrink-0')}
              </span>
            ) : (
              props.checked && <Check className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{props.text || 'Filter Chip'}</span>
          </div>
        );
      }

      case 'Badge': {
        return (
          <div
            style={{ ...baseStyle, borderRadius: '999px' }}
            className="flex items-center justify-center px-2 font-bold text-[11px] gap-1"
          >
            {props.iconName && renderVectorIcon(props.iconName, 'w-3 h-3')}
            <span>{props.text || '3'}</span>
          </div>
        );
      }

      case 'TopAppBar': {
        return (
          <div
            style={baseStyle}
            className="flex items-center justify-between px-4 border-b border-white/5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span style={{ color: resolveIconColor(fg) }}>
                {renderVectorIcon(props.iconName || 'ArrowLeft', 'w-5 h-5 opacity-90 shrink-0')}
              </span>
              <span className="font-semibold truncate text-base">
                {props.text || 'TopAppBar'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 opacity-80 shrink-0">
              {renderVectorIcon('Search', 'w-4 h-4')}
              <MoreVertical className="w-4 h-4" />
            </div>
          </div>
        );
      }

      case 'BottomNavigationBar': {
        const items = props.itemsList?.length
          ? props.itemsList
          : ['Home', 'Explore', 'Saved', 'Profile'];
        const selectedIdx = props.selectedIndex ?? 0;
        const defaultIcons = ['Home', 'Compass', 'Heart', 'User'];
        return (
          <div
            style={baseStyle}
            className="grid grid-cols-4 items-center px-2 border-t border-white/5"
          >
            {items.slice(0, 4).map((item, idx) => {
              const active = idx === selectedIdx;
              const iconKey =
                idx === 0 && props.iconName ? props.iconName : defaultIcons[idx % defaultIcons.length];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center gap-1 py-1"
                >
                  <div
                    className={`px-3.5 py-1 rounded-full flex items-center justify-center transition-colors ${
                      active ? 'bg-indigo-500/25 text-indigo-300' : 'opacity-65'
                    }`}
                    style={
                      active
                        ? { color: resolveIconColor(projectTheme?.primaryColor || '#A5B4FC') }
                        : undefined
                    }
                  >
                    {renderVectorIcon(iconKey, 'w-4 h-4')}
                  </div>
                  <span
                    className={`text-[10px] truncate max-w-[64px] ${
                      active ? 'font-semibold' : 'opacity-70'
                    }`}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      case 'NavigationRail': {
        const items = props.itemsList?.length
          ? props.itemsList
          : ['Home', 'Search', 'Saved', 'Settings'];
        const selectedIdx = props.selectedIndex ?? 0;
        const defaultIcons = ['Home', 'Search', 'Heart', 'Settings'];
        return (
          <div
            style={baseStyle}
            className="flex flex-col items-center py-4 gap-5 border-r border-white/5"
          >
            {items.slice(0, 4).map((item, idx) => {
              const active = idx === selectedIdx;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-11 h-8 rounded-full flex items-center justify-center ${
                      active ? 'bg-indigo-500/25 text-indigo-300' : 'opacity-65'
                    }`}
                  >
                    {renderVectorIcon(defaultIcons[idx % defaultIcons.length], 'w-4 h-4')}
                  </div>
                  <span className="text-[9px] opacity-80 truncate max-w-[54px]">
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      case 'FAB': {
        return (
          <div
            style={baseStyle}
            className="flex items-center justify-center gap-2 shadow-lg font-semibold"
          >
            <span style={{ color: resolveIconColor(fg) }}>
              {renderVectorIcon(props.iconName || 'Plus', 'w-5 h-5')}
            </span>
            {width > 80 && props.text && (
              <span className="text-xs truncate pr-1">{props.text}</span>
            )}
          </div>
        );
      }

      case 'TabRow': {
        const tabs = props.itemsList?.length
          ? props.itemsList
          : ['Overview', 'Activity', 'Settings'];
        const selectedIdx = props.selectedIndex ?? 0;
        const indicatorColor = projectTheme?.primaryColor || '#6366F1';
        return (
          <div
            style={baseStyle}
            className="grid grid-cols-3 items-stretch border-b border-slate-700/60"
          >
            {tabs.slice(0, 3).map((tab, idx) => {
              const active = idx === selectedIdx;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center relative text-xs font-medium"
                >
                  <span className={active ? 'opacity-100 font-semibold' : 'opacity-65'}>
                    {tab}
                  </span>
                  {active && (
                    <div
                      className="absolute bottom-0 inset-x-3 h-0.5 rounded-t-full"
                      style={{ backgroundColor: indicatorColor }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'LinearProgressIndicator': {
        const pct = Math.round(Math.min(1, Math.max(0, props.progress ?? 0.65)) * 100);
        return (
          <div style={{ ...baseStyle, padding: 0 }} className="flex items-center">
            <div
              className="w-full h-full rounded-full overflow-hidden"
              style={{ backgroundColor: bg === 'transparent' ? '#1E293B' : bg }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: fg }}
              />
            </div>
          </div>
        );
      }

      case 'CircularProgressIndicator': {
        const pct = Math.min(1, Math.max(0.05, props.progress ?? 0.72));
        const size = Math.min(width, height);
        const stroke = Math.max(3, Math.round(size * 0.1));
        const r = (size - stroke * 2) / 2;
        const c = 2 * Math.PI * r;
        return (
          <div style={baseStyle} className="flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(148,163,184,0.2)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={fg}
                strokeWidth={stroke}
                strokeDasharray={c}
                strokeDashoffset={c * (1 - pct)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      }

      case 'CustomPlaceholder':
      default: {
        return (
          <div
            style={baseStyle}
            className="flex flex-col items-center justify-center text-center border-2 border-dashed border-indigo-400/50"
          >
            <span style={{ color: resolveIconColor(fg) }} className="mb-1 opacity-85">
              {renderVectorIcon(props.iconName || 'Sparkles', 'w-5 h-5')}
            </span>
            <span className="text-xs font-semibold truncate max-w-[90%]">
              {props.text || 'CustomComposable()'}
            </span>
            {props.secondaryText && (
              <span className="text-[10px] opacity-70 truncate max-w-[90%]">
                {props.secondaryText}
              </span>
            )}
          </div>
        );
      }
    }
  }
);

WidgetRenderer.displayName = 'WidgetRenderer';
