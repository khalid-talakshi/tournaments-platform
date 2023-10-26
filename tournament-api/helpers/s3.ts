import AWSMock from "mock-aws-s3";
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

AWSMock.config.basePath = "/tmp/buckets/"; // Can configure a basePath for your local buckets

const region = process.env.AWS_REGION;

export const bucketParams = {
  Bucket: process.env.AWS_BUCKET,
};

const s3Client = new S3Client({ region });

export const s3 = process.env.NODE_ENV === "test" ? new AWSMock.S3() : s3Client;

export const getExtension = (file: Express.Multer.File) => {
  const key = file.originalname;
  return getExtensionByName(key);
};

export const getExtensionByName = (key: string) => {
  const extension = key.split(".").pop();
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

export function toDataURL(img: ArrayBuffer, contentType: string) {
  const image = btoa(
    new Uint8Array(img).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  return `data:${contentType};base64,${image}`;
}

export const getObjectByKey = async (key: string) => {
  const getParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };

  let type: string;
  if (getExtensionByName(key) === "pdf") {
    type = "application/pdf";
  } else {
    type = `image/${getExtensionByName(key)}`;
  }

  try {
    const result = await s3Client.send(new GetObjectCommand(getParams));
    const imageArray = await result.Body.transformToByteArray();
    const imageStr = Buffer.from(imageArray).toString("base64");
    const imageURl = `data:${type};base64,${imageStr}`;
    return imageURl;
  } catch (err) {
    throw new Error("getObjectError");
  }
};
