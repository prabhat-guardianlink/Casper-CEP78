import {
  CEP78Client,
  OwnerReverseLookupMode,
  CEP47EventParserFactory,
  CESEventParserFactory,
  CEP47Events,
} from "../src/index";

import {
  FAUCET_KEYS,
  USER1_KEYS,
  USER2_KEYS,
  MINTER1_KEYS,
  getDeploy,
  getAccountInfo,
  getAccountNamedKeyValue,
  printHeader,
} from "./common";

import {
  DeployUtil,
  CLPublicKey,
  EventStream,
  EventName,
  CLValueParsers,
  CLTypeTag,
  CLMap,
  CLList,
  CLValue,
  CLKey,
  CLValueBuilder,
  CasperServiceByJsonRPC,
  CLAccountHash,
  CLByteArrayBytesParser,
  CLByteArray
} from "casper-js-sdk";

const { NODE_URL, EVENT_STREAM_ADDRESS } = process.env;

const runDeployFlow = async (deploy: DeployUtil.Deploy) => {
  const deployHash = await deploy.send(NODE_URL!);

  console.log("...... Deploy hash: ", deployHash);
  console.log("...... Waiting for the deploy...");

  await getDeploy(NODE_URL!, deployHash);

  console.log(`...... Deploy ${deployHash} succedeed`);
};

