import { Matrix } from "./Board";
import { ButtonState, Setter } from "./Square";

export class BoardState {
  board;
  empty = new Set<Location>();
  x2Move;
  buttonSetters: Array<Array<Setter>> = Matrix(3, 3);
  constructor(
    board: ButtonState[][] = Matrix(3, 3, null),
    x2Move: boolean = true
  ) {
    this.board = board;
    this.x2Move = x2Move;
    this.initEmpty();
  }
  initEmpty() {
    this.empty.clear();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.empty.add({ row: i, col: j });
      }
    }
  }
  applyMove(loc: Location) {
    this.board[loc.row][loc.col] = this.x2Move ? "X" : "O";
    this.x2Move = !this.x2Move;
    let search: Location[] = [];
    this.empty.forEach((emp) => {
      // if (search) return;
      if (emp.row === loc.row && emp.col === loc.col) {
        search.push(emp);
      }
    });
    const del = search.forEach((s) => this.empty.delete(s));
    return this.board[loc.row][loc.col]!;
  }
  undoMove(loc: Location) {
    this.board[loc.row][loc.col] = null;
    this.empty.add(loc);
    this.x2Move = !this.x2Move;
  }
  reset() {
    this.board = Matrix(3, 3);
    this.initEmpty();
    this.x2Move = true;
    this.setAll();
  }
  player2Move() {
    return this.x2Move ? "X" : "O";
  }
  bindSetter(loc: Location, setter: Setter) {
    this.buttonSetters[loc.row][loc.col] = setter;
  }
  setAll() {
    this.board.forEach((row, rIndex) =>
      row.forEach((state, cIndex) => {
        this.buttonSetters[rIndex][cIndex]!(state);
      })
    );
  }
}
export interface Location {
  row: number;
  col: number;
}
