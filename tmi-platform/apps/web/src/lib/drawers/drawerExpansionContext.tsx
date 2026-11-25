"use client";

import { createContext } from "react";

/** True when the hub drawer slot owns viewport sizing for its children. */
export const DrawerSlotExpansionContext = createContext(false);
