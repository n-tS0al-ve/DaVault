import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { deleteGameServerDeployment } from "@/lib/k8s/client";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: serverId } = await params;

    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }

    // Ensure the user owns the server
    const server = await prisma.gameServer.findUnique({
      where: { id: serverId }
    });

    if (!server || server.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // 1. Delete from Kubernetes
    if (server.kubeDeployId) {
      await deleteGameServerDeployment(server.id);
    }

    // 2. Delete from Database
    await prisma.gameServer.delete({
      where: { id: serverId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete server", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
