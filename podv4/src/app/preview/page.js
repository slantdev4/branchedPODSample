// Preview.js
'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { useFileUrl } from '../context/fileUrlContext';
import dynamic from 'next/dynamic';

// Dynamically import the PreviewComponent with SSR turned off
const PreviewComponent = dynamic(() => import('../components/previewComponent'), { ssr: false });
const PreviewOptions = dynamic(() => import('../components/PreviewOptions'), { ssr: false });

const Preview = () => {
  const router = useRouter();
  const { fileData } = useFileUrl();
  const { fileUrl, slicerApiResponse } = fileData;

  const handleNext = () => {
    router.push('/payment');
  };

  const handlePrevious = () => {
    router.push('/');
  };


  return (
    <div className="bg-gradient-to-bl from-blue-500 to-gray-100 h-screen">
      <div className="flex justify-center items-center min-h-90">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          <h1 className="text-center text-2xl font-bold mb-4"></h1>

          <div className="border-4 border-white">
            <PreviewComponent fileURL={fileUrl} className=" " />
          </div>

          <PreviewOptions slicerResponse={slicerApiResponse} />

          <div className="flex justify-between  w-full px-4 pb-10 pb-10">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-900 transition duration-500 text-white rounded"
              onClick={() => router.push('/')}
            >
              Back
            </button>
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-900 transition duration-500 text-white rounded"
              onClick={() => router.push('/payment')}
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );

};

export default Preview;

