import { redirect } from "next/navigation";

type LegacyIssueByIdProps = {
  params: {
    id: string;
  };
};

export default function LegacyIssueByIdRedirectPage({ params }: LegacyIssueByIdProps) {
  redirect(`/magazine/issue/${params.id}`);
}
