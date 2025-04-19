import { useEffect, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x72c...a258f"; // Replace with your full contract address
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
    const userAddress = await signer.getAddress();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setProvider(provider);
    setSigner(signer);
    setAddress(userAddress);
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
    <div className="min-h-screen bg-black text-green-500 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">Griot Airdrop</h1>

        {!address ? (
          <button
            onClick={connectWallet}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4 text-center">
            <p className="break-words text-xs text-green-300">
              Connected: {address}
            </p>

            {hasClaimed ? (
              <p className="text-yellow-400">
                You’ve already claimed {claimAmount} Griot tokens.
              </p>
            ) : (
              <button
                onClick={claimTokens}
                disabled={claiming}
                className={`w-full ${
                  claiming
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-2 px-4 rounded-xl`}
              >
                {claiming ? "Claiming..." : `Claim ${claimAmount || "your"} Griot Tokens`}
              </button>
            )}

            {isOwner && (
              <div className="mt-4 p-3 border border-green-400 rounded-xl text-sm text-green-300">
                <p>You are the contract owner. ✯</p>
                <p>Admin tools will go here in the future.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
