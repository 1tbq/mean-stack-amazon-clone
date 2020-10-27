export interface User {
  name: string;
  email: string;
  picture: string;
  isSeller: boolean;
  address: {
    addr1: string;
    addr2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  created: string;
}
