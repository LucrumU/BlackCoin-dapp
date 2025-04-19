import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ArtistProfile() {
  const [walletAddress, setWalletAddress] = useState("");
  const [track, setTrack] = useState(null);
  const [trackName, setTrackName] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const connectWallet = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      alert("Connection failed: " + error.message);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    setTrack(file);
    setTrackName(file.name);
    const url = URL.createObjectURL(file);
    setUploadedUrl(url);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 p-6">
      <Image src="/black-bank-logo.png" alt="Griot Bank Logo" width={90} height={90} className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Artist Profile</h1>

      {!walletAddress ? (
        <Button onClick={connectWallet} className="bg-green-500 hover:bg-green-600">Connect Wallet</Button>
      ) : (
        <div className="w-full max-w-md text-center space-y-4">
          <p className="break-words">Connected: {walletAddress}</p>
          <label className="block text-left">Upload a Track</label>
          <input type="file" accept="audio/*" onChange={handleUpload} className="w-full bg-white text-black p-2 rounded" />
          {track && (
            <div className="mt-4">
              <p className="text-sm">Now playing: {trackName}</p>
              <audio controls src={uploadedUrl} className="w-full mt-2" />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
