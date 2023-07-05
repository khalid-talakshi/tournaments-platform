import AWS from "aws-sdk";
import AWSMock from "mock-aws-s3";

AWSMock.config.basePath = "/tmp/buckets/"; // Can configure a basePath for your local buckets

AWS.config.update({ region: "ca-central-1" });

export const bucketParams = {
  Bucket: process.env.AWS_BUCKET,
};

export const s3 =
  process.env.NODE_ENV === "test" ? new AWSMock.S3() : new AWS.S3();

export const getExtension = (file: Express.Multer.File) => {
  const extension = file.originalname.split(".").pop();
  return extension;
};
