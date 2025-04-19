
const tokenAddress = "0xd4377067d66355EaaCa05ea319CBaf261adf102a";
const stakingAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const abi = [
  "function stake(uint256 amount) public",
  "function unstake() public",
  "function claimReward() public",
  "function balanceOf(address) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)"
];

let signer, contract, token;

document.getElementById("connect").onclick = async function() {
  if (!window.ethereum) return alert("Install MetaMask!");

  await ethereum.request({"method": "eth_requestAccounts"});
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  const address = await signer.getAddress();

  document.getElementById("walletAddress").innerText = "Connected: " + address;

  contract = new ethers.Contract(stakingAddress, abi, signer);
  token = new ethers.Contract(tokenAddress, abi, signer);
};

document.getElementById("stake").onclick = async function() {
  const amount = document.getElementById("stakeAmount").value;
  const weiAmount = ethers.utils.parseUnits(amount, 18);

  document.getElementById("status").innerText = "Approving...";
  await token.approve(stakingAddress, weiAmount);

  document.getElementById("status").innerText = "Staking...";
  await contract.stake(weiAmount);

  document.getElementById("status").innerText = "✅ Staked!";
};

document.getElementById("unstake").onclick = async function() {
  document.getElementById("status").innerText = "Unstaking...";
  await contract.unstake();
  document.getElementById("status").innerText = "✅ Unstaked!";
};

document.getElementById("claim").onclick = async function() {
  document.getElementById("status").innerText = "Claiming...";
  await contract.claimReward();
  document.getElementById("status").innerText = "✅ Rewards Claimed!";
};
