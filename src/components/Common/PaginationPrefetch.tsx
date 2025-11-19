"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  prevHref?: string;
  nextHref?: string;
}

export default function PaginationPrefetch({ prevHref, nextHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch next/prev pages when the component mounts
    // This helps make the first navigation to adjacent pages feel instant in prod
    try {
      if (nextHref && nextHref !== "#") router.prefetch(nextHref);
      if (prevHref && prevHref !== "#") router.prefetch(prevHref);
    } catch {
      // ignore prefetch errors in dev
    }
    // only run once per href set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevHref, nextHref]);

  return null;
}
