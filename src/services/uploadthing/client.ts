import { envServer } from "@/data/env/server";
import { UTApi } from "uploadthing/server";

export const uploadthing = new UTApi({ token: envServer.UPLOADTHING_TOKEN });
