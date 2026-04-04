import { OrganizationList } from "@clerk/nextjs";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

const OrganizationsSelectPage = (props: Props) => {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
};

const SuspendedPage = async ({ searchParams }: Props) => {
  const { redirect } = await searchParams;
  const redirectUrl = redirect ?? "/employer";

  return (
    <OrganizationList
      hidePersonal
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectUrl}
      afterCreateOrganizationUrl={redirectUrl}
    />
  );
};

export default OrganizationsSelectPage;
