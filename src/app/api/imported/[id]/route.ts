import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  void req;

  const { id } = await params;

  await prisma.importedEmail.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
