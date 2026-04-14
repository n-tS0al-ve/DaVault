import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createGameServerDeployment } from "@/lib/k8s/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await req.json();

    if (!name || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Save initial record to DB so we have an ID
    const newServer = await prisma.gameServer.create({
      data: {
        name,
        image,
        userId: session.user.id,
        status: "STARTING", 
      },
    });

    // 2. Trigger Kubernetes Deployment
    try {
      const kubeDeployId = await createGameServerDeployment(newServer.id, image, name);
      
      // 3. Update DB with deployment ID and status
      const updatedServer = await prisma.gameServer.update({
        where: { id: newServer.id },
        data: { 
          kubeDeployId: kubeDeployId,
          status: "RUNNING" // In a real app, this should be polled or updated via webhook
        }
      });

      return NextResponse.json(updatedServer, { status: 201 });
    } catch (k8sError) {
      console.error("Kubernetes deployment failed:", k8sError);
      
      // Mark as error in DB if deployment fails
      await prisma.gameServer.update({
        where: { id: newServer.id },
        data: { status: "ERROR" }
      });
      
      return NextResponse.json({ error: "Failed to deploy to cluster. Server saved but offline." }, { status: 500 });
    }

  } catch (error) {
    console.error("Failed to create server", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
