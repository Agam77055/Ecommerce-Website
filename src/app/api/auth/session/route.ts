import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  return Response.json(session);
} 