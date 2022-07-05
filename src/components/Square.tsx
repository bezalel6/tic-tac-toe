import { useEffect, useState } from "react";
import { BoardMod } from "./Board";
import { Player } from "./Player";
import "./Square.css";
import { Location } from "./BoardState";

export type Setter = ((state: ButtonState) => void) | null;
export type ButtonState = null | Player;
function Square({
  setInitState,
  mod,
  loc,
}: {
  setInitState: (state: Setter) => void;
  mod: BoardMod;
  loc: Location;
}) {
  const [state, setState] = useState<ButtonState>();
  useEffect(() => {
    setInitState(setState);
  }, [setInitState]);
  const click = () => {
    if (!state) setState(mod.mod(loc));
  };
  return (
    <button className="square" onClick={click}>
      {state ? state : " "}
    </button>
  );
}
export default Square;
