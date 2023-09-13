import { useState } from 'react';
import { ethers } from 'ethers';
import {Buffer} from 'buffer';
import { Row, Form, Button } from 'react-bootstrap';
import { create } from 'ipfs-http-client';
const INFURA_ID = '2VLsbcj7RQw0I1YkMv0l7RfNcUm';
const INFURA_SECRET_KEY = '1170cc655662bce32e17d5ca8a9e85ec';
const auth =
    'Basic ' + Buffer.from(INFURA_ID + ':' + INFURA_SECRET_KEY).toString('base64');
const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const Create = ({ marketplace, nft }) => {
    const [image, setImage] = useState('');
    const [price, setPrice] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const uploadToIPFS = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file);
                console.log(result);
                const url = `https://petadoption.infura-ipfs.io/ipfs/${result.path}`
                setImage(`${url}`);
            } catch (error) {
                console.log("ipfs image upload error: ", error);
            }
        }
    }
    const createNFT = async () => {
        if (!image || !price || !name || !description) return
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }));
            mintThenList(result);
        } catch (error) {
            console.log("ipfs uri uload error: ", error);
        }
    }
    const mintThenList = async (result) => {
        const uri = `https://petadoption.infura-ipfs.io/ipfs/${result.path}`
        await (await nft.mint(uri)).wait();
        const id = await nft.tokenCount();
        debugger;
        await (await nft.setApprovalForAll(marketplace.target, true));
        const listingPrice = ethers.parseEther(price.toString());
        await (await marketplace.makeItem(nft.target, id, listingPrice)).wait();
    }

    return (
        <div className="container-fluid mt-5">
            <div className='row'>
                <main role="main" className='col-lg-12 mx-auto' style={{ maxWidth: '1000px' }}>
                    <div className='content mx-auto'>
                        <Row className='g-4'>
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS} />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description"/>
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder='Price (ETH)' />
                            <div className='g-grid px-0'>
                                <Button onClick={createNFT} variant="primary" size="lg">
                                    Create and list NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create;