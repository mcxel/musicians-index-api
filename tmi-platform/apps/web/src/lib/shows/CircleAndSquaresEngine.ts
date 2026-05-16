/**
 * Circle & Squares Engine
 * Grid-based show with cell assignment, reveal, pattern detection, and scoring.
 */
import { ShowRuntimeEngine } from './ShowRuntimeEngine';

export type GridCell = {
  id: string;
  position: number;
  occupantId: string | null;
  revealed: boolean;
  pointValue: number;
};

const PATTERN_POINT_BONUS = 150;

export class CircleAndSquaresEngine extends ShowRuntimeEngine {
  private grid: GridCell[];
  private gridSize: number;

  constructor(gridSize = 9) {
    super('circle-squares', 3);
    this.gridSize = gridSize;
    this.grid = [];
    this.buildGrid();
  }

  buildGrid(): void {
    this.grid = Array.from({ length: this.gridSize }, (_, i) => ({
      id: `cell-${i}`,
      position: i,
      occupantId: null,
      revealed: false,
      pointValue: Math.floor(Math.random() * 50) + 10, // 10–59 points
    }));
  }

  assignCell(position: number, contestantId: string): boolean {
    const cell = this.grid[position];
    if (!cell || cell.occupantId !== null) return false;
    cell.occupantId = contestantId;
    return true;
  }

  revealCell(position: number): GridCell {
    const cell = this.grid[position];
    if (!cell) {
      throw new Error(`Cell at position ${position} does not exist`);
    }
    cell.revealed = true;

    // Award points to the occupant if claimed
    if (cell.occupantId) {
      const contestant = this.state.contestants.find((c) => c.id === cell.occupantId);
      if (contestant) {
        contestant.score += cell.pointValue;
      }
    }

    return { ...cell };
  }

  calculateGridScore(contestantId: string): number {
    return this.grid
      .filter((c) => c.occupantId === contestantId && c.revealed)
      .reduce((sum, c) => sum + c.pointValue, 0);
  }

  checkPattern(): string | null {
    const size = Math.sqrt(this.gridSize);
    if (!Number.isInteger(size)) return null;

    const s = Math.round(size);

    // Check horizontal lines (squares)
    for (let row = 0; row < s; row++) {
      const start = row * s;
      const rowCells = this.grid.slice(start, start + s);
      if (rowCells.length === s && rowCells.every((c) => c.revealed)) {
        const firstOccupant = rowCells[0].occupantId;
        if (firstOccupant && rowCells.every((c) => c.occupantId === firstOccupant)) {
          // Award bonus
          const contestant = this.state.contestants.find((c) => c.id === firstOccupant);
          if (contestant) contestant.score += PATTERN_POINT_BONUS;
          return 'square';
        }
      }
    }

    // Check diagonal
    const mainDiag = Array.from({ length: s }, (_, i) => this.grid[i * s + i]);
    if (mainDiag.every((c) => c.revealed)) {
      const firstOccupant = mainDiag[0]?.occupantId;
      if (firstOccupant && mainDiag.every((c) => c.occupantId === firstOccupant)) {
        const contestant = this.state.contestants.find((c) => c.id === firstOccupant);
        if (contestant) contestant.score += PATTERN_POINT_BONUS;
        return 'diagonal';
      }
    }

    // Check vertical column (circle pattern)
    for (let col = 0; col < s; col++) {
      const colCells = Array.from({ length: s }, (_, row) => this.grid[row * s + col]);
      if (colCells.every((c) => c.revealed)) {
        const firstOccupant = colCells[0]?.occupantId;
        if (firstOccupant && colCells.every((c) => c.occupantId === firstOccupant)) {
          const contestant = this.state.contestants.find((c) => c.id === firstOccupant);
          if (contestant) contestant.score += PATTERN_POINT_BONUS;
          return 'circle';
        }
      }
    }

    return null;
  }

  getGrid(): GridCell[] {
    return this.grid.map((c) => ({ ...c }));
  }
}
