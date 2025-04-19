const contractAddress = "0xa1f222a5503be486d9d46b3e77ef83cba8c6f5ff";
const abi = [
  {
    "inputs": [],
    "name": "claimAirdrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let provider;
let signer;
let contract;

async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);

      const address = await signer.getAddress();
      document.getElementById("wallet-address").innerText = `Wallet: ${address}`;
    } catch (err) {
      console.error("Connection error:", err);
    }
  } else {
    alert("Please install MetaMask.");
  }
}

async function claimTokens() {
  if (!contract) return alert("Connect wallet first!");

  try {
    const tx = await contract.claimAirdrop();
    document.getElementById("status").innerText = "Claiming tokens...";
    await tx.wait();
    document.getElementById("status").innerText = "Tokens claimed successfully!";
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Error claiming tokens.";
  }
}
