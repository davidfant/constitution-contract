import { expect } from "chai";
import { Signer } from "ethers";
import { deployments, ethers } from "hardhat";

import { Constitution, CitizenNFT, Constitution__factory, CitizenNFT__factory } from "../typechain";

describe("Constitution", function () {
    let accounts: Signer[];
    let constitutionContract: Constitution;
    let citizenNftContract: CitizenNFT;

    const nftCount = 1000;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        const citizenNftFactory = (await ethers.getContractFactory(
            "CitizenNFT",
            accounts[0]
        )) as CitizenNFT__factory;
        citizenNftContract = await citizenNftFactory.deploy();

        const constitutionFactory = (await ethers.getContractFactory(
            "Constitution",
            accounts[0]
        )) as Constitution__factory;
        constitutionContract = await constitutionFactory.deploy(citizenNftContract.address, nftCount);
    });

    it("should return an empty constitution", async () => {
        expect(await constitutionContract.getConstitution()).to.equal("");
    });

    it("should allow voting", async () => {
        const ipfsHash = "some ipfs hash";
        await constitutionContract.voteFor(ipfsHash);
        expect(await constitutionContract.getVote()).to.equal(ipfsHash);
    });

    describe("amend", async () => {
        it("should fail if has less than 50% of votes", async () => {
            const voterAddress = await accounts[0].getAddress();
            const ipfsHash = "some ipfs hash";

            await citizenNftContract.issueNewCitizenships(voterAddress, 42, Math.round(nftCount / 2)); // 50%
            await constitutionContract.voteFor(ipfsHash, { from: voterAddress });
            await expect(constitutionContract.amend(ipfsHash)).to.be.revertedWith("Not enough votes");
            expect(await constitutionContract.getConstitution()).to.equal("");
        });

        it("should update constitution if has more than 51% of votes", async () => {
            const voterAddress = await accounts[0].getAddress();
            const ipfsHash = "some ipfs hash";

            await citizenNftContract.issueNewCitizenships(voterAddress, 42, Math.round(nftCount / 2 + 1)); // > 50%
            await constitutionContract.voteFor(ipfsHash, { from: voterAddress });
            await constitutionContract.amend(ipfsHash);
            expect(await constitutionContract.getConstitution()).to.equal(ipfsHash);
        });
    });
});
