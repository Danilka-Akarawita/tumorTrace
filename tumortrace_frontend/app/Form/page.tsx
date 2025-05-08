"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";
import { useEdgeStore } from "../lib/edgestore";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation"; 
// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  age: z.number().min(0, { message: "Age must be a positive number" }),
});

export default function Home() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [age, setAge] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasBase, setHasBase] = useState<boolean>(false);
  const [hasImg, setHasImg] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { edgestore } = useEdgeStore();
  const [url, setUrl] = useState<string>("");
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate the form data
    const validationResult = formSchema.safeParse({ name, email, age });

    if (!validationResult.success) {
      // Convert Zod errors to a more usable format
      const errorMessages = validationResult.error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {} as { [key: string]: string });
      setErrors(errorMessages);
    } else {
      // Clear errors and handle the valid form data
      setErrors({});
      setHasBase(true);
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
        options: {
          temporary: true,
        },
      });
      setHasImg(true);
      setUrl(res.url);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Prepare the data to send to the backend
      const data = {
        name,
        email,
        age,
        mriUrl: url, // Include the uploaded file URL
      };
  
      // Make the API call to the backend
      const response = await fetch("/api/handleData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit data");
      }
  
      // Parse the response to get the user ID
      const result = await response.json();
      const userId = result.user._id; // Assuming the backend returns the user ID in the response
  
      // Redirect to the diagnostics page with the user ID in the URL
      router.push(`/diagnostics/${userId}`);
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-2xl space-y-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={hasBase}
                className="mt-1"
              />
              {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              <Input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={hasBase}
                className="mt-1"
              />
              {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age:
              </label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                disabled={hasBase}
                className="mt-1"
              />
              {errors.age && <span className="text-sm text-red-500">{errors.age}</span>}
            </div>
            <Button type="submit" className="w-full" disabled={hasBase}>
              Set Data
            </Button>
          </div>
        </form>

        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <label htmlFor="picture" className="block text-sm font-medium text-gray-700">
              MRI:
            </label>
            <Input
              id="picture"
              type="file"
              disabled={!hasBase}
              onChange={(e) => setFile(e.target.files?.[0])}
              className="mt-1"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-2" />
            )}
            <Button
              onClick={handleFileUpload}
              disabled={!hasBase || !file || hasImg}
              className="w-full"
            >
              Upload
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {url ? (
            <img src={url} alt="Uploaded MRI" className="w-full h-auto rounded-lg" />
          ) : (
            <div className="text-center text-gray-500">No image uploaded yet.</div>
          )}
          <div className={!hasBase ? "mt-4 hidden" : "mt-4"}>
            <h6>Name: {name}</h6>
            <h6>Email: {email}</h6>
            <h6>Age: {age}</h6>
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button
            onClick={handleFinalSubmit}
            className="w-full"
            disabled={!hasBase || !hasImg}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}