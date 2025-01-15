import { PinataSDK } from "pinata";

const pinata =
  import.meta.env.VITE_PINATA_JWT && import.meta.env.VITE_PINATA_GATEWAY
    ? new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
        pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
      })
    : null;

export async function uploadJsonToIpfs(filename: string, json: string) {
  if (!pinata) {
    throw new Error(
      "IPFS upload is not configured. Please set VITE_PINATA_JWT and VITE_PINATA_GATEWAY environment variables.",
    );
  }
  const name = filename.endsWith(".json") ? filename : `${filename}.json`;
  const file = new File([json], name, { type: "text/json" });
  const upload = await pinata.upload.file(file);
  return upload.cid;
}
