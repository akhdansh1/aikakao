import { useEffect, useState } from "react";

/**
 * Memaksa re-render komponen setiap `intervalMs` milidetik. Dipakai di
 * layar yang menampilkan label waktu relatif (mis. "5 menit lalu") agar
 * label tersebut ikut bertambah tanpa perlu aksi apa pun dari pengguna,
 * selama layar tersebut sedang dibuka.
 */
export function useNowTick(intervalMs: number = 30_000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
