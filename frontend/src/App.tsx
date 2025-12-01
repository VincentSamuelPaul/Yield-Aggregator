import { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './App.css';

// REPLACE WITH YOUR DEPLOYED ADDRESS AFTER RUNNING DEPLOY SCRIPT
const VAULT_ADDRESS = "0x30Cd4faC30d1E4b73b8179aab4fBc009C907E024"; // Fixed harvest + borrow
const WETH_ADDRESS = "0xc558dbdd856501fcd9aaf1e62eae57a9f0629a3c";

const WETH_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256)",
  "function allowance(address, address) view returns (uint256)"
];

const VAULT_ABI = [
  "function deposit() payable",
  "function withdraw(uint256)",
  "function borrow(uint256)",
  "function repay(uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalBorrowed() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function borrowed(address) view returns (uint256)",
  "function strategy() view returns (address)"
];

const STRATEGY_ABI = [
  "function balanceOf() view returns (uint256)",
  "function harvest()"
];

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [vault, setVault] = useState<ethers.Contract | null>(null);
  const [weth, setWeth] = useState<ethers.Contract | null>(null);
  const [strategy, setStrategy] = useState<ethers.Contract | null>(null);

  // Vault Stats
  const [totalAssets, setTotalAssets] = useState<bigint>(0n);
  const [totalBorrowed, setTotalBorrowed] = useState<bigint>(0n);
  const [strategyBalance, setStrategyBalance] = useState<bigint>(0n);
  const [shares, setShares] = useState<bigint>(0n);
  const [borrowed, setBorrowed] = useState<bigint>(0n);

  // User Balances
  const [ethBalance, setEthBalance] = useState<bigint>(0n);
  const [wethBalance, setWethBalance] = useState<bigint>(0n);

  // Inputs
  const [depositAmount, setDepositAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  // UI State
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Auto-connect
      provider.send("eth_accounts", []).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (account && provider) {
      const signer = async () => {
        const s = await provider.getSigner();
        const v = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, s);
        const w = new ethers.Contract(WETH_ADDRESS, WETH_ABI, s);
        setVault(v);
        setWeth(w);

        // Get strategy address
        try {
          const strategyAddr = await v.strategy();
          if (strategyAddr && strategyAddr !== ethers.ZeroAddress) {
            const st = new ethers.Contract(strategyAddr, STRATEGY_ABI, s);
            setStrategy(st);
            fetchData(v, w, st, s.address);
          } else {
            fetchData(v, w, null, s.address);
          }
        } catch (e) {
          console.error("Failed to get strategy", e);
          fetchData(v, w, null, s.address);
        }
      };
      signer();
    }
  }, [account, provider]);

  const fetchData = async (v: ethers.Contract, w: ethers.Contract, st: ethers.Contract | null, address: string) => {
    console.log("Fetching data for:", address);
    try {
      // Fetch individually to identify failures
      const assets = await v.totalAssets().catch((e: any) => { console.error("Failed totalAssets", e); return 0n; });
      const borrowedTotal = await v.totalBorrowed().catch((e: any) => { console.error("Failed totalBorrowed", e); return 0n; });
      const userShares = await v.balanceOf(address).catch((e: any) => { console.error("Failed balanceOf", e); return 0n; });
      const userBorrowed = await v.borrowed(address).catch((e: any) => { console.error("Failed borrowed", e); return 0n; });
      const userEth = await provider!.getBalance(address).catch((e: any) => { console.error("Failed getBalance", e); return 0n; });
      const userWeth = await w.balanceOf(address).catch((e: any) => { console.error("Failed weth.balanceOf", e); return 0n; });

      let stratBal = 0n;
      if (st) {
        stratBal = await st.balanceOf().catch((e: any) => { console.error("Failed strategy.balanceOf", e); return 0n; });
      }

      console.log("Data fetched:", { assets, borrowedTotal, userShares, userBorrowed, userEth, userWeth, stratBal });

      setTotalAssets(assets);
      setTotalBorrowed(borrowedTotal);
      setStrategyBalance(stratBal);
      setShares(userShares);
      setBorrowed(userBorrowed);
      setEthBalance(userEth);
      setWethBalance(userWeth);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleTx = async (action: () => Promise<ethers.ContractTransactionResponse>) => {
    setIsPending(true);
    setIsConfirmed(false);
    try {
      const tx = await action();
      setIsPending(false);
      setIsConfirming(true);
      await tx.wait();
      setIsConfirming(false);
      setIsConfirmed(true);
      if (vault && weth && account) fetchData(vault, weth, strategy, account);
      setTimeout(() => setIsConfirmed(false), 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  const handleDeposit = () => {
    if (!vault || !depositAmount) return;
    handleTx(() => vault.deposit({ value: parseEther(depositAmount) }));
  };

  const handleWithdraw = () => {
    if (!vault || !shares) return;
    handleTx(() => vault.withdraw(shares));
  };

  const handleBorrow = () => {
    if (!vault || !borrowAmount) return;
    handleTx(() => vault.borrow(parseEther(borrowAmount)));
  };

  const handleRepay = async () => {
    if (!vault || !weth || !repayAmount) return;
    const amount = parseEther(repayAmount);

    setIsPending(true);
    try {
      // Approve first
      const approveTx = await weth.approve(VAULT_ADDRESS, amount);
      await approveTx.wait();

      // Then repay
      handleTx(() => vault.repay(amount));
    } catch (error) {
      console.error("Repay failed:", error);
      setIsPending(false);
    }
  };

  const handleHarvest = () => {
    if (!strategy) return;
    handleTx(() => strategy.harvest());
  };

  // Chart Data
  const availableLiquidity = totalAssets && totalBorrowed ? totalAssets - totalBorrowed : 0n;
  const utilizationRate = totalAssets && totalBorrowed && totalAssets > 0n
    ? (Number(totalBorrowed) * 100) / Number(totalAssets)
    : 0;

  // Chart now shows: Borrowed vs Strategy vs Idle
  // But wait, totalAssets = weth + borrowed + strategy
  // availableLiquidity (in Vault) = weth.balanceOf(vault)
  // So we have 3 components:
  // 1. Borrowed
  // 2. Strategy (Invested)
  // 3. Idle (In Vault)

  // Let's calculate Idle
  const idleLiquidity = totalAssets - totalBorrowed - strategyBalance;

  const chartData = [
    { name: 'Borrowed', value: Number(formatEther(totalBorrowed)) },
    { name: 'Strategy', value: Number(formatEther(strategyBalance)) },
    { name: 'Idle', value: Number(formatEther(idleLiquidity)) },
  ];

  const COLORS = ['#ffffff', '#888888', '#444444'];

  return (
    <div className="container">
      {/* Header Section */}
      <div className="header-section">
        <h1>Yield Aggregator</h1>
        {!account ? (
          <button onClick={connectWallet} className="connect-btn">Connect Wallet</button>
        ) : (
          <div className="status success">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Vault Health */}
        <div className="card">
          <div className="card-header">
            <h2>Vault Health</h2>
            <button
              onClick={() => {
                if (vault && weth && account) fetchData(vault, weth, strategy, account);
              }}
              className="refresh-btn"
              disabled={isPending || isConfirming}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '14px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-row">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">{totalAssets ? formatEther(totalAssets) : '0'} ETH</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Strategy Balance</span>
            <span className="stat-value">{formatEther(strategyBalance)} ETH</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Idle Liquidity</span>
            <span className="stat-value">{formatEther(idleLiquidity)} ETH</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Borrowed</span>
            <span className="stat-value">{totalBorrowed ? formatEther(totalBorrowed) : '0'} WETH</span>
          </div>

          {strategy && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleHarvest}
                disabled={isPending || isConfirming}
                style={{ width: '100%', color: 'white' }}
              >
                Harvest Yield (Simulate 5%)
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={async () => {
                    if (!strategy || !account || !provider) return;
                    // Calculate needed funding: Strategy Balance - WETH Balance of Strategy
                    // But we can't easily see WETH balance of strategy from here without a contract call.
                    // Let's just fund a fixed amount or ask user.
                    // For simplicity, let's fund 0.01 ETH which covers a small yield.
                    const amount = parseEther("0.01");

                    setIsPending(true);
                    try {
                      const signer = await provider.getSigner();
                      const tx = await signer.sendTransaction({
                        to: await strategy.getAddress(),
                        value: amount
                      });
                      await tx.wait();
                      setIsConfirmed(true);
                      setTimeout(() => setIsConfirmed(false), 3000);
                      if (vault && weth && account) fetchData(vault, weth, strategy, account);
                    } catch (e) {
                      console.error("Funding failed", e);
                    } finally {
                      setIsPending(false);
                    }
                  }}
                  disabled={isPending || isConfirming}
                  className="secondary-btn"
                  style={{ flex: 1, background: '#2c3e50', color: 'white' }}
                >
                  Fund Reward Pool (0.01 ETH)
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                * Required to withdraw simulated profit
              </p>
            </div>
          )}
        </div>

        {/* Right Column - User Actions */}
        <div className="actions-column">

          {/* Lender Actions Card */}
          <div className="card">
            <h2>Lender Actions</h2>
            <div className="stat-row">
              <span className="stat-label">Your Shares</span>
              <span className="stat-value">{shares ? formatEther(shares) : '0'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Wallet ETH</span>
              <span className="stat-value">{ethBalance ? formatEther(ethBalance) : '0'}</span>
            </div>

            <div className="input-group" style={{ marginTop: '20px', color: 'white' }}>
              <input
                type="number"
                placeholder="Amount in ETH"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button onClick={handleDeposit} disabled={isPending || isConfirming} style={{ color: 'white' }}>
                Deposit
              </button>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={isPending || isConfirming || shares === 0n}
              style={{ width: '100%', color: 'white' }}
            >
              Withdraw All Shares
            </button>
          </div>

          {/* Borrower Actions Card */}
          <div className="card">
            <h2>Borrower Actions</h2>
            <div className="stat-row">
              <span className="stat-label">Your Debt</span>
              <span className="stat-value">{borrowed ? formatEther(borrowed) : '0'} WETH</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Wallet WETH</span>
              <span className="stat-value">{wethBalance ? formatEther(wethBalance) : '0'}</span>
            </div>

            <div className="input-group" style={{ marginTop: '20px', color: 'white' }}>
              <input
                type="number"
                placeholder="Amount in WETH"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
              />
              <button onClick={handleBorrow} disabled={isPending || isConfirming} style={{ color: 'white' }}>
                Borrow
              </button>
            </div>
            <p className="fee-notice">
              Fee: 10% (added to debt)
            </p>

            <div className="input-group">
              <input
                type="number"
                placeholder="Repay Amount"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
              />
              <button onClick={handleRepay} disabled={isPending || isConfirming} style={{ color: 'white' }}>
                Approve & Repay
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Transaction Status - Fixed Position */}
      {
        (isPending || isConfirming || isConfirmed) && (
          <div className="tx-status-container">
            {isPending && <div className="status">Transaction Pending...</div>}
            {isConfirming && <div className="status">Confirming...</div>}
            {isConfirmed && <div className="status success">Transaction Confirmed!</div>}
          </div>
        )
      }
    </div >
  );
}

export default App;
