import { Button } from "@repo/ui/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="font-sans grid grid-rows-[10px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center">
        <img
          src="/images/airstream-tower.webp"
          alt="Airstream Tower"
          className="w-full"
        />
        <h1 className="font-header text-4xl font-bold text-center">
          Welcome to the future of airdropping
        </h1>
        <Button
          onClick={() => navigate("/create")}
          className="font-header py-4 px-8 rounded-lg text-xl mx-auto mt-20"
        >
          Create an Airstream
        </Button>
      </main>
    </div>
  );
}
