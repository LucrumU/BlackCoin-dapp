import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [address, setAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setWalletConnected(true);
        setAddress(userAddress);
      } catch (err) {
        alert("Wallet connection failed.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    const checkIfWalletConnected = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setWalletConnected(true);
          setAddress(accounts[0]);
        }
      }
    };
    checkIfWalletConnected();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 p-4 text-center">
      <Image
        src="/black-bank-logo.png"
        alt="Black Bank Logo"
        width={120}
        height={120}
        className="mb-6"
      />
      <h1 className="text-3xl font-bold mb-4">Welcome to BlackCoin Music</h1>
      <p className="max-w-md mb-6">
        Discover a new kind of platform where artists own their music, fans support directly, and every click counts.
      </p>

      {!walletConnected ? (
        <button
          onClick={connectWallet}
          className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full font-semibold"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="text-sm">Wallet connected: {address}</p>
      )}
    </main>
  );
}
