declare module "paytmchecksum" {
  const PaytmChecksum: {
    generateSignature(value: string, merchantKey: string): Promise<string>;
    verifySignature(value: string, merchantKey: string, signature: string): boolean;
  };
  export = PaytmChecksum;
}
