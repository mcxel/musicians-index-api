"use client";
import React, {createContext, useContext, useState, ReactNode} from "react";

type Role = "founder" | "aiExecutive" | "producer" | "observer" | "devAssistant" | "performer" | "fan" | "admin";

type Ctx = {role: Role; setRole: (r: Role)=>void};

const RoleContext = createContext<Ctx | undefined>(undefined);

export const UserRoleProvider = ({children}:{children:ReactNode})=>{
  const [role,setRole] = useState<Role>(typeof window!=='undefined' && (window as any).__TMI_USER_ROLE__ ? (window as any).__TMI_USER_ROLE__ : 'observer');
  return <RoleContext.Provider value={{role,setRole}}>{children}</RoleContext.Provider>;
};

export const useUserRole = ()=>{
  const c = useContext(RoleContext);
  if(!c) throw new Error('useUserRole must be used inside UserRoleProvider');
  return c;
};

export default useUserRole;
