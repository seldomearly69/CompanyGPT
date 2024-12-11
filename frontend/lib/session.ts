import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { User } from "@/types";

export async function getCurrentUser(): Promise<User> {
  const session = await getServerSession(authOptions);
  return session?.user as User;
}