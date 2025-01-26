"use client";

import { CROWDFUNDING_ABI } from "@/lib/abi";
import { CROWDFUNDING_ADDRESS } from "@/lib/constants";

import { Button } from "@heroui/button";
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  Hex,
  http,
  parseUnits,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";

export default function Home() {
  const { address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data } = useReadContract({
    address: CROWDFUNDING_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "collectedFunds",
  });

  console.log(data);

  // const { data: decimals } = useReadContract({
  //   address: "0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d",
  //   abi: erc20Abi,
  //   functionName: "decimals",
  // });

  const { writeContractAsync } = useWriteContract();

  const contribute = async (address: Hex) => {
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    });

    const decimals = await publicClient.readContract({
      address,
      abi: erc20Abi,
      functionName: "decimals",
    });

    const allowance = await publicClient.readContract({
      address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, CROWDFUNDING_ADDRESS],
    });

    if (allowance < parseUnits("1", decimals)) {
      const approveTxHash = await writeContractAsync({
        address,
        abi: erc20Abi,
        functionName: "approve",
        args: [CROWDFUNDING_ADDRESS, parseUnits("1", decimals)],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
    }

    const txHash = await writeContractAsync({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "contribute",
      args: [parseUnits("1", decimals)],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });
  };

  return (
    <>
      <h1>Urbe Campus - Firenze</h1>
      <h2>Total collected: {data ? formatUnits(data, 6) : "0"} USDC</h2>
      {!address && (
        <Button onPress={() => connect({ connector: injected() })}>
          Connect
        </Button>
      )}
      {address && <Button onPress={() => disconnect()}>Disconnect</Button>}
      {address && (
        <Button
          color="primary"
          onPress={() =>
            contribute("0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d")
          }
        >
          Contribute
        </Button>
      )}
    </>
  );
}
