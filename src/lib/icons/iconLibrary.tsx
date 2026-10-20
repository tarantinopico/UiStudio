import React from 'react';
import {
  Activity,
  AlarmClock,
  AlignJustify,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  BatteryCharging,
  Bell,
  Bluetooth,
  Bookmark,
  Box,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  CircleDot,
  Clock,
  Cloud,
  Code2,
  Columns,
  Compass,
  Cpu,
  CreditCard,
  DollarSign,
  Download,
  Edit3,
  Eye,
  Filter,
  Flame,
  Folder,
  Gift,
  Globe,
  Grid,
  Headphones,
  Heart,
  Home,
  Image as ImageIcon,
  Info,
  Key,
  Layers,
  Layout,
  List,
  Loader,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  Mic,
  Minus,
  Moon,
  MoreVertical,
  Music,
  Navigation,
  Package,
  PanelLeft,
  PanelTop,
  Pause,
  Phone,
  PieChart,
  Play,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Rows,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Terminal,
  ThumbsUp,
  ToggleRight,
  Trash2,
  TrendingUp,
  Type,
  Upload,
  User,
  Users,
  Video,
  Volume2,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react';
import type { WidgetType } from '../../types/models';

export type IconCategory =
  | 'navigation'
  | 'actions'
  | 'commerce'
  | 'media'
  | 'communication'
  | 'device'
  | 'status';

export interface VectorIconEntry {
  name: string;
  label: string;
  category: IconCategory;
  vibrantHex: string;
  composeName: string;
  svgPathData: string;
  Component: React.FC<{ className?: string; style?: React.CSSProperties }>;
}

/**
 * 56 Curated Vector Icons with Compose ImageVector mappings & vibrant accents.
 */
export const VECTOR_ICON_LIBRARY: VectorIconEntry[] = [
  // Navigation (8)
  { name: 'Home', label: 'Home', category: 'navigation', vibrantHex: '#6366F1', composeName: 'Icons.Default.Home', svgPathData: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', Component: Home },
  { name: 'ArrowLeft', label: 'Back Arrow', category: 'navigation', vibrantHex: '#94A3B8', composeName: 'Icons.AutoMirrored.Filled.ArrowBack', svgPathData: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z', Component: ArrowLeft },
  { name: 'ArrowRight', label: 'Forward', category: 'navigation', vibrantHex: '#94A3B8', composeName: 'Icons.AutoMirrored.Filled.ArrowForward', svgPathData: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z', Component: ArrowRight },
  { name: 'Menu', label: 'Hamburger Menu', category: 'navigation', vibrantHex: '#CBD5E1', composeName: 'Icons.Default.Menu', svgPathData: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z', Component: Menu },
  { name: 'Compass', label: 'Explore', category: 'navigation', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Explore', svgPathData: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', Component: Compass },
  { name: 'MapPin', label: 'Location Pin', category: 'navigation', vibrantHex: '#F43F5E', composeName: 'Icons.Default.LocationOn', svgPathData: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z', Component: MapPin },
  { name: 'Navigation', label: 'GPS Navigate', category: 'navigation', vibrantHex: '#0EA5E9', composeName: 'Icons.Default.Navigation', svgPathData: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z', Component: Navigation },
  { name: 'MoreVertical', label: 'Overflow Menu', category: 'navigation', vibrantHex: '#94A3B8', composeName: 'Icons.Default.MoreVert', svgPathData: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z', Component: MoreVertical },

  // Actions (10)
  { name: 'Plus', label: 'Add / Create', category: 'actions', vibrantHex: '#10B981', composeName: 'Icons.Default.Add', svgPathData: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', Component: Plus },
  { name: 'Search', label: 'Search', category: 'actions', vibrantHex: '#818CF8', composeName: 'Icons.Default.Search', svgPathData: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z', Component: Search },
  { name: 'Settings', label: 'Settings Gear', category: 'actions', vibrantHex: '#94A3B8', composeName: 'Icons.Default.Settings', svgPathData: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58z', Component: Settings },
  { name: 'Edit3', label: 'Edit Pencil', category: 'actions', vibrantHex: '#F59E0B', composeName: 'Icons.Default.Edit', svgPathData: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z', Component: Edit3 },
  { name: 'Trash2', label: 'Delete Trash', category: 'actions', vibrantHex: '#EF4444', composeName: 'Icons.Default.Delete', svgPathData: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z', Component: Trash2 },
  { name: 'Share2', label: 'Share', category: 'actions', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Share', svgPathData: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z', Component: Share2 },
  { name: 'Download', label: 'Download', category: 'actions', vibrantHex: '#10B981', composeName: 'Icons.Default.Download', svgPathData: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z', Component: Download },
  { name: 'Upload', label: 'Upload', category: 'actions', vibrantHex: '#6366F1', composeName: 'Icons.Default.Upload', svgPathData: 'M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z', Component: Upload },
  { name: 'Filter', label: 'Filter Funnel', category: 'actions', vibrantHex: '#A855F7', composeName: 'Icons.Default.FilterList', svgPathData: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z', Component: Filter },
  { name: 'RefreshCw', label: 'Refresh / Sync', category: 'actions', vibrantHex: '#06B6D4', composeName: 'Icons.Default.Refresh', svgPathData: 'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z', Component: RefreshCw },

  // Commerce & Finance (10)
  { name: 'CreditCard', label: 'Credit Card', category: 'commerce', vibrantHex: '#6366F1', composeName: 'Icons.Default.AccountBox', svgPathData: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z', Component: CreditCard },
  { name: 'Wallet', label: 'Wallet', category: 'commerce', vibrantHex: '#10B981', composeName: 'Icons.Default.AccountBalanceWallet', svgPathData: 'M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8z', Component: Wallet },
  { name: 'ShoppingCart', label: 'Shopping Cart', category: 'commerce', vibrantHex: '#F59E0B', composeName: 'Icons.Default.ShoppingCart', svgPathData: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1z', Component: ShoppingCart },
  { name: 'ShoppingBag', label: 'Shopping Bag', category: 'commerce', vibrantHex: '#EC4899', composeName: 'Icons.Default.ShoppingBag', svgPathData: 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z', Component: ShoppingBag },
  { name: 'DollarSign', label: 'Currency / Pay', category: 'commerce', vibrantHex: '#22C55E', composeName: 'Icons.Default.AttachMoney', svgPathData: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', Component: DollarSign },
  { name: 'TrendingUp', label: 'Analytics Growth', category: 'commerce', vibrantHex: '#10B981', composeName: 'Icons.Default.TrendingUp', svgPathData: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z', Component: TrendingUp },
  { name: 'BarChart3', label: 'Bar Chart', category: 'commerce', vibrantHex: '#38BDF8', composeName: 'Icons.Default.BarChart', svgPathData: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z', Component: BarChart3 },
  { name: 'PieChart', label: 'Portfolio Chart', category: 'commerce', vibrantHex: '#A855F7', composeName: 'Icons.Default.PieChart', svgPathData: 'M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99z', Component: PieChart },
  { name: 'QrCode', label: 'QR Code Scan', category: 'commerce', vibrantHex: '#E2E8F0', composeName: 'Icons.Default.QrCode', svgPathData: 'M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4z', Component: QrCode },
  { name: 'Tag', label: 'Price Tag / Offer', category: 'commerce', vibrantHex: '#F97316', composeName: 'Icons.Default.LocalOffer', svgPathData: 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42z', Component: Tag },

  // Media & Audio (8)
  { name: 'Play', label: 'Play Media', category: 'media', vibrantHex: '#10B981', composeName: 'Icons.Default.PlayArrow', svgPathData: 'M8 5v14l11-7z', Component: Play },
  { name: 'Pause', label: 'Pause Media', category: 'media', vibrantHex: '#F59E0B', composeName: 'Icons.Default.Pause', svgPathData: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z', Component: Pause },
  { name: 'Music', label: 'Music Note', category: 'media', vibrantHex: '#EC4899', composeName: 'Icons.Default.MusicNote', svgPathData: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z', Component: Music },
  { name: 'Headphones', label: 'Headphones', category: 'media', vibrantHex: '#818CF8', composeName: 'Icons.Default.Headphones', svgPathData: 'M12 3a9 9 0 00-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 00-9-9z', Component: Headphones },
  { name: 'Camera', label: 'Camera', category: 'media', vibrantHex: '#38BDF8', composeName: 'Icons.Default.PhotoCamera', svgPathData: 'M12 12m-3.2 0a3.2 3.2 0 106.4 0 3.2 3.2 0 10-6.4 0M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z', Component: Camera },
  { name: 'Video', label: 'Video Camera', category: 'media', vibrantHex: '#F43F5E', composeName: 'Icons.Default.Videocam', svgPathData: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z', Component: Video },
  { name: 'Mic', label: 'Microphone', category: 'media', vibrantHex: '#06B6D4', composeName: 'Icons.Default.Mic', svgPathData: 'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z', Component: Mic },
  { name: 'Volume2', label: 'Speaker Volume', category: 'media', vibrantHex: '#A855F7', composeName: 'Icons.Default.VolumeUp', svgPathData: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z', Component: Volume2 },

  // Communication & Social (8)
  { name: 'User', label: 'User Profile', category: 'communication', vibrantHex: '#6366F1', composeName: 'Icons.Default.Person', svgPathData: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', Component: User },
  { name: 'Users', label: 'Team / Community', category: 'communication', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Group', svgPathData: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z', Component: Users },
  { name: 'Bell', label: 'Notifications', category: 'communication', vibrantHex: '#F59E0B', composeName: 'Icons.Default.Notifications', svgPathData: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z', Component: Bell },
  { name: 'Mail', label: 'Email Envelope', category: 'communication', vibrantHex: '#0EA5E9', composeName: 'Icons.Default.Email', svgPathData: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', Component: Mail },
  { name: 'MessageCircle', label: 'Chat Bubble', category: 'communication', vibrantHex: '#10B981', composeName: 'Icons.Default.ChatBubble', svgPathData: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', Component: MessageCircle },
  { name: 'Send', label: 'Send Paper Plane', category: 'communication', vibrantHex: '#6366F1', composeName: 'Icons.AutoMirrored.Filled.Send', svgPathData: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z', Component: Send },
  { name: 'Phone', label: 'Phone Call', category: 'communication', vibrantHex: '#22C55E', composeName: 'Icons.Default.Call', svgPathData: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', Component: Phone },
  { name: 'Globe', label: 'World / Web', category: 'communication', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Public', svgPathData: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', Component: Globe },

  // Device & Tech (6)
  { name: 'Smartphone', label: 'Smartphone', category: 'device', vibrantHex: '#94A3B8', composeName: 'Icons.Default.Smartphone', svgPathData: 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z', Component: Smartphone },
  { name: 'Wifi', label: 'Wi-Fi Signal', category: 'device', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Wifi', svgPathData: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z', Component: Wifi },
  { name: 'Bluetooth', label: 'Bluetooth', category: 'device', vibrantHex: '#6366F1', composeName: 'Icons.Default.Bluetooth', svgPathData: 'M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z', Component: Bluetooth },
  { name: 'Cpu', label: 'Processor / AI Chip', category: 'device', vibrantHex: '#A855F7', composeName: 'Icons.Default.Memory', svgPathData: 'M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2z', Component: Cpu },
  { name: 'Terminal', label: 'Developer Console', category: 'device', vibrantHex: '#10B981', composeName: 'Icons.Default.Terminal', svgPathData: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM7.5 15l-1.41-1.41L8.67 11 6.09 8.41 7.5 7l4 4-4 4zm9.5 0h-6v-2h6v2z', Component: Terminal },
  { name: 'ShieldCheck', label: 'Security Shield', category: 'device', vibrantHex: '#10B981', composeName: 'Icons.Default.VerifiedUser', svgPathData: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z', Component: ShieldCheck },

  // Status & Lifestyle (6)
  { name: 'Heart', label: 'Heart / Favorite', category: 'status', vibrantHex: '#F43F5E', composeName: 'Icons.Default.Favorite', svgPathData: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', Component: Heart },
  { name: 'Star', label: 'Star Rating', category: 'status', vibrantHex: '#FACC15', composeName: 'Icons.Default.Star', svgPathData: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', Component: Star },
  { name: 'Sparkles', label: 'Sparkles / Magic', category: 'status', vibrantHex: '#C084FC', composeName: 'Icons.Default.AutoAwesome', svgPathData: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z', Component: Sparkles },
  { name: 'Flame', label: 'Fire / Streak', category: 'status', vibrantHex: '#F97316', composeName: 'Icons.Default.LocalFireDepartment', svgPathData: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z', Component: Flame },
  { name: 'Zap', label: 'Lightning / Fast', category: 'status', vibrantHex: '#EAB308', composeName: 'Icons.Default.Bolt', svgPathData: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z', Component: Zap },
  { name: 'CheckCircle2', label: 'Verified Check', category: 'status', vibrantHex: '#10B981', composeName: 'Icons.Default.CheckCircle', svgPathData: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', Component: CheckCircle2 },
  { name: 'Award', label: 'Badge / Trophy', category: 'status', vibrantHex: '#F59E0B', composeName: 'Icons.Default.EmojiEvents', svgPathData: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z', Component: Award },
  { name: 'Bookmark', label: 'Saved Bookmark', category: 'status', vibrantHex: '#6366F1', composeName: 'Icons.Default.Bookmark', svgPathData: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z', Component: Bookmark },
  { name: 'Calendar', label: 'Calendar Date', category: 'status', vibrantHex: '#EC4899', composeName: 'Icons.Default.DateRange', svgPathData: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z', Component: Calendar },
  { name: 'Clock', label: 'Clock / Timer', category: 'status', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Schedule', svgPathData: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z', Component: Clock },
  { name: 'Sun', label: 'Sun / Light Mode', category: 'status', vibrantHex: '#FACC15', composeName: 'Icons.Default.LightMode', svgPathData: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1z', Component: Sun },
  { name: 'Moon', label: 'Moon / Dark Mode', category: 'status', vibrantHex: '#818CF8', composeName: 'Icons.Default.DarkMode', svgPathData: 'M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z', Component: Moon },
  { name: 'Cloud', label: 'Cloud Sync', category: 'status', vibrantHex: '#38BDF8', composeName: 'Icons.Default.Cloud', svgPathData: 'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z', Component: Cloud },
  { name: 'Lock', label: 'Locked / Private', category: 'status', vibrantHex: '#F43F5E', composeName: 'Icons.Default.Lock', svgPathData: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z', Component: Lock },
  { name: 'Gift', label: 'Reward / Gift', category: 'status', vibrantHex: '#EC4899', composeName: 'Icons.Default.CardGiftcard', svgPathData: 'M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 00-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z', Component: Gift },
  { name: 'Activity', label: 'Heart Rate / Pulse', category: 'status', vibrantHex: '#10B981', composeName: 'Icons.Default.Timeline', svgPathData: 'M22 12h-4l-3 9L9 3l-3 9H2', Component: Activity },
];

export function getVectorIconEntry(name?: string): VectorIconEntry {
  const found = VECTOR_ICON_LIBRARY.find((i) => i.name === name);
  return found ?? VECTOR_ICON_LIBRARY[0];
}

export function renderVectorIcon(
  name?: string,
  className = 'w-4 h-4',
  style?: React.CSSProperties
): React.ReactNode {
  const entry = getVectorIconEntry(name);
  const Comp = entry.Component;
  return <Comp className={className} style={style} />;
}

/**
 * Renders a recognizable visual icon representing each of the 29 Compose WidgetTypes
 * in the Widget Palette and Layer Tree.
 */
export function renderWidgetTypeIcon(type: WidgetType, className = 'w-4 h-4'): React.ReactNode {
  switch (type) {
    case 'Column':
      return <Rows className={className} />;
    case 'Row':
      return <Columns className={className} />;
    case 'Box':
      return <Box className={className} />;
    case 'LazyColumn':
      return <List className={className} />;
    case 'LazyRow':
      return <AlignJustify className={`${className} rotate-90`} />;
    case 'ConstraintLayout':
      return <Grid className={className} />;
    case 'Spacer':
      return <Maximize2 className={className} />;
    case 'Scaffold':
      return <Layout className={className} />;
    case 'Text':
      return <Type className={className} />;
    case 'Button':
      return <Plus className={className} />;
    case 'IconButton':
      return <Heart className={className} />;
    case 'Icon':
      return <Sparkles className={className} />;
    case 'Image':
      return <ImageIcon className={className} />;
    case 'TextField':
      return <Edit3 className={className} />;
    case 'Switch':
      return <ToggleRight className={className} />;
    case 'Checkbox':
      return <CheckSquare className={className} />;
    case 'RadioButton':
      return <CircleDot className={className} />;
    case 'Slider':
      return <Sliders className={className} />;
    case 'Card':
      return <CreditCard className={className} />;
    case 'Surface':
      return <Layers className={className} />;
    case 'Divider':
      return <Minus className={className} />;
    case 'Chip':
      return <Tag className={className} />;
    case 'Badge':
      return <Bell className={className} />;
    case 'TopAppBar':
      return <PanelTop className={className} />;
    case 'BottomNavigationBar':
      return <Compass className={className} />;
    case 'NavigationRail':
      return <PanelLeft className={className} />;
    case 'FAB':
      return <Zap className={className} />;
    case 'TabRow':
      return <Folder className={className} />;
    case 'LinearProgressIndicator':
      return <Activity className={className} />;
    case 'CircularProgressIndicator':
      return <Loader className={className} />;
    case 'CustomPlaceholder':
    default:
      return <Code2 className={className} />;
  }
}
