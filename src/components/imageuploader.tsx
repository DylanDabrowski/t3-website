import React, { useState } from "react";
import Image from "next/image";

export default function ImageUploader(props: {
  id: string;
  handleUpload: (imageUri: string, id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<null | File>(null);
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    if (!e.target.files || !e.target.files[0]) return;
    props.handleUpload(URL.createObjectURL(e.target.files[0]), props.id);
    setUploadedImage(e.target.files[0]);
    setUploading(false);
  };

  return (
    <div className="my-4">
      {uploading ? (
        <div className="flex flex-col items-center rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-lg">Uploading ...</h1>
        </div>
      ) : uploadedImage ? (
        <div className="flex justify-center">
          <Image
            className="mb-4 w-auto"
            src={URL.createObjectURL(uploadedImage)}
            alt={"uploaded image"}
            width={500}
            height={500}
          />
        </div>
      ) : (
        <div className="mb-4 h-96 w-auto rounded-xl border-2 border-dashed border-zinc-600"></div>
      )}
      <input
        type="file"
        accept="image/png, image/jpeg"
        id={`uploadedImage-${props.id}`}
        onChange={handleUpload}
        className="hidden"
      />
      <label
        className="text-md cursor-pointer rounded-lg bg-gradient-to-br from-green-100 to-blue-200 px-4 py-2 text-page-background shadow-md transition-shadow duration-150 active:shadow-none"
        htmlFor={`uploadedImage-${props.id}`}
      >
        Choose a file
      </label>
    </div>
  );
}