const run = async () => {
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);

  const printTokenDetails = async (id: string, pk: CLPublicKey) => {
    const ownerOfToken = await cc.getOwnerOf(id);
    console.log(`> Owner of token ${id} is ${ownerOfToken}`);

    const ownerBalance = await cc.getBalanceOf(pk);
    console.log(`> Account ${pk.toAccountHashStr()} balance ${ownerBalance}`);

    const metadataOfZero = await cc.getMetadataOf(id);
    console.log(`> Token ${id} metadata`, metadataOfZero);
  };

  let accountInfo = await getAccountInfo(NODE_URL!, FAUCET_KEYS.publicKey);

  console.log(`\n=====================================\n`);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = "hash-3a3d74cd74858ba8d992d8d5effa481163fb2e8a1b620bfbbab66b12dc47d621"

  const contractPackageHash = "hash-1eb271f4633e1c247707927e6849920dbf8c2fece77d2b26906b99d4ccdbaa6a"

  console.log(`... Contract Hash: ${contractHash}`);
  console.log(`... Contract Package Hash: ${contractPackageHash}`);

  await cc.setContractHash(contractHash, undefined);

  console.log(`\n=====================================\n`);

  const allowMintingSetting = await cc.getAllowMintingConfig();
  console.log(`AllowMintingSetting: ${allowMintingSetting}`);

  const burnModeSetting = await cc.getBurnModeConfig();
  console.log(`BurnModeSetting: ${burnModeSetting}`);

  const holderModeSetting = await cc.getHolderModeConfig();
  console.log(`HolderModeSetting: ${holderModeSetting}`);

  const identifierModeSetting = await cc.getIdentifierModeConfig();
  console.log(`IdentifierModeSetting: ${identifierModeSetting}`);

  const whitelistModeSetting = await cc.getWhitelistModeConfig();
  console.log(`WhitelistMode: ${whitelistModeSetting}`);

  const ownerReverseLookupModeSetting = await cc.getReportingModeConfig();
  console.log(`OwnerReverseLookupMode: ${ownerReverseLookupModeSetting}`);

  const useSessionCode = false

  const JSONSetting = await cc.getJSONSchemaConfig();

  const cep47EventParser = CEP47EventParserFactory({
    contractPackageHash,
    eventNames: [
      CEP47Events.Mint,
      CEP47Events.Transfer,
      CEP47Events.Burn
    ],
  });

  const casperClient = new CasperServiceByJsonRPC(NODE_URL!);
  const cesEventParser = CESEventParserFactory({
    contractHashes: [contractHash],
    casperClient,
  });

  const es = new EventStream(EVENT_STREAM_ADDRESS!);

  es.subscribe(EventName.DeployProcessed, async (event) => {
    const parsedEvents = await cesEventParser(event); //cep47EventParser(event);

    if (parsedEvents?.success) {
      console.log("*** EVENT ***");
      console.log(parsedEvents.data);
      console.log("*** ***");
    } else {
      console.log("*** EVENT NOT RELATED TO WATCHED CONTRACT ***");
    }
  });
  es.start();

  /* const hexString1 =
  "0112634b1843c6103ff05aa4f1f97109d71ab6c29d8f6615256c3f9049f35b02bf";
  const myHash1 = new CLAccountHash(
  CLPublicKey.fromHex(hexString1).toAccountHash()
  );
  console.log(myHash1.data);
  const key1= new CLKey(myHash1);

  const ACCOUNT_PUBKEYS = new CLList([key1]); */

  /* WhiteList */
  /*  printHeader("ACLWhitelist");
  const aclWhiteist = cc.setVariables(
    {
      allowMinting: true,
      contractWhitelist: [FAUCET_KEYS.toString()]
    },
    "500000000",
    FAUCET_KEYS.publicKey,
    [FAUCET_KEYS]
  )
  await runDeployFlow(aclWhiteist);  */


  /* Mint */
  const tokenArr = [
    "https://6bmtadx3bmzhhgqnexaet44fydkhqsz6lfngbr5u6vithe2ttrcq.arweave.net/8FkwDvsLMnOaDSXASfOFwNR4Sz5ZWmDHtPVRM5NTnEU",
    "https://t7klkpt4osee3bz4ydhuqb3kxvjenv2q72qpe22p4yagqnuyqgma.arweave.net/n9S1Pnx0iE2HPMDPSAdqvVJG11D-oPJrT-YAaDaYgZg",
    "https://d6kepczvz4s6z7gm2mbnhncvm4iibjlog2osprpmkqsoepbsfr5q.arweave.net/H5RHizXPJez8zNMC07RVZxCApW42nSfF7FQk4jwyLHs"
    ]
  //for (let x =0; x <=10; x++){
  printHeader("Mint");

  const mintDeploy = cc.mint(
      {
        owner: USER1_KEYS.publicKey,
        meta: {
          name: "Test CEP 78",
          symbol: "T78",
          token_uri: "https://pkjbdla3wjstteb6i7mszlvnvawmvntwmiilrxtjdl45aw7hwmra.arweave.net/epIRrBuyZTmQPkfZLK6tqCzKtnZiELjeaRr50FvnsyI",
        },
        collectionName: "Test CEP 78",
      },
      { useSessionCode },
      "1000000000",
      MINTER1_KEYS.publicKey,
      [MINTER1_KEYS]
    );
  await runDeployFlow(mintDeploy);

    /* Token details */
   /*  await printTokenDetails(x.toString(), USER1_KEYS.publicKey);
  } */

  /* approve */
  printHeader("Approve");

  // CLPublicKey.fromHex('hash-1e4578fb0d20dae6a6db82b6aa8ac3c136e32ab4cde8f29bf80d39a468b0cfb6')

  const marketContractPackageHash = "8abd9f85c7be87aea6e15841e2b2f0b8eaadd4568acd2446613b4140d7f600a6";

  const hex = Uint8Array.from(Buffer.from(marketContractPackageHash.replace('hash-', ''), "hex"));
  const contract_hash = new CLKey(new CLByteArray(hex));

  /* const approveDeploy = cc.approve(
    {
      tokenId: "0",
      tokenHash:"hash-28e99209831ea0769647c73234ed4f403199df180f4a8f4ce021ecadc791bdd2",
      operator: contract_hash.value()
    },
    "20000000000",
    FAUCET_KEYS.publicKey,
    [FAUCET_KEYS]
  );

  await runDeployFlow(approveDeploy); 

  printHeader("Burn");

    const burnDeploy = cc.burn(
      { tokenId: "2" },
      "10000000000",
      USER1_KEYS.publicKey,
      [USER1_KEYS]
    );
    await runDeployFlow(burnDeploy); 
     */
    
    //printHeader("Transfer");
 
    /* const transferDeploy = cc.transfer(
      {
        tokenId: "0",
        source: USER1_KEYS.publicKey,
        target: FAUCET_KEYS.publicKey,
      },
      { useSessionCode },
      "20000000000",
      USER1_KEYS.publicKey,
      [USER1_KEYS]
    );
  
    await runDeployFlow(transferDeploy) */


  if (useSessionCode) {
    /* Register */
    printHeader("Register");

    const registerDeployTwo = cc.register(
      {
        tokenOwner: USER2_KEYS.publicKey,
      },
      "1000000000",
      USER2_KEYS.publicKey,
      [USER2_KEYS]
    );

    await runDeployFlow(registerDeployTwo);
  }
 
    /* Transfer */
   printHeader("Transfer");
 
   /* const transferDeploy = cc.transfer(
     {
       tokenId: "0",
       source: MINTER1_KEYS.publicKey,
       target: FAUCET_KEYS.publicKey,
     },
     { useSessionCode },
     "20000000000",
     MINTER1_KEYS.publicKey,
     [MINTER1_KEYS]
   ); */
 
   //await runDeployFlow(transferDeploy); 

    /* Token details */
    await printTokenDetails("0", USER1_KEYS.publicKey);

    /* Store owner of at account named key */
    printHeader("Store owner of");

    const storeOwnerOfDeploy = cc.storeOwnerOf(
      {
        keyName: "stored_owner_of_token",
        tokenId: "0",
      },
      "35000000000",
      FAUCET_KEYS.publicKey,
      [FAUCET_KEYS]
    );
  
    await runDeployFlow(storeOwnerOfDeploy); 
    
    // Getting new account info to update namedKeys
    accountInfo = await getAccountInfo(NODE_URL!, FAUCET_KEYS.publicKey);
  
    const storedOwnerValue = await getAccountNamedKeyValue(
      accountInfo,
      `stored_owner_of_token`
    );
  
    console.log(".. storedOwnerValue UREF: ", storedOwnerValue); 

    /* Burn */
    /* printHeader("Burn");

    const burnDeploy = cc.burn(
      { tokenId: "0" },
      "13000000000",
      USER1_KEYS.publicKey,
      [USER1_KEYS]
    );
    await runDeployFlow(burnDeploy);  */

  };


run();
