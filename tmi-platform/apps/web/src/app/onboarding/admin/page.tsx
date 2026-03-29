"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOnboarding() {
  const [name, setName] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard/admin");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Onboarding</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
