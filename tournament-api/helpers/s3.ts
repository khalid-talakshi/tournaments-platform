import AWSMock from "mock-aws-s3";
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

AWSMock.config.basePath = "/tmp/buckets/"; // Can configure a basePath for your local buckets

const region = process.env.AWS_REGION;

export const bucketParams = {
  Bucket: process.env.AWS_BUCKET,
};

const s3Client = new S3Client({ region });

export const s3 = process.env.NODE_ENV === "test" ? new AWSMock.S3() : s3Client;

export const getExtension = (file: Express.Multer.File) => {
  const extension = file.originalname.split(".").pop();
  return extension;
};

export const uploadObject = async (key: string, buffer: any) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    Body: buffer,
  };

  try {
    const uploadCommand = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(uploadCommand);
    return result;
  } catch (err) {
    throw new Error("uploadError");
  }
};

export const deleteObject = async (key: string) => {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };

  try {
    const result = await s3Client.send(new DeleteObjectCommand(deleteParams));
    return result;
  } catch (err) {
    throw new Error("deleteError");
  }
};
