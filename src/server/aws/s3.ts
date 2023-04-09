import { S3 } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

export const s3 = new S3({
  region: env.REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// export const setupAWS = () => {
//   AWS.config.update({
//     accessKeyId: "",
//     secretAccessKey: "",
//     region: "ca-central-1",
//     signatureVersion: "v4",
//   });
//   console.log("AWS S3 Configured");
// };

// export const uploadToS3 = async (file: File, id: string) => {
//   try {
//     const s3 = new AWS.S3();

//     const s3Params = {
//       Bucket: "",
//       Key: `${id}/${file.name}`,
//       Body: file,
//       ContentType: file.type,
//     };

//     const data = await s3.upload(s3Params).promise();
//     console.log(data);
//     return data.Location;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Error uploading file to S3");
//   }
// };
