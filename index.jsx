import { useEffect, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x72c...a258f"; // Replace with your full deployed GriotAirdrop contract address
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
      alert("Wallet connection failed: " + err.message);
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
    <main className="min-h-screen bg-black text-green-400 p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Griot Airdrop</h1>

        {!address ? (
          <button onClick={connectWallet} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">Connect Wallet</button>
        ) : (
          <div>
            <p className="mb-2 text-sm">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>

            {hasClaimed ? (
              <p className="bg-green-900 text-green-300 p-4 rounded-xl font-medium">
                ✅ You already claimed {claimAmount} Griot tokens.
              </p>
            ) : (
              <button onClick={claimTokens} disabled={claiming} className={`w-full py-3 mt-4 font-semibold rounded-xl ${claiming ? 'bg-green-900 text-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                {claiming ? "Claiming..." : `Claim ${claimAmount || 'your'} Griot Tokens`}
              </button>
            )}

            {isOwner && (
              <div className="mt-6 text-sm text-green-300">
                🛡️ You are the contract owner. Monitor and manage the drop here soon.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
