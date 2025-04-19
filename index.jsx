import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const CONTRACT_ADDRESS = "0x72c...a258f"; // Replace with full GriotAirdrop contract address
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !window.ethereum) {
      window.location.href = "https://metamask.app.link/dapp/blackcoin-dapp.netlify.app";
    }
  }, []);

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
      <Image src="/black-bank-logo.png" alt="Griot Bank Logo" width={100} height={100} className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">Griot Airdrop</h1>

      {!address ? (
        <Button onClick={connectWallet} className="bg-green-500 hover:bg-green-600">Connect Wallet</Button>
      ) : (
        <div className="text-center space-y-4">
          <p>Connected: {address}</p>
          {hasClaimed ? (
            <p>You’ve already claimed your {claimAmount} Griot tokens.</p>
          ) : (
            <Button onClick={claimTokens} disabled={claiming} className="bg-green-500 hover:bg-green-600">
              {claiming ? "Claiming..." : `Claim ${claimAmount || "your"} Griot Tokens`}
            </Button>
          )}

          {isOwner && (
            <div className="mt-4">
              <p>You are the contract owner. 🎯</p>
              <p className="text-sm">Monitor or manage your drop here.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
