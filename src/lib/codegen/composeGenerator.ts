import type { ComposeElement, Project, Screen } from '../../types/models';

export interface CodegenOptions {
  includePreview: boolean;
  includeThemeWrapper: boolean;
  generateInteractiveState: boolean;
  exportAllScreens?: boolean;
  packageName?: string;
}

const DEFAULT_OPTIONS: CodegenOptions = {
  includePreview: true,
  includeThemeWrapper: true,
  generateInteractiveState: true,
  exportAllScreens: true,
  packageName: 'com.composestudio.generated',
};

const ICON_TO_COMPOSE_MAP: Record<string, string> = {
  Home: 'Icons.Default.Home',
  ArrowLeft: 'Icons.AutoMirrored.Filled.ArrowBack',
  ArrowRight: 'Icons.AutoMirrored.Filled.ArrowForward',
  Menu: 'Icons.Default.Menu',
  Compass: 'Icons.Default.Explore',
  MapPin: 'Icons.Default.LocationOn',
  Navigation: 'Icons.Default.Navigation',
  MoreVertical: 'Icons.Default.MoreVert',
  Plus: 'Icons.Default.Add',
  Search: 'Icons.Default.Search',
  Settings: 'Icons.Default.Settings',
  Edit3: 'Icons.Default.Edit',
  Trash2: 'Icons.Default.Delete',
  Share2: 'Icons.Default.Share',
  Download: 'Icons.Default.Download',
  Upload: 'Icons.Default.Upload',
  Filter: 'Icons.Default.FilterList',
  RefreshCw: 'Icons.Default.Refresh',
  CreditCard: 'Icons.Default.AccountBox',
  Wallet: 'Icons.Default.AccountBalanceWallet',
  ShoppingCart: 'Icons.Default.ShoppingCart',
  ShoppingBag: 'Icons.Default.ShoppingBag',
  DollarSign: 'Icons.Default.AttachMoney',
  TrendingUp: 'Icons.Default.TrendingUp',
  BarChart3: 'Icons.Default.BarChart',
  PieChart: 'Icons.Default.PieChart',
  QrCode: 'Icons.Default.QrCode',
  Tag: 'Icons.Default.LocalOffer',
  Play: 'Icons.Default.PlayArrow',
  Pause: 'Icons.Default.Pause',
  Music: 'Icons.Default.MusicNote',
  Headphones: 'Icons.Default.Headphones',
  Camera: 'Icons.Default.PhotoCamera',
  Video: 'Icons.Default.Videocam',
  Mic: 'Icons.Default.Mic',
  Volume2: 'Icons.Default.VolumeUp',
  User: 'Icons.Default.Person',
  Users: 'Icons.Default.Group',
  Bell: 'Icons.Default.Notifications',
  Mail: 'Icons.Default.Email',
  MessageCircle: 'Icons.Default.ChatBubble',
  Send: 'Icons.AutoMirrored.Filled.Send',
  Phone: 'Icons.Default.Call',
  Globe: 'Icons.Default.Public',
  Smartphone: 'Icons.Default.Smartphone',
  Wifi: 'Icons.Default.Wifi',
  Bluetooth: 'Icons.Default.Bluetooth',
  Cpu: 'Icons.Default.Memory',
  Terminal: 'Icons.Default.Terminal',
  ShieldCheck: 'Icons.Default.VerifiedUser',
  Heart: 'Icons.Default.Favorite',
  Star: 'Icons.Default.Star',
  Sparkles: 'Icons.Default.AutoAwesome',
  Flame: 'Icons.Default.LocalFireDepartment',
  Zap: 'Icons.Default.Bolt',
  CheckCircle2: 'Icons.Default.CheckCircle',
  Award: 'Icons.Default.EmojiEvents',
  Bookmark: 'Icons.Default.Bookmark',
  Calendar: 'Icons.Default.DateRange',
  Clock: 'Icons.Default.Schedule',
  Sun: 'Icons.Default.LightMode',
  Moon: 'Icons.Default.DarkMode',
  Cloud: 'Icons.Default.Cloud',
  Lock: 'Icons.Default.Lock',
  Gift: 'Icons.Default.CardGiftcard',
  Activity: 'Icons.Default.Timeline',
};

/**
 * Converts a project or screen name into a valid PascalCase Kotlin identifier.
 */
export function toPascalCase(input: string): string {
  const cleaned = input
    .replace(/[^a-zA-Z0-9\s_]/g, ' ')
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  if (!cleaned) return 'GeneratedScreen';
  return /^[0-9]/.test(cleaned) ? `Screen${cleaned}` : cleaned;
}

/**
 * Converts a name into a valid camelCase Kotlin variable identifier.
 */
