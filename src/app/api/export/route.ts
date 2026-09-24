import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exportQuerySchema } from "@/lib/validation";
import { sendEnquiryAck, sendEnquiryAlert } from "@/lib/email";

/** POST /api/export — export enquiry from the Export Queries page. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = exportQuerySchema.safeParse(payload);
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
        type: "EXPORT",
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        message: input.query,
      },
    });

    // The enquiry is saved; email is a courtesy on top of it.
    await Promise.allSettled([
      sendEnquiryAlert({
        kind: "Export",
        name: `${input.firstName} ${input.lastName}`,
        email: input.email,
        phone: input.phone,
        message: input.query,
      }),
      sendEnquiryAck({ to: input.email, name: input.firstName }),
    ]);

    return NextResponse.json({ id: query.id, received: true }, { status: 201 });
  } catch (error) {
    console.error("[api/export]", error);
    return NextResponse.json(
      { error: "Could not send your query. Please try again." },
      { status: 500 },
    );
  }
}
