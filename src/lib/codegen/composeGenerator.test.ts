import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateComposeCode,
  toPascalCase,
  hexToComposeColor,
} from './composeGenerator.ts';
import type { Project } from '../../types/models.ts';

function createSampleProject(layoutMode: 'free' | 'grid'): Project {
  return {
    id: 'proj-1',
    name: 'Fintech Wallet',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    pinned: true,
    devicePresetId: 'pixel-8-pro',
    widthDp: 412,
    heightDp: 892,
    editorMode: 'pro',
    layoutMode,
    materialVersion: 'm3',
    gridSettings: {
      enabled: true,
      sizeDp: 8,
      columns: 4,
      gutterDp: 16,
      marginDp: 16,
      snapToGrid: true,
      snapToElements: true,
      snapToGuides: true,
    },
    activeScreenId: 'screen-main',
    screens: [
      {
        id: 'screen-main',
        name: 'Home',
        backgroundColor: '#0F172A',
        useGradientBg: true,
        gradientEndColor: '#1E1B4B',
        isDarkPreview: true,
        guides: [],
        elements: [
          {
            id: 'el-1',
            type: 'TopAppBar',
            name: 'HeaderBar',
            parentId: null,
            x: 0,
            y: 0,
            width: 412,
            height: 64,
            zIndex: 1,
            locked: false,
            hidden: false,
            props: {
              text: 'Fintech Wallet',
              iconName: 'Wallet',
              backgroundColor: '#0F172A',
              contentColor: '#F8FAFC',
            },
          },
          {
            id: 'el-2',
            type: 'TextField',
            name: 'AmountInput',
            parentId: null,
            x: 24,
            y: 96,
            width: 364,
            height: 60,
            zIndex: 2,
            locked: false,
            hidden: false,
            props: {
              text: '$1,250.00',
              secondaryText: 'Transfer Amount',
              cornerRadius: 12,
            },
          },
          {
            id: 'el-3',
            type: 'Button',
            name: 'SendMoneyButton',
            parentId: null,
            x: 24,
            y: 180,
            width: 364,
            height: 52,
            zIndex: 3,
            locked: false,
            hidden: false,
            props: {
              text: 'Send Instant Transfer',
              iconName: 'Send',
              backgroundColor: '#6366F1',
              contentColor: '#FFFFFF',
              cornerRadius: 26,
              glassEffect: true,
              glassOpacity: 0.85,
            },
          },
        ],
      },
      {
        id: 'screen-analytics',
        name: 'Analytics',
        backgroundColor: '#0F172A',
        isDarkPreview: true,
        guides: [],
        elements: [],
      },
    ],
  };
}

test('toPascalCase and hexToComposeColor format Kotlin literals accurately', () => {
  assert.equal(toPascalCase('fintech wallet_home'), 'FintechWalletHome');
  assert.equal(hexToComposeColor('#6366f1'), 'Color(0xFF6366F1)');
  assert.equal(hexToComposeColor('transparent'), null);
});

test('generateComposeCode outputs valid Kotlin withModifier.offset, Brush.linearGradient, vector icons, and Multi-Screen AppHost', () => {
  const proj = createSampleProject('free');
  const code = generateComposeCode(proj);

  assert.ok(code.includes('fun FintechWalletHome('));
  assert.ok(code.includes('fun FintechWalletAnalytics('));
  assert.ok(code.includes('fun FintechWalletAppHost()'));
  assert.ok(code.includes('Brush.linearGradient'));
  assert.ok(code.includes('.alpha(0.85f)'));
  assert.ok(code.includes('Icons.Default.AccountBalanceWallet'));
  assert.ok(code.includes('Icons.AutoMirrored.Filled.Send'));
  assert.ok(code.includes('var amountInput2Text by remember { mutableStateOf("$1,250.00") }'));
  assert.ok(code.includes('.offset(x = 24.dp, y = 96.dp)'));
  assert.ok(code.includes('@Preview('));
});

test('generateComposeCode outputs structured Column without root offsets in grid mode', () => {
  const proj = createSampleProject('grid');
  const code = generateComposeCode(proj);

  assert.ok(code.includes('verticalArrangement = Arrangement.spacedBy(16.dp)'));
  assert.ok(!code.includes('.offset(x = 24.dp, y = 96.dp)'));
});
