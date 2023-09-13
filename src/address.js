export const contractAddressNFT = process.env.NODE_ENV === "development" ? 
    require('./contracts/NFT-address.json') : 
    require('./contracts/contract-address-mumbai.json'); 

export const contractAddressMarketPlace = process.env.NODE_ENV === "development" ? 
    require('./contracts/Marketplace-address.json') : 
    require('./contracts/contract-address-mumbai.json'); 