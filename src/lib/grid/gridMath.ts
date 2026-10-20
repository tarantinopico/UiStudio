import type { ComposeElement, GridSettings, GuideLine, SnapLine } from '../../types/models';

export type AlignmentOperation =
  | 'left'
  | 'centerH'
  | 'right'
  | 'top'
  | 'centerV'
  | 'bottom';

export type DistributionOperation = 'horizontal' | 'vertical';

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  snapLines: SnapLine[];
}

/**
 * Snaps a single numeric value in dp to the nearest grid multiple.
 */
export function snapValueToGrid(valueDp: number, gridSizeDp: number): number {
  if (gridSizeDp <= 1) return Math.round(valueDp);
  return Math.round(valueDp / gridSizeDp) * gridSizeDp;
}

/**
 * Computes snapped (x, y) coordinates and active visual helper lines
 * given a moving element's rect, sibling elements, user guides, canvas dimensions, and grid settings.
 */
export function calculatePositionSnap(
  movingRect: { id: string; x: number; y: number; width: number; height: number },
  siblings: ComposeElement[],
  guides: GuideLine[],
  canvasWidthDp: number,
  canvasHeightDp: number,
  gridSettings: GridSettings,
  thresholdDp = 6
): SnapResult {
  let finalX = Math.round(movingRect.x);
  let finalY = Math.round(movingRect.y);
  let snappedX = false;
  let snappedY = false;
  const snapLines: SnapLine[] = [];

  const movingCenterX = movingRect.x + movingRect.width / 2;
  const movingRight = movingRect.x + movingRect.width;
  const movingCenterY = movingRect.y + movingRect.height / 2;
  const movingBottom = movingRect.y + movingRect.height;

  // 1. Check screen edges & center
  if (gridSettings.snapToGuides) {
    const screenVerticalTargets = [
      { pos: 0, label: '0dp' },
      { pos: gridSettings.marginDp, label: `${gridSettings.marginDp}dp` },
      { pos: Math.round(canvasWidthDp / 2), label: 'Center X' },
      { pos: canvasWidthDp - gridSettings.marginDp, label: `${canvasWidthDp - gridSettings.marginDp}dp` },
      { pos: canvasWidthDp, label: `${canvasWidthDp}dp` },
    ];

    for (const target of screenVerticalTargets) {
      if (Math.abs(movingRect.x - target.pos) <= thresholdDp) {
        finalX = target.pos;
        snappedX = true;
        snapLines.push({ axis: 'vertical', positionDp: target.pos, label: target.label, source: 'edge' });
        break;
      }
      if (Math.abs(movingCenterX - target.pos) <= thresholdDp) {
        finalX = Math.round(target.pos - movingRect.width / 2);
        snappedX = true;
        snapLines.push({ axis: 'vertical', positionDp: target.pos, label: target.label, source: 'edge' });
        break;
      }
      if (Math.abs(movingRight - target.pos) <= thresholdDp) {
        finalX = target.pos - movingRect.width;
        snappedX = true;
        snapLines.push({ axis: 'vertical', positionDp: target.pos, label: target.label, source: 'edge' });
        break;
      }
    }

    const screenHorizontalTargets = [
      { pos: 0, label: '0dp' },
      { pos: Math.round(canvasHeightDp / 2), label: 'Center Y' },
      { pos: canvasHeightDp, label: `${canvasHeightDp}dp` },
    ];

    for (const target of screenHorizontalTargets) {
      if (Math.abs(movingRect.y - target.pos) <= thresholdDp) {
        finalY = target.pos;
        snappedY = true;
        snapLines.push({ axis: 'horizontal', positionDp: target.pos, label: target.label, source: 'edge' });
        break;
      }
      if (Math.abs(movingCenterY - target.pos) <= thresholdDp) {
        finalY = Math.round(target.pos - movingRect.height / 2);
        snappedY = true;
        snapLines.push({ axis: 'horizontal', positionDp: target.pos, label: target.label, source: 'edge' });
        break;
      }
      if (Math.abs(movingBottom - target.pos) <= thresholdDp) {
        finalY = target.pos - movingRect.height;
        snappedY = true;
        snapLines.push({ axis: 'horizontal', positionDp: target.pos, label: target.label, source: 'edge' });
        break;
      }
    }

    // User-placed ruler guides
    for (const guide of guides) {
      if (guide.axis === 'vertical' && !snappedX) {
        if (Math.abs(movingRect.x - guide.positionDp) <= thresholdDp) {
          finalX = guide.positionDp;
          snappedX = true;
          snapLines.push({ axis: 'vertical', positionDp: guide.positionDp, label: `${guide.positionDp}dp`, source: 'guide' });
        } else if (Math.abs(movingRight - guide.positionDp) <= thresholdDp) {
          finalX = guide.positionDp - movingRect.width;
          snappedX = true;
          snapLines.push({ axis: 'vertical', positionDp: guide.positionDp, label: `${guide.positionDp}dp`, source: 'guide' });
        }
      } else if (guide.axis === 'horizontal' && !snappedY) {
        if (Math.abs(movingRect.y - guide.positionDp) <= thresholdDp) {
          finalY = guide.positionDp;
          snappedY = true;
          snapLines.push({ axis: 'horizontal', positionDp: guide.positionDp, label: `${guide.positionDp}dp`, source: 'guide' });
        } else if (Math.abs(movingBottom - guide.positionDp) <= thresholdDp) {
          finalY = guide.positionDp - movingRect.height;
          snappedY = true;
          snapLines.push({ axis: 'horizontal', positionDp: guide.positionDp, label: `${guide.positionDp}dp`, source: 'guide' });
        }
      }
    }
  }

  // 2. Check sibling elements alignment (left, center, right, top, middle, bottom)
  if (gridSettings.snapToElements) {
    for (const sib of siblings) {
      if (sib.id === movingRect.id || sib.hidden) continue;
      const sibCenterX = sib.x + sib.width / 2;
      const sibRight = sib.x + sib.width;
      const sibCenterY = sib.y + sib.height / 2;
      const sibBottom = sib.y + sib.height;

      if (!snappedX) {
        const xCandidates = [
          { offset: 0, target: sib.x },
          { offset: 0, target: sibRight },
          { offset: movingRect.width / 2, target: sibCenterX },
          { offset: movingRect.width, target: sib.x },
          { offset: movingRect.width, target: sibRight },
        ];
        for (const cand of xCandidates) {
          const currentEdge = movingRect.x + cand.offset;
          if (Math.abs(currentEdge - cand.target) <= thresholdDp) {
            finalX = Math.round(cand.target - cand.offset);
            snappedX = true;
            snapLines.push({
              axis: 'vertical',
              positionDp: Math.round(cand.target),
              source: 'element',
            });
            break;
          }
        }
      }

      if (!snappedY) {
        const yCandidates = [
          { offset: 0, target: sib.y },
          { offset: 0, target: sibBottom },
          { offset: movingRect.height / 2, target: sibCenterY },
          { offset: movingRect.height, target: sib.y },
          { offset: movingRect.height, target: sibBottom },
        ];
        for (const cand of yCandidates) {
          const currentEdge = movingRect.y + cand.offset;
          if (Math.abs(currentEdge - cand.target) <= thresholdDp) {
            finalY = Math.round(cand.target - cand.offset);
            snappedY = true;
            snapLines.push({
              axis: 'horizontal',
              positionDp: Math.round(cand.target),
              source: 'element',
            });
            break;
          }
        }
      }
    }
  }

  // 3. Fallback to Grid snap if enabled
  if (gridSettings.snapToGrid && gridSettings.sizeDp > 1) {
    if (!snappedX) {
      const gridX = snapValueToGrid(movingRect.x, gridSettings.sizeDp);
      if (Math.abs(gridX - movingRect.x) <= gridSettings.sizeDp) {
        finalX = gridX;
        snappedX = gridX !== Math.round(movingRect.x);
      }
    }
    if (!snappedY) {
      const gridY = snapValueToGrid(movingRect.y, gridSettings.sizeDp);
      if (Math.abs(gridY - movingRect.y) <= gridSettings.sizeDp) {
        finalY = gridY;
        snappedY = gridY !== Math.round(movingRect.y);
      }
    }
  }

  // Clamp inside reasonable canvas bounds (-100dp to canvas + 100dp)
  finalX = Math.max(-64, Math.min(canvasWidthDp - 16, finalX));
  finalY = Math.max(-64, Math.min(canvasHeightDp - 16, finalY));

  return {
    x: finalX,
    y: finalY,
    snappedX,
    snappedY,
    snapLines,
  };
}

