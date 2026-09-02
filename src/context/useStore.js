import { useContext } from "react";
import { StoreContext } from "./StoreContextObject";

export const useStore = () => useContext(StoreContext);
