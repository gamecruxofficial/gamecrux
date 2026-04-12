'use client'

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="text-white">
      <h1>Welcome, {session?.user?.name}!</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Discord ID: {session?.user?.discordId}</p>
      <p>User ID: {session?.user?.id}</p>
    </div>
  );
}