/**
 * Aligns a group of selected elements along the specified edge or center axis.
 * If only 1 element is selected, aligns it relative to the canvas bounds.
 */
export function alignElements(
  elements: ComposeElement[],
  selectedIds: string[],
  operation: AlignmentOperation,
  canvasWidthDp: number,
  canvasHeightDp: number
): ComposeElement[] {
  const selected = elements.filter((el) => selectedIds.includes(el.id) && !el.locked);
  if (selected.length === 0) return elements;

  if (selected.length === 1) {
    const single = selected[0];
    return elements.map((el) => {
      if (el.id !== single.id) return el;
      switch (operation) {
        case 'left':
          return { ...el, x: 16 };
        case 'centerH':
          return { ...el, x: Math.round((canvasWidthDp - el.width) / 2) };
        case 'right':
          return { ...el, x: canvasWidthDp - el.width - 16 };
        case 'top':
          return { ...el, y: 16 };
        case 'centerV':
          return { ...el, y: Math.round((canvasHeightDp - el.height) / 2) };
        case 'bottom':
          return { ...el, y: canvasHeightDp - el.height - 16 };
      }
    });
  }

  const minX = Math.min(...selected.map((el) => el.x));
  const maxX = Math.max(...selected.map((el) => el.x + el.width));
  const minY = Math.min(...selected.map((el) => el.y));
  const maxY = Math.max(...selected.map((el) => el.y + el.height));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const selectedSet = new Set(selected.map((el) => el.id));

  return elements.map((el) => {
    if (!selectedSet.has(el.id)) return el;
    switch (operation) {
      case 'left':
        return { ...el, x: minX };
      case 'centerH':
        return { ...el, x: Math.round(centerX - el.width / 2) };
      case 'right':
        return { ...el, x: maxX - el.width };
      case 'top':
        return { ...el, y: minY };
      case 'centerV':
        return { ...el, y: Math.round(centerY - el.height / 2) };
      case 'bottom':
        return { ...el, y: maxY - el.height };
    }
  });
}

