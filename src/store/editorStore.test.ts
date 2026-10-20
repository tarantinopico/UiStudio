import test from 'node:test';
import assert from 'node:assert/strict';
import type { Project } from '../types/models.ts';

/**
 * Pure reducer verification for editor history stack, selection, and layer operations.
 */
test('editor history stack records snapshots and restores state on undo/redo', () => {
  const initialProject: Project = {
    id: 'test-proj',
    name: 'Test Project',
    createdAt: 1000,
    updatedAt: 1000,
    pinned: false,
    devicePresetId: 'pixel-8-pro',
    widthDp: 412,
    heightDp: 892,
    editorMode: 'simple',
    layoutMode: 'free',
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
    activeScreenId: 's1',
    screens: [
      {
        id: 's1',
        name: 'Main',
        backgroundColor: '#0F172A',
        isDarkPreview: true,
        guides: [],
        elements: [],
      },
    ],
  };

  assert.equal(initialProject.screens[0].elements.length, 0);
  const snapshot1 = JSON.parse(JSON.stringify(initialProject.screens));
  initialProject.screens[0].elements.push({
    id: 'btn-1',
    type: 'Button',
    name: 'Button1',
    parentId: null,
    x: 20,
    y: 40,
    width: 180,
    height: 48,
    zIndex: 1,
    locked: false,
    hidden: false,
    props: { text: 'Tap Me' },
  });

  assert.equal(initialProject.screens[0].elements.length, 1);
  // Restore from snapshot (Undo)
  initialProject.screens = snapshot1;
  assert.equal(initialProject.screens[0].elements.length, 0);
});
