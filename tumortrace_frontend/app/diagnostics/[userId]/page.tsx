"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PostPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [hasImg, setHasImg] = useState<boolean>(false);
  const [hasImg2, setHasImg2] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasImg(true);
  };

  const handleSubmit2 = (event: React.FormEvent) => {
    event.preventDefault();
    setHasImg2(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-2xl space-y-8">
        <h1>Patient Id: {userId}</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button onClick={handleSubmit} className="w-full">
            Generate Diagnostics
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {hasImg && (
            <div className="mt-4">
              <h1>Diagnostics:</h1>
              <h1 className="text-5xl text-red-600">glioma</h1>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button onClick={handleSubmit2} className="w-full">
            Generate MRI
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div>
            {hasImg2 && (
              <img
                src="/glioma-8-seg.PNG"
                alt="Uploaded MRI"
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
