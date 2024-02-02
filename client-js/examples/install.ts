import {
  CEP78Client,
  NFTOwnershipMode,
  NFTKind,
  NFTMetadataKind,
  NFTIdentifierMode,
  MetadataMutability,
  OwnerReverseLookupMode,
  MintingMode,
  WhitelistMode,
  EventsMode
} from "../src/index";

import {
  FAUCET_KEYS,
  getDeploy,
  getAccountInfo,
  getAccountNamedKeyValue,
} from "./common";

const install = async () => {
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);

  const collectionName = "Test CEP 78";
  const minter1 = "2f0a2c998661cfbaf433952a8faac21e0656861954197065e7d5716b6130bc4a"
  
  const installDeploy = await cc.install(
    {
      collectionName,
      collectionSymbol: "T78",
      totalTokenSupply: "20000",
      ownershipMode: NFTOwnershipMode.Transferable,
      nftKind: NFTKind.Digital,
      jsonSchema: {
        properties: {
          Name: { name: "Name", description: "", required: true },
          Description: { name: "Description", description: "", required: true },
          Image: { name: "Image", description: "", required: true },
          Attributes: { name: "Attributes", description: "", required: true },
        },
      },
      nftMetadataKind: NFTMetadataKind.NFT721,
      identifierMode: NFTIdentifierMode.Ordinal,
      metadataMutability: MetadataMutability.Mutable,
      mintingMode: MintingMode.Acl,
      whitelistMode : WhitelistMode.Unlocked,
      allowMinting: true,
      contractWhitelist: [minter1],
      ownerReverseLookupMode: OwnerReverseLookupMode.NoLookup,
      eventsMode: EventsMode.CES
    },
    "300000000000",
    FAUCET_KEYS.publicKey,
    [FAUCET_KEYS]
  );

  const hash = await installDeploy.send(process.env.NODE_URL!);
  //await new Promise(f => setTimeout(f, 10000));
  console.log(`... Contract installation deployHash: ${hash}`);

  await getDeploy(process.env.NODE_URL!, hash);

  console.log(`... Contract installed successfully.`);

  const accountInfo = await getAccountInfo(
    process.env.NODE_URL!,
    FAUCET_KEYS.publicKey
  );

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await getAccountNamedKeyValue(
    accountInfo,
    `cep78_contract_hash_${collectionName}`
  );

  const contractPackageHash = await getAccountNamedKeyValue(
    accountInfo,
    `cep78_contract_package_${collectionName}`
  );

  console.log("... Contract Hash:", contractHash);
  console.log("... Contract Package Hash:", contractPackageHash);
};

install();
