import type { auth } from "@amaris/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";
import { API_BASE_URL } from "../constants";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [inferAdditionalFields<typeof auth>(), polarClient()],
});
