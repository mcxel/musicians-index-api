import { redirect } from "next/navigation";

interface ContestAdminLayoutProps {
  children: React.ReactNode;
}

export default async function ContestAdminLayout({
  children,
}: Readonly<ContestAdminLayoutProps>) {
  // Deny-by-default: replace with real session check before enabling admin access
  redirect("/auth");
}