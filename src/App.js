import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Navigation from './components/Navbar';
import Home from './components/Home';
import Create from './components/Create';
import MyListedItems from './components/MyListedItems';
import MyPurchases from './components/MyPurchases';

import { contractAddressNFT, contractAddressMarketPlace } from './address';
import MarketplaceAbi from './contracts/Marketplace.json';
import NFTAbi from './contracts/NFT.json';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import './App.css';

const HARDHAT_NETWORK_ID = Number(process.env.REACT_APP_NETWORK_ID);

function App() {

  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [nft, setNFT] = useState(undefined);
  const [marketplace, setMarketplace] = useState(undefined);

  async function connectWallet() {
    try {
      const [address] = await window.ethereum.request({method: "eth_requestAccounts"});
      await checkNetwork();
      await initiliazeDapp(address);

      window.ethereum.on("accountsChanged", async ([newAddress]) => {
        if (newAddress === undefined) {
          setSelectedAddress(undefined);
          setNFT(undefined);
          setMarketplace(undefined);
          return;
        }

        await initiliazeDapp(newAddress);
      });

    } catch (error) {
      console.error(error.message);
    }
  }

  async function initiliazeDapp(address) {
    setSelectedAddress(address);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(0);
    await initContractNFT(signer);
    await initContractMarketplace(signer);
  }

  async function initContractNFT(signer) {
    const nft = new ethers.Contract(contractAddressNFT.address, NFTAbi.abi, signer);
    console.log("NFT", nft)
    setNFT(nft);
    return nft;
  }

  async function initContractMarketplace(signer) {
    const marketplace = new ethers.Contract(
      contractAddressMarketPlace.address, 
      MarketplaceAbi.abi, 
      signer
    );
    
    console.log("Market", marketplace)
    setMarketplace(marketplace);
    setLoading(false);
    return marketplace;
  }

  async function switchNetwork() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`;

    return await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{chainId: chainIdHex}]
    });
  }

  async function checkNetwork() {
    console.log(window.ethereum.networkVersion)
    console.log(HARDHAT_NETWORK_ID.toString())
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID.toString()) {
      return switchNetwork();
    }

    return null;
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <>
          <Navigation connect={connectWallet} account={selectedAddress} />
        </>
        {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh'
            }}>
              <Spinner animation='border' style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Waiting for Metamask's connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft} />
              } />

              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft} />
              } />

              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={selectedAddress} />
              } />

              <Route path="/my-purchases" element={
                <MyPurchases marketplace={marketplace} nft={nft} account={selectedAddress}/>
              } />
            </Routes>
          )}
      </div>
    </BrowserRouter>
  );
}

export default App;
