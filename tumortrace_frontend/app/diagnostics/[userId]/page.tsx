"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, use } from "react";
import { jsPDF } from "jspdf";

export default function PostPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);

  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [gradcamImgUrl, setGradcamImgUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<null | {
    _id: string;
    name: string;
    email: string;
    age: number;
    mriUrl: string;
    __v: number;
  }>(null);
  const [generatedOutput, setGeneratedOutput] = useState<null | {
    tumorType: string;
    tumorDescripton: string;
    steps: string[];
  }>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/getUserDataById?id=${userId}`);
        const data = await res.json();
        setUserData(data.user);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userData?.mriUrl) return;

    setLoadingPrediction(true);
    setPrediction(null);
    setGradcamImgUrl(null);
    setGeneratedOutput(null);

    try {
      const imgBlob = await (await fetch(userData.mriUrl)).blob();
      const file = new File([imgBlob], "mri.jpg", { type: imgBlob.type });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setPrediction(result.Prediction);

      if (result.Prediction !== "notumor") {
        const gcRes = await fetch("http://localhost:8000/gradcam", {
          method: "POST",
          body: formData,
        });
        const gcJson = await gcRes.json();
        setGradcamImgUrl(`data:image/jpeg;base64,${gcJson.Image}`);

        const generateRes = await fetch(`http://localhost:8000/generate?predicted_tumor_type=${result.Prediction}`, {
          method: "POST",
          body: formData,
        });
        const genJson = await generateRes.json();
        setGeneratedOutput(genJson["generated output"]);
      }
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleDownloadReport = async () => {
    if (!userData || !prediction) return;
    setLoadingPDF(true);

    try {
      const doc = new jsPDF({ unit: "pt" });
      doc.setFontSize(18);
      doc.text("Patient MRI Diagnostic Report", 40, 40);

      doc.setFontSize(12);
      doc.text(`Name: ${userData.name}`, 40, 80);
      doc.text(`ID: ${userData._id}`, 40, 100);
      doc.text(`Age: ${userData.age}`, 40, 120);
      doc.text(`Prediction: ${prediction}`, 40, 140);

      const mriBlob = await (await fetch(userData.mriUrl)).blob();
      const mriDataUrl = await blobToDataURL(mriBlob);
      doc.addImage(mriDataUrl, "JPEG", 40, 160, 200, 200);

      if (gradcamImgUrl) {
        doc.addImage(gradcamImgUrl, "JPEG", 260, 160, 200, 200);
      }

      let y = 380;
      if (generatedOutput) {
        doc.setFontSize(14);
        doc.text(`Tumor Type: ${generatedOutput.tumorType}`, 40, y);
        y += 20;

        doc.setFontSize(12);
        doc.text("Description:", 40, y);
        y += 20;
        const descriptionLines = doc.splitTextToSize(generatedOutput.tumorDescripton, 500);
        doc.text(descriptionLines, 60, y);
        y += descriptionLines.length * 16 + 10;

        doc.text("Recommended Steps:", 40, y);
        y += 20;
        generatedOutput.steps.forEach((step, i) => {
          doc.text(`• ${step}`, 60, y + i * 20);
        });
      }

      doc.save(`report_${userData._id}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-2xl space-y-8 px-4">
        <h1 className="text-2xl font-bold text-center">Patient Diagnosis Portal</h1>
        <p className="text-center text-gray-600">ID: {userId}</p>

        <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
          <Button onClick={handleSubmit} className="w-full" disabled={loadingPrediction}>
            {loadingPrediction ? "Processing..." : "Generate Diagnostic Report"}
          </Button>
          {loadingPrediction && <p className="text-sm text-gray-500">Running AI model, please wait...</p>}
        </div>

        {prediction && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-lg font-semibold">Prediction Result</h2>
            <p className={`text-4xl font-bold ${prediction === "notumor" ? "text-green-600" : "text-red-600"}`}>
              {prediction.toUpperCase()}
            </p>

            <Button onClick={handleDownloadReport} className="w-full" disabled={loadingPDF}>
              {loadingPDF ? "Generating PDF..." : "Download PDF Report"}
            </Button>
          </div>
        )}

        {gradcamImgUrl && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-2">
            <h2 className="text-lg font-semibold mb-2">Grad-CAM Highlighted MRI</h2>
            <img src={gradcamImgUrl} alt="Grad-CAM MRI" className="w-full h-auto rounded-lg shadow" />
          </div>
        )}

        {generatedOutput && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-lg font-semibold">AI-Generated Tumor Report</h2>
            <p><strong>Tumor Type:</strong> {generatedOutput.tumorType}</p>
            <p><strong>Description:</strong> {generatedOutput.tumorDescripton}</p>
            <h3 className="font-semibold mt-4">Recommended Steps:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {generatedOutput.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
