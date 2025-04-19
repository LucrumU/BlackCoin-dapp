import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Tailwind UI or your custom button component

const CONTRACT_ADDRESS = "0x72C55723276dE8Ad657f967f31b58E7A531a258f"; // GriotAirdrop Contract
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

  // Mobile redirect to MetaMask
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !window.ethereum) {
      window.location.href = "https://metamask.app.link/dapp/blackcoin-dapp.netlify.app";
    }
  }, []);

  // Setup contract details once wallet connects
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

  // Connect wallet
  const connectWallet = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setContract(contract);
    } catch (err) {
      alert("Failed to connect wallet: " + err.message);
    }
  };

  // Claim tokens
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 p-4">
      <Image
        src="/black-bank-logo.png"
        alt="Griot Bank Logo"
        width={100}
        height={100}
        className="mb-4 rounded-xl"
      />
      <h1 className="text-3xl font-bold mb-6">Griot Airdrop</h1>

      {!address ? (
        <Button onClick={connectWallet} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Connect Wallet
        </Button>
      ) : (
        <div className="text-center space-y-4">
          <p className="break-words">Connected: {address}</p>
          {hasClaimed ? (
            <p className="text-green-400 font-medium">
              ✅ You’ve already claimed your {claimAmount} Griot tokens.
            </p>
          ) : (
            <Button
              onClick={claimTokens}
              disabled={claiming}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              {claiming ? "Claiming..." : `Claim ${claimAmount || "your"} Griot Tokens`}
            </Button>
          )}

          {isOwner && (
            <div className="mt-4">
              <p className="font-semibold">🎯 You are the contract owner.</p>
              <p className="text-sm">Monitor or manage your drop here.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
