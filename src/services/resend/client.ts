import { envServer } from "@/data/env/server";
import { Resend } from "resend";

export const resend = new Resend(envServer.RESEND_API_KEY);
