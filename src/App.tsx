import { useEffect, useState } from "react";
import { Web3AuthCore } from "@web3auth/core";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import RPC from "./web3RPC";
import "./App.css";
import { ChangeEvent } from "react";

const clientId = "BK8c8qvNoRUb1pQimsAjePSwooayZs2uQnj6Yd4MtZs0tQiu6vb2sO3iEqxsF1Btca4fUaYKOdBduV3G7KRcsqA"; // get from https://dashboard.web3auth.io
//const clientId = 'YOUR_WEB3AUTH_CLIENT_ID';
function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [email, setEmail] = useState<String | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthCore({
          clientId,
          web3AuthNetwork: "mainnet", // mainnet, aqua, celeste, cyan or testnet
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x89",//"0x13881",
            rpcTarget: "https://rpc.ankr.com/polygon", //"https://matic-mumbai.chainstacklabs.com/", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        });


        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "mainnet",
            uxMode: "redirect",
          },
        });

        web3auth.configureAdapter(openloginAdapter);

        // const torusWalletAdapter = new TorusWalletAdapter({
        //   adapterSettings: {
        //     buttonPosition: "bottom-left",
        //   },
        //   loginSettings: {
        //     verifier: "email_passwordless",
        //   },
        //   initParams: {
        //     buildEnv: "production",
        //   },
        //   chainConfig: {
        //     chainNamespace: CHAIN_NAMESPACES.EIP155,
        //     chainId: "0x13881",
        //     rpcTarget: "https://matic-mumbai.chainstacklabs.com/",
        //     // Avoid using public rpcTarget in production.
        //     // Use services like Infura, Quicknode etc
        //     displayName: "Mumbai",
        //     blockExplorer: "https://mumbai.polygonscan.io",
        //     ticker: "MATIC",
        //     tickerName: "Polygon",
        //   },
        //   clientId: clientId,
        //   sessionTime: 3600, // 1 hour in seconds
        //   //web3AuthNetwork: "mainnet",
        // });
        
        // // it will add/update  the torus-evm adapter in to web3auth class
        // web3auth.configureAdapter(torusWalletAdapter);

        // const torusPlugin = new TorusWalletConnectorPlugin({
        //   torusWalletOpts: {},
        //   walletInitOptions: {
        //     whiteLabel: {
        //       theme: { isDark: true, colors: { primary: "#00a8ff" } },
        //       logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
        //       logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
        //     },
        //     useWalletConnect: true,
        //     enableLogging: true,
        //   },
        // });
        // await web3auth.addPlugin(torusPlugin);

        setWeb3auth(web3auth);

        await web3auth.init();

        if (web3auth.provider) {
            setProvider(web3auth.provider);
        };

      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const loginGoogle = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
  
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      mfaLevel: "default", // Pass on the mfa level of your choice: default, optional, mandatory, none
      loginProvider: "google", // Pass on the login provider of your choice: google, facebook, discord, twitch, twitter, github, linkedin, apple, etc.
    });
    setProvider(web3authProvider);
  };

  const loginEmail = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }

    if (!email) {
      uiConsole("email is empty");
      console.log("email is empty");
      return;
    }
  
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      mfaLevel: "default", // Pass on the mfa level of your choice: default, optional, mandatory, none
      loginProvider: "email_passwordless", // Pass on the login provider of your choice: google, facebook, discord, twitch, twitter, github, linkedin, apple, etc.
      // redirectUrl: "http://localhost:3000/",
       extraLoginOptions: {
         login_hint: email,
       }
    });
    setProvider(web3authProvider);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <div>
    <button onClick={loginGoogle} className="card">
      Login with Google
    </button>
    <hr></hr>
    <input type="text" id="email" className="email" placeholder="Your Email" onChange={handleChange} value={email?.toLowerCase()}></input>
    <button onClick={loginEmail} className="card">
      Login with Email
    </button>
  </div>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        & ReactJS Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth/examples" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;