export function toCamelCase(input: string, fallback = 'widgetState'): string {
  const pascal = toPascalCase(input);
  if (!pascal) return fallback;
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a CSS hex color (#RRGGBB or #AARRGGBB) to Kotlin Compose Color(0xFFRRGGBB).
 */
export function hexToComposeColor(hex?: string): string | null {
  if (!hex || hex === 'transparent') return null;
  const clean = hex.replace('#', '').trim().toUpperCase();
  if (clean.length === 6) {
    return `Color(0xFF${clean})`;
  }
  if (clean.length === 8) {
    return `Color(0x${clean})`;
  }
  return null;
}

function escapeKotlinString(str?: string): string {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function resolveComposeIcon(iconName?: string): string {
  if (!iconName) return 'Icons.Default.Star';
  return ICON_TO_COMPOSE_MAP[iconName] ?? 'Icons.Default.Star';
}

/**
 * Builds the Modifier chain for a given ComposeElement, including offset, size,
 * rounded clip, gradient/glass background, border, and padding.
 */
function buildModifierChain(
  el: ComposeElement,
  isFreeLayout: boolean,
  indent: string
): string {
  const parts: string[] = ['Modifier'];

  if (isFreeLayout) {
    if (el.x !== 0 || el.y !== 0) {
      parts.push(`.offset(x = ${Math.round(el.x)}.dp, y = ${Math.round(el.y)}.dp)`);
    }
  }

  if (el.props.fillMaxWidth) {
    parts.push('.fillMaxWidth()');
    if (el.height > 0 && el.type !== 'Text' && el.type !== 'Divider') {
      parts.push(`.height(${Math.round(el.height)}.dp)`);
    }
  } else if (el.props.fillMaxHeight) {
    parts.push('.fillMaxHeight()');
    parts.push(`.width(${Math.round(el.width)}.dp)`);
  } else {
    parts.push(`.size(width = ${Math.round(el.width)}.dp, height = ${Math.round(el.height)}.dp)`);
  }

  if (el.props.glassEffect) {
    const alphaVal = Number(el.props.glassOpacity ?? 0.78).toFixed(2);
    parts.push(`.alpha(${alphaVal}f)`);
  }

  if (
    el.props.cornerRadius &&
    el.props.cornerRadius > 0 &&
    !['Button', 'Card', 'Surface', 'Chip', 'FAB', 'TextField'].includes(el.type)
  ) {
    parts.push(`.clip(RoundedCornerShape(${Math.round(el.props.cornerRadius)}.dp))`);
  }

  // Gradient or Solid background on containers
  if (
    el.props.useGradientBg &&
    el.props.backgroundColor &&
    el.props.gradientEndColor
  ) {
    const startC = hexToComposeColor(el.props.backgroundColor) ?? 'Color(0xFF6366F1)';
    const endC = hexToComposeColor(el.props.gradientEndColor) ?? 'Color(0xFF38BDF8)';
    const shapeArg =
      el.props.cornerRadius && el.props.cornerRadius > 0
        ? `, shape = RoundedCornerShape(${Math.round(el.props.cornerRadius)}.dp)`
        : '';
    parts.push(`.background(brush = Brush.linearGradient(listOf(${startC}, ${endC}))${shapeArg})`);
  } else if (
    el.props.backgroundColor &&
    el.props.backgroundColor !== 'transparent' &&
    ['Box', 'Column', 'Row', 'LazyColumn', 'LazyRow', 'ConstraintLayout', 'CustomPlaceholder'].includes(el.type)
  ) {
    const colorExpr = hexToComposeColor(el.props.backgroundColor);
    if (colorExpr) {
      const shapeArg =
        el.props.cornerRadius && el.props.cornerRadius > 0
          ? `, shape = RoundedCornerShape(${Math.round(el.props.cornerRadius)}.dp)`
          : '';
      parts.push(`.background(${colorExpr}${shapeArg})`);
    }
  }

  if (el.props.borderWidth && el.props.borderWidth > 0 && el.props.borderColor) {
    const borderColorExpr = hexToComposeColor(el.props.borderColor);
    if (borderColorExpr && !['TextField'].includes(el.type)) {
      const shapeExpr =
        el.props.cornerRadius && el.props.cornerRadius > 0
          ? `RoundedCornerShape(${Math.round(el.props.cornerRadius)}.dp)`
          : 'RoundedCornerShape(0.dp)';
      parts.push(`.border(${Math.round(el.props.borderWidth)}.dp, ${borderColorExpr}, ${shapeExpr})`);
    }
  }

  if (el.props.padding && el.props.padding > 0) {
    parts.push(`.padding(${Math.round(el.props.padding)}.dp)`);
  } else if (el.props.paddingHorizontal || el.props.paddingVertical) {
    const h = Math.round(el.props.paddingHorizontal ?? 0);
    const v = Math.round(el.props.paddingVertical ?? 0);
    parts.push(`.padding(horizontal = ${h}.dp, vertical = ${v}.dp)`);
  }

  if (parts.length === 1) return 'Modifier';
  if (parts.length <= 2) return parts.join('');
  return parts.join(`\n${indent}    `);
}

function generateSingleScreenComposable(
  project: Project,
  targetScreen: Screen,
  opts: CodegenOptions
): { fnName: string; code: string } {
  const fnName = `${toPascalCase(project.name)}${toPascalCase(targetScreen.name)}`;
  const visibleElements = targetScreen.elements.filter((el) => !el.hidden);
  const isFree = project.layoutMode === 'free';

  const stateDeclarations: string[] = [];
  const stateVarById = new Map<string, string>();

  if (opts.generateInteractiveState) {
    visibleElements.forEach((el, idx) => {
      const baseVar = `${toCamelCase(el.name || el.type)}${idx + 1}`;
      if (el.type === 'TextField') {
        const varName = `${baseVar}Text`;
        stateVarById.set(el.id, varName);
        stateDeclarations.push(
          `    var ${varName} by remember { mutableStateOf("${escapeKotlinString(el.props.text ?? '')}") }`
        );
      } else if (['Switch', 'Checkbox', 'RadioButton', 'Chip'].includes(el.type)) {
        const varName = `${baseVar}Checked`;
        stateVarById.set(el.id, varName);
        stateDeclarations.push(
          `    var ${varName} by remember { mutableStateOf(${Boolean(el.props.checked)}) }`
        );
      } else if (el.type === 'Slider') {
        const varName = `${baseVar}Value`;
        stateVarById.set(el.id, varName);
        const val = Number(el.props.progress ?? 0.5).toFixed(2);
        stateDeclarations.push(
          `    var ${varName} by remember { mutableFloatStateOf(${val}f) }`
        );
      } else if (['TabRow', 'BottomNavigationBar', 'NavigationRail'].includes(el.type)) {
        const varName = `${baseVar}Index`;
        stateVarById.set(el.id, varName);
        stateDeclarations.push(
          `    var ${varName} by remember { mutableIntStateOf(${el.props.selectedIndex ?? 0}) }`
        );
      }
    });
  }

  const childrenByParent = new Map<string | null, ComposeElement[]>();
  for (const el of visibleElements) {
    const key = el.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(el);
    childrenByParent.set(key, list);
  }

  for (const [key, list] of childrenByParent.entries()) {
    if (isFree && key === null) {
      list.sort((a, b) => a.zIndex - b.zIndex);
    } else {
      list.sort((a, b) => (Math.abs(a.y - b.y) <= 16 ? a.x - b.x : a.y - b.y));
    }
  }

  function emitElement(el: ComposeElement, depth: number, parentIsFree: boolean): string {
    const indent = '    '.repeat(depth);
    const mod = buildModifierChain(el, parentIsFree, indent);
    const children = childrenByParent.get(el.id) ?? [];
    const bgHex = hexToComposeColor(el.props.backgroundColor);
    const fgHex = hexToComposeColor(el.props.contentColor);
    const iconExpr = resolveComposeIcon(el.props.iconName);
    const radius = Math.round(el.props.cornerRadius ?? 12);

    switch (el.type) {
      case 'Column': {
        const spacing = el.props.itemSpacing ?? 12;
        const vArr =
          spacing > 0
            ? `Arrangement.spacedBy(${spacing}.dp)`
            : `Arrangement.${el.props.arrangement ?? 'Top'}`;
        const hAlign = `Alignment.${el.props.horizontalAlignment ?? 'Start'}`;
        const body =
          children.length > 0
            ? children.map((c) => emitElement(c, depth + 1, false)).join('\n')
            : `${indent}    // Empty Column container`;
        return `${indent}Column(\n${indent}    modifier = ${mod},\n${indent}    verticalArrangement = ${vArr},\n${indent}    horizontalAlignment = ${hAlign}\n${indent}) {\n${body}\n${indent}}`;
      }

      case 'Row': {
        const spacing = el.props.itemSpacing ?? 12;
        const hArr =
          el.props.arrangement && el.props.arrangement !== 'Start'
            ? `Arrangement.${el.props.arrangement}`
            : `Arrangement.spacedBy(${spacing}.dp)`;
        const vAlign = `Alignment.${el.props.verticalAlignment ?? 'CenterVertically'}`;
        const body =
          children.length > 0
            ? children.map((c) => emitElement(c, depth + 1, false)).join('\n')
            : `${indent}    // Empty Row container`;
        return `${indent}Row(\n${indent}    modifier = ${mod},\n${indent}    horizontalArrangement = ${hArr},\n${indent}    verticalAlignment = ${vAlign}\n${indent}) {\n${body}\n${indent}}`;
      }

      case 'Box':
      case 'ConstraintLayout':
      case 'Scaffold': {
        const body =
          children.length > 0
            ? children.map((c) => emitElement(c, depth + 1, true)).join('\n')
            : `${indent}    Text(text = "${escapeKotlinString(el.props.text ?? el.name)}", color = ${fgHex ?? 'Color.White'})`;
        return `${indent}Box(\n${indent}    modifier = ${mod}\n${indent}) {\n${body}\n${indent}}`;
      }

      case 'LazyColumn': {
        const items = el.props.itemsList?.length
          ? el.props.itemsList
          : ['Item 1', 'Item 2', 'Item 3'];
        const itemsLiteral = items.map((i) => `"${escapeKotlinString(i)}"`).join(', ');
        return `${indent}LazyColumn(\n${indent}    modifier = ${mod},\n${indent}    verticalArrangement = Arrangement.spacedBy(${el.props.itemSpacing ?? 8}.dp)\n${indent}) {\n${indent}    items(listOf(${itemsLiteral})) { item ->\n${indent}        Surface(\n${indent}            modifier = Modifier.fillMaxWidth(),\n${indent}            shape = RoundedCornerShape(12.dp),\n${indent}            color = Color(0xFF1E293B)\n${indent}        ) {\n${indent}            Text(\n${indent}                text = item,\n${indent}                modifier = Modifier.padding(14.dp),\n${indent}                color = ${fgHex ?? 'Color.White'}\n${indent}            )\n${indent}        }\n${indent}    }\n${indent}}`;
      }

      case 'LazyRow': {
        const items = el.props.itemsList?.length
          ? el.props.itemsList
          : ['Tag 1', 'Tag 2', 'Tag 3'];
        const itemsLiteral = items.map((i) => `"${escapeKotlinString(i)}"`).join(', ');
        return `${indent}LazyRow(\n${indent}    modifier = ${mod},\n${indent}    horizontalArrangement = Arrangement.spacedBy(${el.props.itemSpacing ?? 10}.dp)\n${indent}) {\n${indent}    items(listOf(${itemsLiteral})) { item ->\n${indent}        FilterChip(\n${indent}            selected = true,\n${indent}            onClick = { },\n${indent}            label = { Text(item) }\n${indent}        )\n${indent}    }\n${indent}}`;
      }

      case 'Spacer':
        return `${indent}Spacer(modifier = Modifier.size(width = ${Math.round(el.width)}.dp, height = ${Math.round(el.height)}.dp))`;

      case 'Text': {
        const fontSize = el.props.fontSize ?? 16;
        const weight = `FontWeight.${el.props.fontWeight ?? 'Normal'}`;
        const colorLine = fgHex ? `\n${indent}    color = ${fgHex},` : '';
        return `${indent}Text(\n${indent}    text = "${escapeKotlinString(el.props.text ?? el.name)}",\n${indent}    modifier = ${mod},${colorLine}\n${indent}    fontSize = ${fontSize}.sp,\n${indent}    fontWeight = ${weight}\n${indent})`;
      }

      case 'Button': {
        const containerColor = bgHex ?? 'MaterialTheme.colorScheme.primary';
        const contentColor = fgHex ?? 'Color.White';
        const iconSnippet = el.props.iconName
          ? `${indent}    Icon(imageVector = ${iconExpr}, contentDescription = null, modifier = Modifier.size(18.dp))\n${indent}    Spacer(modifier = Modifier.width(8.dp))\n`
          : '';
        return `${indent}Button(\n${indent}    onClick = { /* Action */ },\n${indent}    modifier = ${mod},\n${indent}    shape = RoundedCornerShape(${radius}.dp),\n${indent}    colors = ButtonDefaults.buttonColors(\n${indent}        containerColor = ${containerColor},\n${indent}        contentColor = ${contentColor}\n${indent}    )\n${indent}) {\n${iconSnippet}${indent}    Text(\n${indent}        text = "${escapeKotlinString(el.props.text ?? 'Button')}",\n${indent}        fontSize = ${el.props.fontSize ?? 15}.sp,\n${indent}        fontWeight = FontWeight.${el.props.fontWeight ?? 'SemiBold'}\n${indent}    )\n${indent}}`;
      }

      case 'IconButton': {
        const tintHex = hexToComposeColor(el.props.iconTint) ?? fgHex ?? 'MaterialTheme.colorScheme.primary';
        return `${indent}IconButton(\n${indent}    onClick = { /* Icon Action */ },\n${indent}    modifier = ${mod}\n${indent}) {\n${indent}    Icon(\n${indent}        imageVector = ${iconExpr},\n${indent}        contentDescription = "${escapeKotlinString(el.name)}",\n${indent}        tint = ${tintHex}\n${indent}    )\n${indent}}`;
      }

      case 'Icon': {
        const tintHex = hexToComposeColor(el.props.iconTint) ?? fgHex ?? 'MaterialTheme.colorScheme.primary';
        return `${indent}Icon(\n${indent}    imageVector = ${iconExpr},\n${indent}    contentDescription = "${escapeKotlinString(el.name)}",\n${indent}    modifier = ${mod},\n${indent}    tint = ${tintHex}\n${indent})`;
      }

      case 'Image': {
        return `${indent}Surface(\n${indent}    modifier = ${mod},\n${indent}    shape = RoundedCornerShape(${radius}.dp),\n${indent}    color = ${bgHex ?? 'Color(0xFF312E81)'}\n${indent}) {\n${indent}    Box(contentAlignment = Alignment.Center) {\n${indent}        Text(\n${indent}            text = "${escapeKotlinString(el.props.text ?? 'Image Asset')}",\n${indent}            color = ${fgHex ?? 'Color.White'},\n${indent}            fontWeight = FontWeight.Medium\n${indent}        )\n${indent}    }\n${indent}}`;
      }

      case 'TextField': {
        const stateVar = stateVarById.get(el.id) ?? `"${escapeKotlinString(el.props.text ?? '')}"`;
        const onChange = stateVarById.has(el.id) ? `{ ${stateVar} = it }` : '{ }';
        return `${indent}OutlinedTextField(\n${indent}    value = ${stateVar},\n${indent}    onValueChange = ${onChange},\n${indent}    modifier = ${mod},\n${indent}    label = { Text("${escapeKotlinString(el.props.secondaryText ?? 'Label')}") },\n${indent}    shape = RoundedCornerShape(${radius}.dp),\n${indent}    singleLine = true\n${indent})`;
      }

      case 'Switch': {
        const stateVar = stateVarById.get(el.id) ?? String(Boolean(el.props.checked));
        const onChange = stateVarById.has(el.id) ? `{ ${stateVar} = it }` : '{ }';
        return `${indent}Row(\n${indent}    modifier = ${mod},\n${indent}    verticalAlignment = Alignment.CenterVertically,\n${indent}    horizontalArrangement = Arrangement.SpaceBetween\n${indent}) {\n${indent}    Text(\n${indent}        text = "${escapeKotlinString(el.props.text ?? 'Toggle Setting')}",\n${indent}        color = ${fgHex ?? 'Color.White'},\n${indent}        fontSize = 15.sp\n${indent}    )\n${indent}    Switch(\n${indent}        checked = ${stateVar},\n${indent}        onCheckedChange = ${onChange}\n${indent}    )\n${indent}}`;
      }

      case 'Checkbox': {
        const stateVar = stateVarById.get(el.id) ?? String(Boolean(el.props.checked));
        const onChange = stateVarById.has(el.id) ? `{ ${stateVar} = it }` : '{ }';
        return `${indent}Row(\n${indent}    modifier = ${mod},\n${indent}    verticalAlignment = Alignment.CenterVertically\n${indent}) {\n${indent}    Checkbox(\n${indent}        checked = ${stateVar},\n${indent}        onCheckedChange = ${onChange}\n${indent}    )\n${indent}    Spacer(modifier = Modifier.width(8.dp))\n${indent}    Text(\n${indent}        text = "${escapeKotlinString(el.props.text ?? 'Checkbox Option')}",\n${indent}        color = ${fgHex ?? 'Color.White'}\n${indent}    )\n${indent}}`;
      }

      case 'RadioButton': {
        const stateVar = stateVarById.get(el.id) ?? String(Boolean(el.props.checked));
        const onClick = stateVarById.has(el.id) ? `{ ${stateVar} = !${stateVar} }` : '{ }';
        return `${indent}Row(\n${indent}    modifier = ${mod},\n${indent}    verticalAlignment = Alignment.CenterVertically\n${indent}) {\n${indent}    RadioButton(\n${indent}        selected = ${stateVar},\n${indent}        onClick = ${onClick}\n${indent}    )\n${indent}    Spacer(modifier = Modifier.width(8.dp))\n${indent}    Text(\n${indent}        text = "${escapeKotlinString(el.props.text ?? 'Radio Option')}",\n${indent}        color = ${fgHex ?? 'Color.White'}\n${indent}    )\n${indent}}`;
      }

      case 'Slider': {
        const stateVar = stateVarById.get(el.id) ?? `${Number(el.props.progress ?? 0.5).toFixed(2)}f`;
        const onChange = stateVarById.has(el.id) ? `{ ${stateVar} = it }` : '{ }';
        return `${indent}Column(modifier = ${mod}) {\n${indent}    Text(\n${indent}        text = "${escapeKotlinString(el.props.text ?? 'Slider')}",\n${indent}        color = ${fgHex ?? 'Color.White'},\n${indent}        fontSize = 13.sp\n${indent}    )\n${indent}    Slider(\n${indent}        value = ${stateVar},\n${indent}        onValueChange = ${onChange}\n${indent}    )\n${indent}}`;
      }

      case 'Card': {
        const childBody =
          children.length > 0
            ? children.map((c) => emitElement(c, depth + 2, false)).join('\n')
            : [
                `${indent}        Text(`,
                `${indent}            text = "${escapeKotlinString(el.props.text ?? 'Card Title')}",`,
                `${indent}            color = ${fgHex ?? 'Color.White'},`,
                `${indent}            fontSize = ${el.props.fontSize ?? 17}.sp,`,
                `${indent}            fontWeight = FontWeight.SemiBold`,
                `${indent}        )`,
                el.props.secondaryText
                  ? `${indent}        Spacer(modifier = Modifier.height(6.dp))\n${indent}        Text(\n${indent}            text = "${escapeKotlinString(el.props.secondaryText)}",\n${indent}            color = Color(0xFF94A3B8),\n${indent}            fontSize = 14.sp\n${indent}        )`
                  : '',
              ]
                .filter(Boolean)
                .join('\n');

        return `${indent}Card(\n${indent}    modifier = ${mod},\n${indent}    shape = RoundedCornerShape(${radius}.dp),\n${indent}    colors = CardDefaults.cardColors(\n${indent}        containerColor = ${bgHex ?? 'Color(0xFF1E293B)'}\n${indent}    ),\n${indent}    elevation = CardDefaults.cardElevation(defaultElevation = ${el.props.elevation ?? 4}.dp)\n${indent}) {\n${indent}    Column(modifier = Modifier.padding(${el.props.padding ?? 16}.dp)) {\n${childBody}\n${indent}    }\n${indent}}`;
      }

      case 'Surface': {
        return `${indent}Surface(\n${indent}    modifier = ${mod},\n${indent}    shape = RoundedCornerShape(${radius}.dp),\n${indent}    color = ${bgHex ?? 'Color(0xFF1E1B4B)'},\n${indent}    tonalElevation = ${el.props.elevation ?? 2}.dp\n${indent}) {\n${indent}    Box(modifier = Modifier.padding(${el.props.padding ?? 16}.dp), contentAlignment = Alignment.CenterStart) {\n${indent}        Text(\n${indent}            text = "${escapeKotlinString(el.props.text ?? 'Surface')}",\n${indent}            color = ${fgHex ?? 'Color.White'}\n${indent}        )\n${indent}    }\n${indent}}`;
      }

      case 'Divider':
        return `${indent}HorizontalDivider(\n${indent}    modifier = ${mod},\n${indent}    thickness = ${el.props.borderWidth ?? 1}.dp,\n${indent}    color = ${bgHex ?? 'Color(0xFF334155)'}\n${indent})`;

      case 'Chip': {
        const stateVar = stateVarById.get(el.id) ?? String(Boolean(el.props.checked));
        const onClick = stateVarById.has(el.id) ? `{ ${stateVar} = !${stateVar} }` : '{ }';
        return `${indent}FilterChip(\n${indent}    selected = ${stateVar},\n${indent}    onClick = ${onClick},\n${indent}    modifier = ${mod},\n${indent}    label = { Text("${escapeKotlinString(el.props.text ?? 'Filter')}") }\n${indent})`;
      }

      case 'Badge':
        return `${indent}Badge(\n${indent}    modifier = ${mod},\n${indent}    containerColor = ${bgHex ?? 'Color(0xFFEF4444)'},\n${indent}    contentColor = ${fgHex ?? 'Color.White'}\n${indent}) {\n${indent}    Text("${escapeKotlinString(el.props.text ?? 'NEW')}")\n${indent}}`;

      case 'TopAppBar':
        return `${indent}TopAppBar(\n${indent}    title = { Text("${escapeKotlinString(el.props.text ?? project.name)}") },\n${indent}    navigationIcon = {\n${indent}        IconButton(onClick = { }) {\n${indent}            Icon(${iconExpr}, contentDescription = "Navigation")\n${indent}        }\n${indent}    },\n${indent}    modifier = ${mod},\n${indent}    colors = TopAppBarDefaults.topAppBarColors(\n${indent}        containerColor = ${bgHex ?? 'Color(0xFF0F172A)'},\n${indent}        titleContentColor = ${fgHex ?? 'Color.White'}\n${indent}    )\n${indent})`;

      case 'BottomNavigationBar': {
        const items = el.props.itemsList?.length
          ? el.props.itemsList
          : ['Home', 'Analytics', 'Profile'];
        const stateVar = stateVarById.get(el.id) ?? String(el.props.selectedIndex ?? 0);
        const itemsCode = items
          .map(
            (label, idx) =>
              `${indent}    NavigationBarItem(\n${indent}        selected = ${stateVar} == ${idx},\n${indent}        onClick = { ${stateVarById.has(el.id) ? `${stateVar} = ${idx}` : ''} },\n${indent}        icon = { Icon(${iconExpr}, contentDescription = "${escapeKotlinString(label)}") },\n${indent}        label = { Text("${escapeKotlinString(label)}") }\n${indent}    )`
          )
          .join('\n');
        return `${indent}NavigationBar(\n${indent}    modifier = ${mod},\n${indent}    containerColor = ${bgHex ?? 'Color(0xFF0F172A)'}\n${indent}) {\n${itemsCode}\n${indent}}`;
      }

      case 'NavigationRail': {
        const items = el.props.itemsList?.length
          ? el.props.itemsList
          : ['Home', 'Search', 'Settings'];
        const stateVar = stateVarById.get(el.id) ?? String(el.props.selectedIndex ?? 0);
        const itemsCode = items
          .map(
            (label, idx) =>
              `${indent}    NavigationRailItem(\n${indent}        selected = ${stateVar} == ${idx},\n${indent}        onClick = { ${stateVarById.has(el.id) ? `${stateVar} = ${idx}` : ''} },\n${indent}        icon = { Icon(${iconExpr}, contentDescription = "${escapeKotlinString(label)}") },\n${indent}        label = { Text("${escapeKotlinString(label)}") }\n${indent}    )`
          )
          .join('\n');
        return `${indent}NavigationRail(\n${indent}    modifier = ${mod},\n${indent}    containerColor = ${bgHex ?? 'Color(0xFF0F172A)'}\n${indent}) {\n${itemsCode}\n${indent}}`;
      }

      case 'FAB':
        return `${indent}ExtendedFloatingActionButton(\n${indent}    onClick = { /* FAB Action */ },\n${indent}    modifier = ${mod},\n${indent}    containerColor = ${bgHex ?? 'Color(0xFF6366F1)'},\n${indent}    contentColor = ${fgHex ?? 'Color.White'},\n${indent}    icon = { Icon(${iconExpr}, contentDescription = null) },\n${indent}    text = { Text("${escapeKotlinString(el.props.text ?? 'Create')}") }\n${indent})`;

      case 'TabRow': {
        const tabs = el.props.itemsList?.length
          ? el.props.itemsList
          : ['Overview', 'Activity', 'Settings'];
        const stateVar = stateVarById.get(el.id) ?? String(el.props.selectedIndex ?? 0);
        const tabsCode = tabs
          .map(
            (label, idx) =>
              `${indent}    Tab(\n${indent}        selected = ${stateVar} == ${idx},\n${indent}        onClick = { ${stateVarById.has(el.id) ? `${stateVar} = ${idx}` : ''} },\n${indent}        text = { Text("${escapeKotlinString(label)}") }\n${indent}    )`
          )
          .join('\n');
        return `${indent}TabRow(\n${indent}    selectedTabIndex = ${stateVar},\n${indent}    modifier = ${mod},\n${indent}    containerColor = ${bgHex ?? 'Color(0xFF0F172A)'}\n${indent}) {\n${tabsCode}\n${indent}}`;
      }

      case 'LinearProgressIndicator': {
        const prog = Number(el.props.progress ?? 0.65).toFixed(2);
        return `${indent}LinearProgressIndicator(\n${indent}    progress = { ${prog}f },\n${indent}    modifier = ${mod},\n${indent}    color = ${bgHex ?? 'Color(0xFF6366F1)'}\n${indent})`;
      }

      case 'CircularProgressIndicator': {
        const prog = Number(el.props.progress ?? 0.75).toFixed(2);
        return `${indent}CircularProgressIndicator(\n${indent}    progress = { ${prog}f },\n${indent}    modifier = ${mod},\n${indent}    color = ${bgHex ?? 'Color(0xFF6366F1)'},\n${indent}    strokeWidth = ${el.props.borderWidth ?? 4}.dp\n${indent})`;
      }

      case 'CustomPlaceholder':
      default: {
        const customFn = toPascalCase(el.props.text || el.name || 'CustomComponent');
        return `${indent}// Custom Composable Slot: ${customFn}\n${indent}Surface(\n${indent}    modifier = ${mod},\n${indent}    shape = RoundedCornerShape(${radius}.dp),\n${indent}    color = ${bgHex ?? 'Color(0xFF1E1B4B)'}\n${indent}) {\n${indent}    Box(contentAlignment = Alignment.Center) {\n${indent}        Text(\n${indent}            text = "${escapeKotlinString(customFn)}",\n${indent}            color = ${fgHex ?? 'Color(0xFFA5B4FC)'},\n${indent}            fontWeight = FontWeight.Medium\n${indent}        )\n${indent}    }\n${indent}}`;
      }
    }
  }

  const rootElements = childrenByParent.get(null) ?? [];
  const screenBgExpr = hexToComposeColor(targetScreen.backgroundColor) ?? 'Color(0xFF0F172A)';
  const useScreenGrad = Boolean(
    (targetScreen.useGradientBg && targetScreen.gradientEndColor) ||
      project.theme?.useGradient
  );
  const gradStartExpr =
    hexToComposeColor(project.theme?.gradientStart ?? targetScreen.backgroundColor) ??
    screenBgExpr;
  const gradEndExpr =
    hexToComposeColor(
      targetScreen.gradientEndColor ?? project.theme?.gradientEnd ?? '#1E1B4B'
    ) ?? 'Color(0xFF1E1B4B)';

  const bgModifierLine = useScreenGrad
    ? `.background(Brush.linearGradient(colors = listOf(${gradStartExpr}, ${gradEndExpr})))`
    : `.background(${screenBgExpr})`;

  const bodyLines =
    rootElements.length > 0
      ? rootElements.map((el) => emitElement(el, 2, isFree)).join('\n\n')
      : '        // Canvas is empty — add widgets in ComposeStudio';

  const rootContainer = isFree
    ? [
        `    Box(`,
        `        modifier = modifier`,
        `            .fillMaxSize()`,
        `            ${bgModifierLine}`,
        `    ) {`,
        bodyLines,
        `    }`,
      ].join('\n')
    : [
        `    Column(`,
        `        modifier = modifier`,
        `            .fillMaxSize()`,
        `            ${bgModifierLine}`,
        `            .padding(16.dp),`,
        `        verticalArrangement = Arrangement.spacedBy(${project.gridSettings.gutterDp || 16}.dp)`,
        `    ) {`,
        bodyLines,
        `    }`,
      ].join('\n');

  const stateBlock =
    stateDeclarations.length > 0 ? `${stateDeclarations.join('\n')}\n\n` : '';

  const code = [
    '@OptIn(ExperimentalMaterial3Api::class)',
    '@Composable',
    `fun ${fnName}(`,
    '    modifier: Modifier = Modifier',
    ') {',
    stateBlock + rootContainer,
    '}',
  ].join('\n');

  return { fnName, code };
}

/**
 * Generates compilable Jetpack Compose Kotlin (.kt) code for the given Project and Screen(s).
 */
export function generateComposeCode(
  project: Project,
  screen?: Screen,
  options: Partial<CodegenOptions> = {}
): string {
  const opts: CodegenOptions = { ...DEFAULT_OPTIONS, ...options };
  const activeScreen =
    screen ??
    project.screens.find((s) => s.id === project.activeScreenId) ??
    project.screens[0];

  const mPackage =
    project.materialVersion === 'm3'
      ? 'androidx.compose.material3'
      : 'androidx.compose.material';

  const screensToEmit =
    opts.exportAllScreens && project.screens.length > 1
      ? project.screens
      : [activeScreen];

  const emittedScreens = screensToEmit.map((s) =>
    generateSingleScreenComposable(project, s, opts)
  );

  const activeFnName =
    emittedScreens.find((_, idx) => screensToEmit[idx].id === activeScreen.id)
      ?.fnName ?? emittedScreens[0].fnName;

  const multiScreenNavigatorBlock =
    emittedScreens.length > 1
      ? [
          '',
          `// Multi-Screen Host Switcher (${emittedScreens.length} screens)`,
          '@Composable',
          `fun ${toPascalCase(project.name)}AppHost() {`,
          `    var currentScreen by remember { mutableStateOf("${escapeKotlinString(activeScreen.name)}") }`,
          '    when (currentScreen) {',
          ...emittedScreens.map(
            (em, idx) =>
              `        "${escapeKotlinString(screensToEmit[idx].name)}" -> ${em.fnName}()`
          ),
          `        else -> ${activeFnName}()`,
          '    }',
          '}',
        ].join('\n')
      : '';

  const previewBlock = opts.includePreview
    ? [
        '',
        `@Preview(`,
        `    name = "${escapeKotlinString(project.name)} - ${escapeKotlinString(activeScreen.name)}",`,
        `    showBackground = true,`,
        `    widthDp = ${project.widthDp},`,
        `    heightDp = ${project.heightDp}`,
        `)`,
        `@Composable`,
        `fun ${activeFnName}Preview() {`,
        opts.includeThemeWrapper
          ? `    MaterialTheme {\n        ${activeFnName}()\n    }`
          : `    ${activeFnName}()`,
        `}`,
      ].join('\n')
    : '';

  return [
    `package ${opts.packageName ?? 'com.composestudio.generated'}`,
    '',
    'import androidx.compose.foundation.background',
    'import androidx.compose.foundation.border',
    'import androidx.compose.foundation.layout.*',
    'import androidx.compose.foundation.lazy.LazyColumn',
    'import androidx.compose.foundation.lazy.LazyRow',
    'import androidx.compose.foundation.lazy.items',
    'import androidx.compose.foundation.shape.RoundedCornerShape',
    'import androidx.compose.material.icons.Icons',
    'import androidx.compose.material.icons.automirrored.filled.*',
    'import androidx.compose.material.icons.filled.*',
    `import ${mPackage}.*`,
    'import androidx.compose.runtime.*',
    'import androidx.compose.ui.Alignment',
    'import androidx.compose.ui.Modifier',
    'import androidx.compose.ui.draw.alpha',
    'import androidx.compose.ui.draw.clip',
    'import androidx.compose.ui.graphics.Brush',
    'import androidx.compose.ui.graphics.Color',
    'import androidx.compose.ui.text.font.FontWeight',
    'import androidx.compose.ui.tooling.preview.Preview',
    'import androidx.compose.ui.unit.dp',
    'import androidx.compose.ui.unit.sp',
    '',
    emittedScreens.map((e) => e.code).join('\n\n'),
    multiScreenNavigatorBlock,
    previewBlock,
    '',
  ].join('\n');
}
