import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ClaimPacket, ResultPacket } from "./types";
import { getMockClaim, getMockResult, MOCK_CLAIMS } from "./mock-data";

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "") as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api";

const STORAGE_KEY = "rw_wallet_pk";

const chain = {
  ...studionet,
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
};

function getAccount() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return createAccount(stored as `0x${string}`);
  }
  return createAccount();
}

function getClient() {
  const account = getAccount();
  return createClient({ chain, account });
}

export async function submitClaim(
  claimType: string,
  title: string,
  statement: string,
  sourceUrl: string,
  sourceHint: string,
  expectedValue: string
): Promise<string> {
  if (IS_MOCK) {
    const id = String(MOCK_CLAIMS.length);
    return id;
  }
  const client = getClient();
  const account = getAccount();
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "submit_claim",
    args: [claimType, title, statement, sourceUrl, sourceHint, expectedValue],
    account,
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: "ACCEPTED" as any,
  });
  return String(receipt.data ?? txHash);
}

export async function verifyClaim(claimId: string): Promise<string> {
  if (IS_MOCK) return "";
  const client = getClient();
  const account = getAccount();
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "verify_claim",
    args: [Number(claimId)],
    account,
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: "ACCEPTED" as any,
  });
  return String(receipt.data ?? txHash);
}

export async function challengeResult(
  claimId: string,
  reason: string,
  alternateUrl: string
): Promise<string> {
  if (IS_MOCK) return "";
  const client = getClient();
  const account = getAccount();
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "challenge_result",
    args: [Number(claimId), reason, alternateUrl],
    account,
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: "ACCEPTED" as any,
  });
  return String(receipt.data ?? txHash);
}

export async function getClaim(
  claimId: string
): Promise<ClaimPacket | null> {
  if (IS_MOCK) return getMockClaim(claimId);
  try {
    const client = getClient();
    const raw = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_claim",
      args: [Number(claimId)],
    });
    return JSON.parse(raw as string) as ClaimPacket;
  } catch {
    return null;
  }
}

export async function getResult(
  claimId: string
): Promise<ResultPacket | null> {
  if (IS_MOCK) return getMockResult(claimId);
  try {
    const client = getClient();
    const raw = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_result",
      args: [Number(claimId)],
    });
    return JSON.parse(raw as string) as ResultPacket;
  } catch {
    return null;
  }
}

export async function getStatus(claimId: string): Promise<string> {
  if (IS_MOCK) {
    const claim = getMockClaim(claimId);
    return claim?.status ?? "unknown";
  }
  try {
    const client = getClient();
    const raw = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_status",
      args: [Number(claimId)],
    });
    return raw as string;
  } catch {
    return "unknown";
  }
}

export async function getAllClaims(): Promise<ClaimPacket[]> {
  if (IS_MOCK) return MOCK_CLAIMS;
  const client = getClient();
  const claims: ClaimPacket[] = [];
  let id = 0;
  while (true) {
    try {
      const raw = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_claim",
        args: [id],
      });
      claims.push(JSON.parse(raw as string));
      id++;
    } catch {
      break;
    }
  }
  return claims;
}

export function getExplorerUrl(txHash: string): string {
  return `https://studio.genlayer.com/explorer/tx/${txHash}`;
}

export { getAccount, getClient };
