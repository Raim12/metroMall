import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { sendEnquiryAck, sendEnquiryAlert } from "@/lib/email";

/** POST /api/contact — support form on the FAQ and Contact pages. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const input = parsed.data;

  try {
    const query = await prisma.query.create({
      data: {
        type: "CONTACT",
        firstName: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      },
    });

    await Promise.allSettled([
      sendEnquiryAlert({
        kind: "Contact",
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      }),
      sendEnquiryAck({ to: input.email, name: input.name.split(" ")[0] }),
    ]);

    return NextResponse.json({ id: query.id, received: true }, { status: 201 });
  } catch (error) {
    console.error("[api/contact]", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }
}
