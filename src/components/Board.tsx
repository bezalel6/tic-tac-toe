import { useEffect, useRef, useState } from "react";
import "./Board.css";
import { BoardState } from "./BoardState";
import { Player } from "./Player";
import Square, { ButtonState } from "./Square";
import { Location } from "./BoardState";
import { assert } from "console";
function Board(props: any) {
  const ref = useRef(new BoardState());
  const currentState = ref.current;
  const [gameStatus, setGameStatus] = useState<GameStatus>("Game Goes On");
  const [turn, setTurn] = useState<Player>();

  const modFunc: (loc: Location) => Player = (loc) => {
    const plr = currentState.applyMove(loc);

    const status = checkStatus(currentState);

    if (status !== "Game Goes On") {
      setAiState("---");
    }
    setGameStatus(status);
    currentState.setAll();
    setTurn(currentState.player2Move());
    return plr;
  };
  type AiState = "ready" | "---" | "thinking";
  const [aiState, setAiState] = useState<AiState>("ready");
  async function go() {
    if (aiState !== "ready") return;
    setAiState("thinking");
    setTimeout(() => {
      minimax(currentState, currentState.player2Move()).then((minimaxx) => {
        console.log(minimaxx);
        setAiState("ready");
        modFunc(minimaxx.move!);
      });
    }, 10);
  }

  const mod: BoardMod = { currentState, mod: modFunc };
  const newGame = () => {
    currentState.reset();
    setTurn(currentState.player2Move());
    const status = checkStatus(currentState);
    setAiState("ready");
    setGameStatus(status);
  };
  useEffect(newGame, []);
  return (
    <>
      <h1>
        {gameStatus === "Game Goes On"
          ? turn + " turn"
          : gameStatus === "O" || gameStatus === "X"
          ? gameStatus + " won"
          : gameStatus}
      </h1>
      <button className={"new-game-btn"} onClick={newGame}>
        New Game
      </button>
      <button className={"go-btn"} onClick={go}>
        {aiState === "ready" ? "ai move" : aiState}
      </button>
      <div className="container">
        {currentState.board.map((rowArr, row) => {
          return rowArr.map((state, col) => {
            const loc = { row, col };
            return (
              <Square
                loc={loc}
                setInitState={(setter) => {
                  currentState.bindSetter(loc, setter);
                }}
                mod={mod}
                key={row + " " + col}
              ></Square>
            );
          });
        })}
      </div>
    </>
  );
}
/**
 * Matrix(3,2);
  Array [ Array[2], Array[2], Array[2] ]
 */
export function Matrix<T extends null>(m: number, n: number, _ = null): T[][] {
  var a = [],
    b;
  var i, j;
  for (i = 0; i < m; i++) {
    for (j = 0, b = []; j < n; j++) {
      b.push(null);
    }
    a.push(b);
  }
  return a as T[][];
}

function checkStatus({ board, empty }: BoardState): GameStatus {
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2]
    ) {
      return board[i][0]!;
    }
    if (
      board[0][i] &&
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    ) {
      return board[0][i]!;
    }
  }
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    return board[0][0]!;
  }
  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    return board[0][2]!;
  }

  return empty.size ? "Game Goes On" : "Tie";
}
// export type Board = ButtonState[][];
type GameStatus = Player | "Game Goes On" | "Tie";
export type BoardMod = {
  currentState: BoardState;
  mod: (loc: Location) => Player;
};
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
class Minimax {
  move?: Location;
  score: number | null = null;
  depth!: number;
}
async function minimax(
  board: BoardState,
  aiPlayer: Player,
  isMax: boolean = true,
  depth: number = 0,
  a = -101,
  b = 101
): Promise<Minimax> {
  const status = checkStatus(board);
  const ret = new Minimax();
  ret.depth = depth;
  switch (status) {
    case "Game Goes On": {
      const cpSet = new Set(board.empty);
      for (const loc of cpSet) {
        board.applyMove(loc);
        // await delay(1000);
        let res = await minimax(board, aiPlayer, !isMax, depth + 1, a, b);
        // board.setAll();
        // if (!depth) console.log("depth", depth, res, loc);
        // await delay(1000);
        board.undoMove(loc);
        if (
          ret.score == null ||
          (isMax ? res.score! > ret.score : ret.score > res.score!)
        ) {
          ret.move = loc;
          ret.score = res.score;
        } /*else if (ret.score === res.score) {
          if (isMax && ret.depth > res.depth)
            if (res.score! > 0) {
              ret.depth = res.depth;
              ret.move = res.move;
            }
        }*/
        if (isMax) {
          a = Math.max(a, ret.score!);
        } else {
          b = Math.min(b, ret.score!);
        }
        if (b <= a) break;
      }
      break;
    }
    case "Tie": {
      ret.score = 0;
      break;
    }
    case aiPlayer: {
      ret.score = 100;
      break;
    }
    default: {
      ret.score = -100;
      break;
    }
  }
  return Promise.resolve(ret);
}

export default Board;
