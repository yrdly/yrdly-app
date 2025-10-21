declare module 'flutterwave-node-v3' {
  interface Flutterwave {
    Payment: {
      initialize(payload: any): Promise<any>;
    };
    Transaction: {
      verify(payload: { id: string }): Promise<any>;
    };
    Subaccount: {
      create(payload: any): Promise<any>;
    };
    Transfer: {
      initiate(payload: any): Promise<any>;
    };
  }
  
  function Flutterwave(publicKey: string, secretKey: string): Flutterwave;
  export = Flutterwave;
}
