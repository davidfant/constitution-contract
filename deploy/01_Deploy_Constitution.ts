import { Signer } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Constitution, Constitution__factory } from "../typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const citizenNftContractAddress = '';
    const citizenNftCount = 0;

    const accounts = await hre.ethers.getSigners();
    console.log(await accounts[0].getAddress());

    const constitutionFactory = (await hre.ethers.getContractFactory(
        "Constitution",
        accounts[0]
    )) as Constitution__factory;
    const constitutionContract: Constitution = await constitutionFactory.deploy(citizenNftContractAddress, citizenNftCount);

    console.log(
        `The address the Contract WILL have once mined: ${constitutionContract.address}`
    );

    console.log(
        `The transaction that was sent to the network to deploy the Contract: ${constitutionContract.deployTransaction.hash}`
    );

    console.log(
        "The contract is NOT deployed yet; we must wait until it is mined..."
    );

    await constitutionContract.deployed();

    console.log("Minted...");
};
export default func;
func.id = "constitution_deploy";
func.tags = ["local"];
