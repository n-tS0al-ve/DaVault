import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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

    const newServer = await prisma.gameServer.create({
      data: {
        name,
        image,
        userId: session.user.id,
        status: "STOPPED", // Initial status
      },
    });

    return NextResponse.json(newServer, { status: 201 });
  } catch (error) {
    console.error("Failed to create server", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
