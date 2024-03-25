'use client'

import { useState } from 'react';
import { ethers } from 'ethers';
import XADS from "../abi/XADS.json";

export default function Home() {
  const [userAddress, setUserAddress] = useState("");
  const [isUser, setIsUser] = useState(false);

  const fetchData = async (userAddress: any) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://optimism-sepolia.blockpi.network/v1/rpc/public'); // replace required provider 
      const contract = new ethers.Contract(
        "0x23e7ff17f7F391eD097C0817F137C085fC6f44A4", // replace your contract address 
        XADS.abi, // replace the contract abi 
        provider 
      );
      const user = await contract.users(userAddress);

      // Update states
      if (user !== '0x0000000000000000000000000000000000000000') setIsUser(true);
      else setIsUser(false);

      console.log(user, isUser);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const networkId = await window.ethereum.request({ method: 'net_version' });

      if (networkId !== '11155420') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa37dc' }]
        });
      }
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
        fetchData(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const writeFunction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        "0x23e7ff17f7F391eD097C0817F137C085fC6f44A4",
        XADS.abi,
        signer
      );

      const gasLimit = 300000; 
      const gasPrice = ethers.utils.parseUnits('100', 'gwei'); 
  
      const overrides = {
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        value: 0
      };
      await contract.signUpAndCollect(overrides);
      console.log('Function called successfully');
    } catch (error) {
      console.error('Error calling function:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className='text-xl'><b>Is User:</b> {isUser ? "true" : "false"}</h1>
        {userAddress
          ? <p>{userAddress}</p>
          : <button className='bg-white px-5 py-3 text-black' onClick={connectWallet}>Connect Wallet</button>
        }
      </div>
      <div className='mt-5'>
      {userAddress
          ? <button className='bg-white px-5 py-3 text-black' onClick={writeFunction}>Sign Up</button>
          : null
        }
      </div>
    </main>
  );
}
