import { useState } from "react";
import Dropzone from "react-dropzone";
import type { DropzoneState } from "react-dropzone";
import { toast } from "react-hot-toast";

const ImageUploader = (props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");

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
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      props.handleUpload(objectUrl, props.id);
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
