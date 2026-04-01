// apps/web/src/app/not-found.tsx
// Custom 404 page — no auth needed
// Copilot wires: NotFoundShell component
// VS Code proves: navigating to /anything-invalid shows this page
import NotFoundShell from '@/components/error/NotFoundShell';
export default function NotFound() {
  return <NotFoundShell />;
}
