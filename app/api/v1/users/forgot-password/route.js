import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function generateTempPassword() {
  const prefix = "DMY@";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const all = upper + lower + numbers;
  let randomPart =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)];
  for (let i = 4; i < 8; i++) {
    randomPart += all[Math.floor(Math.random() * all.length)];
  }
  randomPart = randomPart
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
  return prefix + randomPart;
}

export async function POST(req) {
  await connectToDatabase();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json(
      { message: "Email is required." },
      { status: 400 }
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }
  const tempPassword = generateTempPassword();
  user.password = tempPassword;
  await user.save();

  return NextResponse.json({
    message: "Temporary password generated backend.",
    user_name: user.name || "User",
    password: tempPassword,
    email: user.email,
    time: new Date().toLocaleString(),
  });
}
