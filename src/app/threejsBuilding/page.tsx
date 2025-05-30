import GeneratedBuilding from "@/components/GeneratedBuilding/GeneratedBuilding";
import ThreeScene from "@/components/threescene/ThreeScene";
import { ThreeProvider } from "@/providers/ThreeContext";


export default function ThreejsBuilding() {
  return (
    <div>
      <ThreeProvider>
        <GeneratedBuilding />
      </ThreeProvider>
    </div>
  );
}
