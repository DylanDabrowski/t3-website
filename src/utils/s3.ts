import AWS from "aws-sdk";
import { env } from "~/env.mjs";

export const setupAWS = () => {
  AWS.config.update({
    accessKeyId: env.AWS_S3_KEY,
    secretAccessKey: env.AWS_S3_SECRET_KEY,
    region: "ca-central-1",
  });
  console.log("AWS S3 Configured");
};

export const uploadToS3 = async (file: File, id: string) => {
  console.log(file, id);
  const s3 = new AWS.S3();

  const s3Params = {
    Bucket: "t3-website-dylandabrowski",
    Key: `${id}/${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  try {
    const data = await s3.upload(s3Params).promise();
    console.log(data);
    return data.Location;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading file to S3");
  }
};
