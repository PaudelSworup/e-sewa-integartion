// import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import crypto from "crypto";

// const connectionString: string = process.env.DATABASE ?? "";
interface PaymentHashInput {
  amount: number;
  transaction_uuid: any;
}

interface DecodedData {
  transaction_code: string;
  status: string;
  total_amount: number;
  transaction_uuid: any;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

export const getEsewaPaymentHash = async ({
  amount,
  transaction_uuid,
}: PaymentHashInput) => {
  try {
    const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;

    const secretKey = process.env.ESEWA_SECRET_KEY ?? "";
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    return {
      signature: hash,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };
  } catch (error) {
    throw error;
  }
};

export const verifyEsewaPayment = async (encodedData: any) => {
  try {
    // Decoding base64 code received from eSewa
    let decodedData: DecodedData = JSON.parse(atob(encodedData));

    let headersList = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;

    const secretKey = process.env.ESEWA_SECRET_KEY || "";
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    console.log(hash);
    console.log(decodedData.signature);

    if (hash !== decodedData.signature) {
      throw { message: "Invalid Info", decodedData };
    }

    // let reqOptions: AxiosRequestConfig = {
    //   url: `${process.env.ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
    //   method: "GET",
    //   headers: headersList,
    // };

    // let response: AxiosResponse = await axios.request(reqOptions);

    // if (
    //   response.data.status !== "COMPLETE" ||
    //   response.data.transaction_uuid !== decodedData.transaction_uuid ||
    //   Number(response.data.total_amount) !== Number(decodedData.total_amount)
    // ) {
    //   throw { message: "Invalid Info", decodedData };
    // }

    return { decodedData };
  } catch (error) {
    throw error;
  }
};
