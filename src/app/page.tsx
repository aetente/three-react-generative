import ThreeCanonExample from "@/components/ThreeCanonExample";
import { ThreeProvider } from "@/providers/ThreeContext";


export default function Home() {
  return (
    <div>
      <ThreeProvider>
        <ThreeCanonExample />
      </ThreeProvider>
    </div>
  );
}
