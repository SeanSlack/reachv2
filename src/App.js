import React, { useEffect, useState } from "react";
import Wrapper from "./components/views/Wrapper";
import Main from './components/views/Main';
import {GroupBox, CreateGroup, JoinGroup, ConnectWallet} from './components/views/Groups';
import {MessageInput,ChatWindow,MessageList} from './components/views/Chat';
import { InputGroupID, JoinWindow } from "./components/views/Join";
import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';

const reach = loadStdlib({
  REACH_CONNECTOR_MODE: "ALGO",
  REACH_DEBUG: "YES",
});
const {standardUnit} = reach;
let acc = {};
let stdlib = {};
let addr;
let bal;
let balAtomic;
let ctc = {};
let groupID;
let MessengerApi = {};
let isOptedIn;

reach.setWalletFallback(reach.walletFallback({
  providerEnv: {
    ALGO_TOKEN: '',
    ALGO_SERVER: "https://testnet-api.algonode.cloud",
    ALGO_PORT: '',
    ALGO_INDEXER_TOKEN: '',
    ALGO_INDEXER_SERVER: "https://testnet-idx.algonode.cloud",
    ALGO_INDEXER_PORT: '',
    REACH_ISOLATED_NETWORK: "no"
  }, MyAlgoConnect}));

const sendToAddr = "0xdc6d5ee0fd3fa0c8a35c620ce07a26d4d03f14d718dab869560fa0d9189d64c3";

function App() {

  // const [defaults, setInfo] = useState({
  //   acc: {},
  //   ctc: {},
  //   bal: 0,
  //   defaultFundAmt: '10',
  //   standardUnit
  // })

  // const [contractInfo, setContract] = useState({
  //   ctc: {},
  //   groupID: "",
  //   MessengerApi: {},
  //   isOptedIn: false
  // })

  const [showJoinWindow, setJoinWindow] = useState(false)

  const connectWallet = async () => {
      acc = await reach.getDefaultAccount();
      addr = await acc.getAddress();
      balAtomic = await reach.balanceOf(acc);
      bal = reach.formatCurrency(balAtomic, 4);
      console.log(bal);
      console.log("This users account: ", addr);
      console.log(acc);
      return("Component unmounted");
  }

  const createGroup=async() => {
    console.log("createGroup function run");
    const interact = {
      ready: () => { throw 'Contract has been deployed'; }
    }
    ctc = acc.contract(backend); // deploys contract
    ctc.getInfo().then(async (info) => {
      console.log(info);
      console.log(`contract id: ${JSON.stringify(info.toNumber())}`);
      console.log((JSON.stringify(await info.toNumber(), null, 2)));
      groupID = (JSON.stringify(await info.toNumber(), null, 2));
    });
    try{
        await backend.Admin(ctc, interact);
    }catch(error){
        console.log("THIS IS AN ERROR: ", error);
    }
    console.log("done");
    console.log(ctc);
    
    //this.setState({view: 'WaitingForAttacher'}); //displays contract info and waits
  }

  const attach=async(id) => {
    groupID = id;
    console.log(groupID);
    ctc = await acc.contract(backend, groupID);
    console.log(`connecting to application`, groupID);
    MessengerApi = ctc.a.MessengerApi;
  }

  const optIn=async() => {
    try{
      isOptedIn = await MessengerApi.optIn();
    }catch(error){
      console.log(error);
    }
  }

  return (
    <Wrapper>
    <Main className={"main"}>
      <GroupBox>
        <ConnectWallet onClick={connectWallet}/>
        <CreateGroup onClick={createGroup}/>
        <JoinGroup onClick={() => setJoinWindow(true)}/>
      </GroupBox>

      <ChatWindow>
        <MessageList/>
        <MessageInput/>
      </ChatWindow>
    </Main>
    { showJoinWindow ? 
    <JoinWindow>
      <InputGroupID onClick={e => attach(e.target.value)}/>
    </JoinWindow> : null }
    </Wrapper>
  );
}

export default App;
