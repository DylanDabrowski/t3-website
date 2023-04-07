import { useState } from "react";
import Dropzone from "react-dropzone";
import type { DropzoneState } from "react-dropzone";

const ImageUploader = (props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleOnDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      props.handleUpload(objectUrl, props.id);
    }
  };

  const dropzoneStyle: React.CSSProperties = {
    borderWidth: 2,
    borderColor: "#666",
    borderStyle: "dashed",
    borderRadius: 5,
    margin: "1rem",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
  };

  return (
    <div className="flex flex-col items-center">
      <Dropzone onDrop={handleOnDrop}>
        {({ getRootProps, getInputProps, isDragActive }: DropzoneState) => (
          <div
            {...getRootProps()}
            style={dropzoneStyle}
            className={`${
              isDragActive ? "border-green-500" : ""
            } flex flex-col items-center`}
          >
            <input {...getInputProps()} accept=".png,.jpg,.jpeg" />
            {imageUrl ? (
              <img src={imageUrl} alt="uploaded image" />
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
