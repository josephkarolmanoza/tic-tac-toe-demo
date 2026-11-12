"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  emptyBoard,
  getOutcome,
  nextPlayer,
  type Cell,
  type Player,
} from "@/lib/game";

type Scores = Record<Player | "draws", number>;

const startingScores: Scores = { X: 0, O: 0, draws: 0 };
const boardSizes = [3, 4, 5] as const;

function statusLabel(turn: Player, outcome: ReturnType<typeof getOutcome>) {
  if (outcome?.kind === "win") return `${outcome.player} wins`;
  if (outcome?.kind === "draw") return "Draw";
  return `${turn} to move`;
}

export function TicTacToe() {
  const [size, setSize] = useState<number>(3);
  const [board, setBoard] = useState<Cell[]>(() => emptyBoard(3));
  const [turn, setTurn] = useState<Player>("X");
  const [scores, setScores] = useState<Scores>(startingScores);

  const outcome = getOutcome(board, size);
  const winningLine = outcome?.kind === "win" ? outcome.line : [];

  function play(index: number) {
    if (outcome || board[index]) return;

    const next = board.slice();
    next[index] = turn;
    setBoard(next);

    const result = getOutcome(next, size);
    if (result?.kind === "win") {
      const winner = result.player;
      setScores((current) => ({ ...current, [winner]: current[winner] + 1 }));
      return;
    }
    if (result?.kind === "draw") {
      setScores((current) => ({ ...current, draws: current.draws + 1 }));
      return;
    }

    setTurn((current) => nextPlayer(current));
  }

  function newRound() {
    setBoard(emptyBoard(size));
    setTurn((current) => (outcome?.kind === "win" ? outcome.player : "X"));
  }

  function changeSize(nextSize: number) {
    if (nextSize === size) return;
    setSize(nextSize);
    setBoard(emptyBoard(nextSize));
    setTurn("X");
    setScores({ ...startingScores });
  }

  function resetScores() {
    setBoard(emptyBoard(size));
    setTurn("X");
    setScores({ ...startingScores });
  }

  return (
    <Card className="w-full max-w-4xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold sm:text-3xl">Tic-Tac-Toe</CardTitle>
        <CardDescription className={`font-bold ${outcome?.kind === "draw" ? "" : turn === "X" ? "text-amber-700" : "text-purple-700"}`}>
          {statusLabel(turn, outcome)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <label className="flex items-center justify-between gap-3 text-sm font-medium">
          Board size
          <select
            aria-label="Board size"
            className="rounded-md border border-input bg-background px-3 py-2"
            value={size}
            onChange={(event) => changeSize(Number(event.target.value))}
          >
            {boardSizes.map((boardSize) => (
              <option key={boardSize} value={boardSize}>
                {boardSize} x {boardSize}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <PlayerRecord
            player="X"
            wins={scores.X}
            losses={scores.O}
            draws={scores.draws}
            active={turn === "X" && !outcome}
          />
          <PlayerRecord
            player="O"
            wins={scores.O}
            losses={scores.X}
            draws={scores.draws}
            active={turn === "O" && !outcome}
          />
        </div>
        <div
          className="mx-auto grid w-full self-center gap-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, maxWidth: "min(100%, 40vh)" }}
          aria-label={`${size} by ${size} tic-tac-toe board`}
        >
          {board.map((cell, index) => {
            const row = Math.floor(index / size) + 1;
            const column = (index % size) + 1;
            const winning = winningLine.includes(index);

            return (
              <Button
                key={index}
                type="button"
                variant={winning ? "default" : cell ? "secondary" : "outline"}
                aria-label={
                  cell
                    ? `Row ${row}, column ${column}, ${cell}`
                    : `Row ${row}, column ${column}, empty`
                }
                disabled={Boolean(cell) || Boolean(outcome)}
                onClick={() => play(index)}
                className={`aspect-square h-auto w-full min-w-0 p-1 text-2xl font-semibold disabled:opacity-100 sm:text-4xl ${
                  cell === "X"
                    ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : cell === "O"
                      ? "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                      : ""
                } ${
                  winning
                    ? outcome?.kind === "win" && outcome.player === "X"
                      ? "border-amber-500 bg-amber-500 text-amber-950 hover:bg-amber-600"
                      : "border-purple-600 bg-purple-600 text-white hover:bg-purple-700"
                    : ""
                }`}
              >
                {cell}
              </Button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button type="button" variant={outcome ? "default" : "outline"} onClick={newRound}>
          New round
        </Button>
        <Button type="button" variant="ghost" onClick={resetScores}>
          <RotateCcw />
          Reset scores
        </Button>
      </CardFooter>
    </Card>
  );
}

function PlayerRecord({
  player,
  wins,
  losses,
  draws,
  active,
}: {
  player: Player;
  wins: number;
  losses: number;
  draws: number;
  active: boolean;
}) {
  return (
    <section
      aria-label={`Player ${player}`}
      className={
        player === "X"
          ? active
            ? "rounded-lg bg-amber-500 px-3 py-2 text-amber-950"
            : "rounded-lg bg-amber-50 px-3 py-2 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
          : active
            ? "rounded-lg bg-purple-600 px-3 py-2 text-white"
            : "rounded-lg bg-purple-50 px-3 py-2 text-purple-950 dark:bg-purple-950/40 dark:text-purple-100"
      }
    >
      <h2 className="text-sm font-semibold">Player {player}</h2>
      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <Stat label="Wins" value={wins} />
        <Stat label="Losses" value={losses} />
        <Stat label="Draws" value={draws} />
      </dl>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs tracking-wide uppercase text-neutral-950 dark:text-neutral-100">
        {label}
      </dt>
      <dd className="text-base font-semibold tabular-nums text-neutral-950 dark:text-neutral-100">{value}</dd>
    </div>
  );
}