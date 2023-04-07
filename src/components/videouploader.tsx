import { useState } from "react";
import Dropzone from "react-dropzone";
import type { DropzoneState } from "react-dropzone";

const VideoUploader = (props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  const handleOnDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
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
            <input {...getInputProps()} accept=".mp4,.gif" />
            {videoUrl ? (
              <video src={videoUrl} controls></video>
            ) : (
              <p className="text-gray-500">
                {isDragActive
                  ? "Drop the video file here"
                  : "Drag and drop an MP4 or GIF file here, or click to select a file"}
              </p>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default VideoUploader;
