import { getServerSession } from "next-auth";
import { GET as authHandler } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authHandler);
  return Response.json(session);
} 