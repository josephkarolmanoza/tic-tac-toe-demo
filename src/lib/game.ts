export type Player = "X" | "O";
export type Cell = Player | null;

export type Outcome =
  | { kind: "win"; player: Player; line: readonly number[] }
  | { kind: "draw" };

export function emptyBoard(size = 3): Cell[] {
  return Array<Cell>(size * size).fill(null);
}

export function getOutcome(board: readonly Cell[], size = 3): Outcome | null {
  const lines: number[][] = [];

  for (let index = 0; index < size; index += 1) {
    lines.push(
      Array.from({ length: size }, (_, offset) => index * size + offset),
      Array.from({ length: size }, (_, offset) => offset * size + index),
    );
  }

  lines.push(
    Array.from({ length: size }, (_, offset) => offset * size + offset),
    Array.from({ length: size }, (_, offset) => offset * size + (size - offset - 1)),
  );

  for (const line of lines) {
    const mark = board[line[0]];
    if (mark && line.every((index) => board[index] === mark)) {
      return { kind: "win", player: mark, line };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { kind: "draw" };
  }

  return null;
}

export function nextPlayer(player: Player): Player {
  return player === "X" ? "O" : "X";
}