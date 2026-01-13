import { Toaster } from "react-hot-toast";
import POSTopbar from "./POSTopbar";
import PointOfSale from "./PointOfSale";

export default function POSLayout() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="flex flex-col bg-white h-screen overflow-hidden">
      <Toaster position="top-right" />
      <POSTopbar user={user} />
      <main className="flex-1 overflow-hidden">
        <PointOfSale />
      </main>
    </div>
  );
}
