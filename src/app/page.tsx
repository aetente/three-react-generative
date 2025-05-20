import ThreeScene from "@/components/threescene/ThreeScene";
import { ThreeProvider } from "@/providers/ThreeContext";


export default function Home() {
  return (
    <div>
      <ThreeProvider>
        <ThreeScene />
      </ThreeProvider>
    </div>
  );
}
