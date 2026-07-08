"use client";
import React from 'react';
import {useUserRole} from './useUserRole';

export const AdminGate = ({children, allowed}:{children:React.ReactNode, allowed?: string[]})=>{
  const {role} = useUserRole();
  const allowedRoles = allowed ?? ['founder','aiExecutive','admin','observer'];
  if(allowedRoles.includes(role)) return <>{children}</>;
  return (
    <div style={{padding:24,background:'#0b0b10',color:'#ffd',borderRadius:8}}>
      <h3>Access denied</h3>
      <p style={{opacity:.9}}>You don't have permission to view this workspace in your current role: <strong>{role}</strong>.</p>
      <p style={{fontSize:13,opacity:.8}}>Request access or switch to an authorized role.</p>
    </div>
  )
}

export default AdminGate;
