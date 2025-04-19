import { useEffect, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x72c...a258f"; // Use full contract address
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
    <div className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Griot Airdrop</h1>

      {!address ? (
        <button
          onClick={connectWallet}
          className="bg-green-500 text-black px-6 py-3 rounded-2xl font-bold hover:bg-green-600 transition"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 text-center space-y-4">
          <p className="break-all text-sm">Connected: {address}</p>

          {hasClaimed ? (
            <p className="text-green-300">
              You’ve already claimed your {claimAmount} Griot tokens.
            </p>
          ) : (
            <button
              onClick={claimTokens}
              disabled={claiming}
              className={`w-full py-3 rounded-xl text-black font-bold transition ${claiming ? "bg-gray-600" : "bg-green-500 hover:bg-green-600"}`}
            >
              {claiming ? "Claiming..." : `Claim ${claimAmount || "your"} Griot Tokens`}
            </button>
          )}

          {isOwner && (
            <div className="mt-4 p-3 bg-gray-800 rounded-xl border border-green-500">
              <p className="text-xs text-green-400">
                You are the contract owner. Monitor and manage the drop here in the future.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
