'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login"); // redireciona se não estiver logado
    }
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <p>Carregando...</p>;
  }

  return <>{children}</>;
}
