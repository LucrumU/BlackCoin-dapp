import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

const CONTRACT_ADDRESS = "0x72c...a258f"; // Fill in your actual deployed GriotAirdrop contract address
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
        const claimed = await contract.hasClaimed(address);
        setHasClaimed(claimed);
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
        const amount = await contract.claimAmount();
        setClaimAmount(ethers.utils.formatEther(amount));
      })();
    }
  }, [signer, address, contract]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", () => {
        connectWallet();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or use the MetaMask browser on mobile.");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setAddress(userAddress);
      setContract(contract);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
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
    <main className="min-h-screen bg-black text-green-500 p-6 flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">🏛️ Griot Airdrop</h1>
      {!address ? (
        <Button className="bg-green-600 hover:bg-green-700" onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="break-words">Connected: {address}</p>
          {hasClaimed ? (
            <p>You’ve already claimed your {claimAmount} Griot tokens. 🎉</p>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={claiming || hasClaimed === null}
              onClick={claimTokens}
            >
              {claiming ? "Claiming..." : `Claim ${claimAmount || "your"} Griot Tokens`}
            </Button>
          )}
          {isOwner && (
            <p className="mt-4 text-sm">You are the contract owner. 🎯 Use this DApp to monitor airdrops and manage distributions.</p>
          )}
        </div>
      )}

      {!address && (
        <div className="mt-6">
          <p className="text-sm text-gray-300">
            New user? Use the MetaMask app browser to access this site. If you don’t have MetaMask, get it from the App Store or Play Store.
          </p>
        </div>
      )}
    </main>
  );
}
