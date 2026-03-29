import React from "react";

const SystemHealth = () => {
  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: 0 }}>System Health</h3>
      <ul style={{ marginTop: 8 }}>
        <li>CPU: 12%</li>
        <li>Memory: 6.2 GB</li>
        <li>DB: OK</li>
      </ul>
    </div>
  );
};

export default SystemHealth;
