import test from 'node:test';
import assert from 'node:assert/strict';
import {
  snapValueToGrid,
  calculatePositionSnap,
  alignElements,
  distributeElements,
  applyAutoLayoutStructure,
} from './gridMath.ts';
import type { ComposeElement, GridSettings } from '../../types/models.ts';

const defaultGrid: GridSettings = {
  enabled: true,
  sizeDp: 8,
  columns: 4,
  gutterDp: 16,
  marginDp: 16,
  snapToGrid: true,
  snapToElements: true,
  snapToGuides: true,
};

function makeElement(overrides: Partial<ComposeElement> & { id: string }): ComposeElement {
  return {
    id: overrides.id,
    type: overrides.type ?? 'Button',
    name: overrides.name ?? overrides.id,
    parentId: overrides.parentId ?? null,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? 100,
    height: overrides.height ?? 48,
    zIndex: overrides.zIndex ?? 1,
    locked: overrides.locked ?? false,
    hidden: overrides.hidden ?? false,
    props: overrides.props ?? {},
  };
}

test('snapValueToGrid rounds to nearest multiple of gridSizeDp', () => {
  assert.equal(snapValueToGrid(15, 8), 16);
  assert.equal(snapValueToGrid(19, 8), 16);
  assert.equal(snapValueToGrid(21, 8), 24);
  assert.equal(snapValueToGrid(13, 1), 13);
});

test('calculatePositionSnap snaps to margin, siblings, and grid', () => {
  const sib = makeElement({ id: 'sib1', x: 64, y: 120, width: 120, height: 48 });
  // Moving near margin 16dp on X and sibling top 120dp on Y
  const res = calculatePositionSnap(
    { id: 'moving', x: 18, y: 123, width: 100, height: 48 },
    [sib],
    [],
    412,
    892,
    defaultGrid
  );

  assert.equal(res.x, 16);
  assert.equal(res.y, 120);
  assert.equal(res.snappedX, true);
  assert.equal(res.snappedY, true);
  assert.ok(res.snapLines.length >= 2);
});

test('alignElements aligns multiple selected elements correctly', () => {
  const elements = [
    makeElement({ id: 'a', x: 24, y: 40, width: 80, height: 40 }),
    makeElement({ id: 'b', x: 120, y: 100, width: 100, height: 40 }),
  ];

  const alignedLeft = alignElements(elements, ['a', 'b'], 'left', 412, 892);
  assert.equal(alignedLeft[0].x, 24);
  assert.equal(alignedLeft[1].x, 24);

  const alignedRight = alignElements(elements, ['a', 'b'], 'right', 412, 892);
  // maxX is 120 + 100 = 220 -> element 'a' (width 80) should be at 140
  assert.equal(alignedRight[0].x, 140);
  assert.equal(alignedRight[1].x, 120);
});

test('distributeElements spaces 3 elements evenly along horizontal axis', () => {
  const elements = [
    makeElement({ id: '1', x: 20, y: 50, width: 40, height: 40 }),
    makeElement({ id: '2', x: 70, y: 50, width: 40, height: 40 }),
    makeElement({ id: '3', x: 220, y: 50, width: 40, height: 40 }),
  ];

  const distributed = distributeElements(elements, ['1', '2', '3'], 'horizontal');
  assert.equal(distributed[0].x, 20);
  assert.equal(distributed[1].x, 120);
  assert.equal(distributed[2].x, 220);
});

test('applyAutoLayoutStructure stacks elements neatly with TopAppBar pinned at 0,0', () => {
  const elements = [
    makeElement({ id: 'top', type: 'TopAppBar', x: 12, y: 8, width: 380, height: 64 }),
    makeElement({ id: 'card', type: 'Card', x: 45, y: 150, width: 320, height: 120 }),
    makeElement({ id: 'btn', type: 'Button', x: 40, y: 340, width: 180, height: 48 }),
  ];

  const structured = applyAutoLayoutStructure(elements, 412);
  const top = structured.find((e) => e.id === 'top')!;
  const card = structured.find((e) => e.id === 'card')!;
  const btn = structured.find((e) => e.id === 'btn')!;

  assert.equal(top.x, 0);
  assert.equal(top.y, 0);
  assert.equal(top.width, 412);
  assert.equal(card.y, 76);
  assert.equal(btn.y, 76 + 120 + 16);
});
