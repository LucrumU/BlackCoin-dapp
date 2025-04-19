import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

const CONTRACT_ADDRESS = "0x72c...a258f"; // Full GriotAirdrop contract address here
const TOKEN_ADDRESS = "0xa1F222A5503Be486D9d46B3E77EF83cBa8C6f5Ff"; // Griot token contract

const ABI = [
  "function claim() external",
  "function hasClaimed(address) view returns (bool)",
  "function owner() view returns (address)",
  "function claimAmount() view returns (uint256)"
];

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [hasClaimed, setHasClaimed] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [claimAmount, setClaimAmount] = useState(null);

  useEffect(() => {
    if (signer && address && contract) {
      (async () => {
        try {
          const claimed = await contract.hasClaimed(address);
          setHasClaimed(claimed);
          const owner = await contract.owner();
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
          const amount = await contract.claimAmount();
          setClaimAmount(ethers.utils.formatEther(amount));
        } catch (err) {
          console.error("Error fetching contract data:", err);
        }
      })();
    }
  }, [signer, address, contract]);

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setProvider(provider);
    setSigner(signer);
    setAddress(address);
    setContract(contract);
  };

  const claimTokens = async () => {
    try {
      setClaiming(true);
      const tx = await contract.claim();
      await tx.wait();
      setHasClaimed(true);
    } catch (err) {
      alert("Claim failed: " + err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8 space-y-6">
      <h1 className="text-3xl md:text-5xl font-bold text-green-500">Griot Airdrop</h1>
      {!address ? (
        <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-2xl">
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm md:text-base text-gray-300">Connected: {address}</p>

          {hasClaimed ? (
            <p className="text-lg text-green-400 font-medium">
              You’ve already claimed your {claimAmount} Griot tokens.
            </p>
          ) : (
            <Button
              onClick={claimTokens}
              disabled={claiming}
              className={`px-6 py-3 text-lg rounded-2xl transition duration-200 ${
                claiming ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {claiming ? "Claiming..." : `Claim ${claimAmount || "your"} Griot Tokens`}
            </Button>
          )}

          {isOwner && (
            <div className="mt-6 border-t pt-4 border-green-800">
              <p className="text-green-500 font-semibold text-sm">You are the contract owner.</p>
              <p className="text-xs text-gray-400">Monitor or manage your drop here in future updates.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
