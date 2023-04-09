import { useState } from "react";
import Dropzone from "react-dropzone";
import type { DropzoneState } from "react-dropzone";
import { toast } from "react-hot-toast";
import AWS from "aws-sdk";
import axios from "axios";
import { uploadToS3 } from "~/utils/s3";

const s3 = new AWS.S3();

interface UploadResponse {
  imageUrl: string;
}

const ImageUploader = (props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  const uploadImage = async (file: File) => {
    try {
      const data = await uploadToS3(file, props.id);
      console.log(data);
    } catch (error) {
      console.log(error);
      toast.error("Error uploading file to S3");
    }
  };

  const handleOnDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (
        file.type !== "image/png" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/jpg"
      ) {
        toast.error("Only PNG and JPG/JPEG files are allowed");
        return;
      }
      void uploadImage(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Dropzone onDrop={handleOnDrop}>
        {({ getRootProps, getInputProps, isDragActive }: DropzoneState) => (
          <div
            {...getRootProps()}
            className={`my-4 w-full rounded-md border-2 border-dashed border-gray-600 p-8 ${
              isDragActive ? "border-green-500" : ""
            } flex cursor-pointer flex-col items-center`}
          >
            <input {...getInputProps()} accept=".png,.jpg,.jpeg" />
            {imageUrl ? (
              <img className="max-w-full" src={imageUrl} alt="uploaded image" />
            ) : (
              <p className="text-gray-500">
                {isDragActive
                  ? "Drop the image file here"
                  : "Drag and drop a PNG or JPG/JPEG image file here, or click to select a file"}
              </p>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default ImageUploader;
