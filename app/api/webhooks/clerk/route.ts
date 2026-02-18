import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
    // Read the raw request body
    
  const payload = await req.text();

  const hdrs = await headers();
  const headerPayload = {
    "svix-id": hdrs.get("svix-id") ?? "",
    "svix-timestamp": hdrs.get("svix-timestamp") ?? "",
    "svix-signature": hdrs.get("svix-signature") ?? "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, headerPayload) as WebhookEvent;
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const userData = evt.data;
    const email =
      userData.email_addresses?.[0]?.email_address ?? "no-email@unknown.com";
    const name = [userData.first_name, userData.last_name]
      .filter(Boolean)
      .join(" ") || null;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

if (!existingUser) {
        await prisma.user.create({
  data: {
    id: String(userData.id),
    email,
    name: name || "User",
    updatedAt: new Date(),
  },
});
}

    } catch (error_) {
      console.error("❌ DB insert failed:", error_);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}