'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DespesasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/lancamentos');
  }, [router]);
  return null;
}
