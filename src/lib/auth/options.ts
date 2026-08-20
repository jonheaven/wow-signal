import { createServerFn } from "@tanstack/react-start";
import { grokPreviewSafe, listSignInOptions, type SignInOption } from "./native";

export type { SignInOption };

export const getSignInOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<SignInOption[]> => {
    const grokId = process.env.GROK_AUTH_CLIENT_ID?.trim();
    const grokSecret = process.env.GROK_AUTH_CLIENT_SECRET?.trim();
    const baseURL = process.env.BETTER_AUTH_URL?.trim();
    const previewSafe = grokPreviewSafe(baseURL);
    const productionGrok = Boolean(grokId && grokSecret && grokId !== "grok_preview");
    const previewGrok = previewSafe && (!grokId || grokId === "grok_preview");
    return listSignInOptions({
      grokBroker: productionGrok || previewGrok,
      previewSafe,
    });
  },
);
