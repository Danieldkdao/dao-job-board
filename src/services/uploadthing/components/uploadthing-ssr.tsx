import { connection } from "next/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { customFileRouter } from "../router";
import { Suspense } from "react";

export const UploadthingSSR = () => {
  return (
    <Suspense>
      <SSRSuspense />
    </Suspense>
  );
};

export const SSRSuspense = async () => {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(customFileRouter)} />;
};
