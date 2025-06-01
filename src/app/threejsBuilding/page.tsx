import GeneratedBuilding from "@/components/GeneratedBuilding";
import ThreeScene from "@/components/threescene";
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
