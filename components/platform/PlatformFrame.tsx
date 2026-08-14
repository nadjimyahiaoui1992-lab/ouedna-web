// Shared frame keeps public platform pages visually consistent with Ouedna's calm-sands system.
import type { ReactNode } from "react";
import PlatformFooter from "./PlatformFooter";
import PlatformHeader from "./PlatformHeader";

export default function PlatformFrame({ children, active }: { children: ReactNode; active?: string }) {
  return <div className="platform-shell" dir="rtl"><PlatformHeader active={active} /><main className="platform-main">{children}</main><PlatformFooter /></div>;
}
