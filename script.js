const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const claimBtn = document.getElementById("claimBtn");
const claimStatus = document.getElementById("claimStatus");

let accounts;

// Black Coin contract address (already deployed)
const blackCoinAddress = "0xd4377067d66355EaaCa05ea319CBaf261adf102a";

// Example Griots airdrop contract (you’ll replace this with your claim logic later)
let claimedWallets = new Set();

connectBtn.onclick = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      walletAddress.innerText = `Connected: ${accounts[0]}`;
    } catch (error) {
      walletAddress.innerText = "Connection denied.";
    }
  } else {
    walletAddress.innerText = "MetaMask not found. Install it to continue.";
  }
};

claimBtn.onclick = () => {
  if (!accounts || accounts.length === 0) {
    claimStatus.innerText = "Connect wallet first!";
    return;
  }

  const user = accounts[0].toLowerCase();

  if (claimedWallets.has(user)) {
    claimStatus.innerText = "You’ve already claimed your free Griots.";
  } else {
    claimedWallets.add(user);
    claimStatus.innerText = "🎉 Success! Griots have been sent (simulated).";
    // This is where you'd trigger a smart contract call or backend airdrop
  }
};
