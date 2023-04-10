import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

import { api } from "../utils/api";
import Image from "next/image";
import { Spinner } from "./spinner";

function removeQueryString(input: string): string {
  const queryStringIndex = input.indexOf("?");
  if (queryStringIndex === -1) {
    return input; // No query string found
  } else {
    return input.slice(0, queryStringIndex);
  }
}

export const FileUploader = (props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) => {
  const { mutateAsync: fetchPresignedUrls } =
    api.s3.getStandardUploadPresignedUrl.useMutation();
  const apiUtils = api.useContext();

  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      maxFiles: 1,
      maxSize: 5 * 2 ** 30, // roughly 5GB
      multiple: false,
      onDropAccepted: (files, _event) => {
        setUploading(true);
        const file = files[0] as File;
        acceptedFiles[0] = file;

        fetchPresignedUrls({
          key: file.name,
        })
          .then((url) => {
            void handleSubmit(url);
          })
          .catch((err) => console.error(err));
      },
    });

  const handleSubmit = async (url: string) => {
    if (!acceptedFiles[0]) return;
    await axios
      .put(url, acceptedFiles[0], {
        headers: { "Content-Type": acceptedFiles[0].type },
      })
      .then((response) => {
        console.log("Successfully uploaded ", acceptedFiles[0]?.name);
        // redundant if statement to remove dumb "this is possibly undefined" error im not a terrible coder i promise
        if (acceptedFiles[0]) {
          setFileType(acceptedFiles[0].type);
          setFileName(acceptedFiles[0].name);
        }
        setFileUrl(removeQueryString(url));
      })
      .catch((err) => console.error(err));
    await apiUtils.s3.getObjects.invalidate();
    setUploading(false);
  };

  return (
    <section>
      <div
        {...getRootProps()}
        className={`my-4 flex w-full items-center justify-center rounded-md border-2 border-dashed ${
          isDragActive ? "border-blue-600" : "border-gray-600"
        } p-8`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Spinner />
        ) : fileUrl ? (
          fileType?.includes("image") ? (
            <Image
              className="h-auto w-auto max-w-full"
              src={fileUrl}
              alt="uploaded image"
              width={1440}
              height={1440}
            />
          ) : fileType?.includes("video") ? (
            <video
              src={fileUrl}
              className="h-auto w-auto max-w-full"
              controls
            ></video>
          ) : (
            <div
              className={`flex h-full items-center justify-center font-semibold ${
                isDragActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <p>{fileName}</p>
            </div>
          )
        ) : (
          <div
            className={`flex h-full items-center justify-center font-semibold ${
              isDragActive ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <p>
              Drag and drop a file, or click to select one from your device.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
