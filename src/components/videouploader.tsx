import { useState } from "react";
import Dropzone from "react-dropzone";
import type { DropzoneState } from "react-dropzone";
import { toast } from "react-hot-toast";

const VideoUploader = (props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isGif, setIsGif] = useState<boolean>(false);

  const handleOnDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== "image/gif" && file.type !== "video/mp4") {
        toast.error("Only GIF and MP4 files are allowed");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      setIsGif(file.type === "image/gif");
      props.handleUpload(objectUrl, props.id);
      console.log(objectUrl);
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
            <input {...getInputProps()} accept=".mp4,.gif" />
            {videoUrl ? (
              isGif ? (
                <img
                  src={videoUrl}
                  style={{ width: "100%" }}
                  alt="uploaded gif"
                  className="animated infinite"
                />
              ) : (
                <video src={videoUrl} controls></video>
              )
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
