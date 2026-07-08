"use client";
import React from 'react';
import {UserRoleProvider, useUserRole} from './useUserRole';
import {ErrorBoundary} from './ErrorBoundary';

const Header = ()=>{
  const {role,setRole} = useUserRole();
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'#120616',color:'#ffd',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
      <div style={{fontWeight:600}}>BVOS — Overseer</div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <select value={role} onChange={e=>setRole(e.target.value as any)} style={{background:'#221022',color:'#ffd',border:'1px solid rgba(255,255,255,0.04)',padding:'6px 8px'}}>
          <option value="founder">Founder</option>
          <option value="aiExecutive">AI Executive</option>
          <option value="producer">Producer</option>
          <option value="observer">Observer</option>
          <option value="devAssistant">Dev Assistant</option>
          <option value="performer">Performer</option>
          <option value="fan">Fan</option>
        </select>
      </div>
    </div>
  )
}

export const WorkspaceShell = ({children}:{children:React.ReactNode})=>{
  return (
    <UserRoleProvider>
      <ErrorBoundary>
        <div style={{minHeight:'100vh',background: 'radial-gradient(circle at 50% 20%, rgba(170,45,255,0.05), transparent 20%), #0a0a0c',color:'#fff',fontFamily:'Inter, sans-serif'}}>
          <Header />
          <div style={{padding:16}}>
            {children}
          </div>
        </div>
      </ErrorBoundary>
    </UserRoleProvider>
  )
}

export default WorkspaceShell;
