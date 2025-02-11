'use client';
import * as React from 'react';
import { useEdgeStore } from '../lib/edgestore';

export default function Page() {
  const [file, setFile] = React.useState<File>();
  const { edgestore } = useEdgeStore();
  const [url, setUrl] = React.useState<string>("");

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          setFile(e.target.files?.[0]);
        }}
      />
      <button
        onClick={async () => {
          if (file) {
            const res = await edgestore.publicFiles.upload({
              file,
              onProgressChange: (progress) => {
                // you can use this to show a progress bar
                console.log(progress);
              },
            });
            // you can run some server action or api here
            // to add the necessary data to your database
            console.log(res);
            // setUrl(res.url);
            // const reader = new FileReader();
            // reader.onload = (e) => {
            //     const imgElement = document.createElement('img');
            //     imgElement.src = e.target?.result as string;
            //     document.body.appendChild(imgElement);
            // };
            // reader.readAsDataURL(file);

          }
        }}
      >
        Upload
      </button>
      {/* <img src={url} /> */}
    </div>
  );
}