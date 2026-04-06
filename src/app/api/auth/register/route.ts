import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db-error";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPassword = typeof password === "string" ? password : "";

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (isDatabaseConnectionError(error)) {
      return NextResponse.json(
        { message: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
