import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServerList from "./ServerList";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const servers = await prisma.gameServer.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="text-gray-400 mt-1">Manage your game servers</p>
        </div>
      </div>
      
      <ServerList initialServers={servers} />
    </div>
  );
}