/**
 * Evenly distributes 3 or more selected elements horizontally or vertically.
 */
export function distributeElements(
  elements: ComposeElement[],
  selectedIds: string[],
  operation: DistributionOperation
): ComposeElement[] {
  const selected = elements.filter((el) => selectedIds.includes(el.id) && !el.locked);
  if (selected.length < 3) return elements;

  if (operation === 'horizontal') {
    const sorted = [...selected].sort((a, b) => a.x - b.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpan = last.x + last.width - first.x;
    const totalWidths = sorted.reduce((acc, item) => acc + item.width, 0);
    const gap = (totalSpan - totalWidths) / (sorted.length - 1);

    let currentX = first.x;
    const posMap = new Map<string, number>();
    for (const item of sorted) {
      posMap.set(item.id, Math.round(currentX));
      currentX += item.width + gap;
    }

    return elements.map((el) =>
      posMap.has(el.id) ? { ...el, x: posMap.get(el.id)! } : el
    );
  } else {
    const sorted = [...selected].sort((a, b) => a.y - b.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpan = last.y + last.height - first.y;
    const totalHeights = sorted.reduce((acc, item) => acc + item.height, 0);
    const gap = (totalSpan - totalHeights) / (sorted.length - 1);

    let currentY = first.y;
    const posMap = new Map<string, number>();
    for (const item of sorted) {
      posMap.set(item.id, Math.round(currentY));
      currentY += item.height + gap;
    }

    return elements.map((el) =>
      posMap.has(el.id) ? { ...el, y: posMap.get(el.id)! } : el
    );
  }
}

/**
 * One-tap Auto-Layout: analyzes free-positioned elements and neatly organizes
 * them into a clean vertical flow (and groups side-by-side elements into Rows)
 * with consistent 8dp/16dp Material spacing.
 */
export function applyAutoLayoutStructure(
  elements: ComposeElement[],
  canvasWidthDp: number
): ComposeElement[] {
  if (elements.length === 0) return elements;

  // Separate top/bottom system-like bars from scrollable body elements
  const topBar = elements.find((el) => el.type === 'TopAppBar' && !el.parentId);
  const bottomBar = elements.find((el) => el.type === 'BottomNavigationBar' && !el.parentId);
  const fab = elements.find((el) => el.type === 'FAB' && !el.parentId);

  const others = elements.filter(
    (el) =>
      el.id !== topBar?.id &&
      el.id !== bottomBar?.id &&
      el.id !== fab?.id &&
      !el.parentId
  );

  // Sort remaining root elements top-to-bottom, then left-to-right
  const sorted = [...others].sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 20) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  // Cluster elements that share similar Y rows (within 20dp)
  const rows: ComposeElement[][] = [];
  for (const el of sorted) {
    const lastRow = rows[rows.length - 1];
    if (!lastRow) {
      rows.push([el]);
    } else {
      const rowY = lastRow[0].y;
      if (Math.abs(el.y - rowY) <= 20) {
        lastRow.push(el);
      } else {
        rows.push([el]);
      }
    }
  }

  const updatedMap = new Map<string, ComposeElement>();
  let cursorY = topBar ? 76 : 24;
  const horizontalMargin = 20;

  if (topBar) {
    updatedMap.set(topBar.id, {
      ...topBar,
      x: 0,
      y: 0,
      width: canvasWidthDp,
    });
  }

  for (const row of rows) {
    if (row.length === 1) {
      const item = row[0];
      const shouldFillWidth = item.width >= canvasWidthDp * 0.65;
      const newWidth = shouldFillWidth ? canvasWidthDp - horizontalMargin * 2 : item.width;
      const newX = shouldFillWidth
        ? horizontalMargin
        : item.props.horizontalAlignment === 'CenterHorizontally'
          ? Math.round((canvasWidthDp - newWidth) / 2)
          : horizontalMargin;

      updatedMap.set(item.id, {
        ...item,
        x: newX,
        y: cursorY,
        width: newWidth,
      });
      cursorY += item.height + 16;
    } else {
      // Side-by-side items in a Row
      const gap = 12;
      let currentX = horizontalMargin;
      let maxRowHeight = 0;
      for (const item of row) {
        updatedMap.set(item.id, {
          ...item,
          x: currentX,
          y: cursorY,
        });
        currentX += item.width + gap;
        if (item.height > maxRowHeight) maxRowHeight = item.height;
      }
      cursorY += maxRowHeight + 16;
    }
  }

  if (bottomBar) {
    updatedMap.set(bottomBar.id, {
      ...bottomBar,
      x: 0,
      y: 892 - bottomBar.height,
      width: canvasWidthDp,
    });
  }

  if (fab) {
    updatedMap.set(fab.id, {
      ...fab,
      x: canvasWidthDp - fab.width - 20,
      y: (bottomBar ? 892 - bottomBar.height : 892) - fab.height - 20,
    });
  }

  return elements.map((el) => updatedMap.get(el.id) ?? el);
}
