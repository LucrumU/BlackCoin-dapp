import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaArrowsAltH } from "react-icons/fa";

export default function DEXDashboard() {
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [tokenIn, setTokenIn] = useState("GRIOT");
  const [tokenOut, setTokenOut] = useState("ETH");

  const handleSwap = () => {
    // Placeholder logic — real contract interaction will go here
    setOutputAmount(inputAmount * 0.002); // Example rate
  };

  const switchTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setInputAmount(0);
    setOutputAmount(0);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-md mx-auto py-10">
        <h1 className="text-3xl font-bold text-center text-green-500 mb-6">BlackCoin DEX</h1>
        <ConnectButton />

        <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 mt-8">
          <div className="mb-4">
            <label className="block mb-1 text-sm">From ({tokenIn})</label>
            <input
              type="number"
              className="w-full rounded-xl px-4 py-2 bg-zinc-800 text-white focus:outline-none"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
            />
          </div>

          <div className="flex justify-center my-4">
            <button onClick={switchTokens} className="text-green-500 text-2xl">
              <FaArrowsAltH />
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm">To ({tokenOut})</label>
            <input
              type="number"
              readOnly
              className="w-full rounded-xl px-4 py-2 bg-zinc-800 text-white focus:outline-none"
              value={outputAmount}
            />
          </div>

          <button
            onClick={handleSwap}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl mt-4"
          >
            Swap
          </button>
        </div>

        <div className="text-center text-sm text-gray-400 mt-6">
          <p>Griot Token to ETH swap is simulated. Real interaction coming next.</p>
        </div>
      </div>
    </div>
  );
}
