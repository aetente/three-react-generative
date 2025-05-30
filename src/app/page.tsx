import ThreeCanonExample from "@/components/ThreeCanonExample";
import { ThreeCanonProvider } from "@/providers/ThreeCanonProvider";


export default function Home() {
  return (
    <div>
      <ThreeCanonProvider>
        <ThreeCanonExample />
      </ThreeCanonProvider>
    </div>
  );
}
