'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'completed' | 'error'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('idle');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to API
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        setUploadStatus('success');
        setUploadId(result.uploadId);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadId(null);
    setAnalysisStatus('idle');
  };

  const generateAnalysis = async () => {
    if (!uploadId) return;

    setAnalysisStatus('analyzing');

    try {
      const response = await fetch('/api/portfolio/analyze-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisStatus('completed');
        // Redirect to portfolio view or show results
        window.location.href = `/dashboard/portfolio/${uploadId}`;
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      setAnalysisStatus('error');
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Portfolio Screenshot
          </h1>
          <p className="text-gray-600">
            Upload a screenshot of your portfolio to get AI-powered analysis and insights.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your portfolio screenshot here' : 'Drag & drop your portfolio screenshot'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                or click to browse files
              </div>
              <div className="text-xs text-gray-400">
                Supports PNG, JPG, JPEG, GIF, BMP, WebP (max 10MB)
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={resetUpload}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Remove
                </button>
              </div>

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Status */}
              {uploadStatus === 'success' && (
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Upload successful!
                      </p>
                      <p className="text-xs text-green-600">
                        Your portfolio has been uploaded successfully.
                      </p>
                    </div>
                  </div>
                  
                  {/* Analysis Button */}
                  {analysisStatus === 'idle' && (
                    <div className="text-center">
                      <button
                        onClick={generateAnalysis}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Generate AI Analysis
                      </button>
                    </div>
                  )}
                  
                  {analysisStatus === 'analyzing' && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-sm font-medium text-blue-800">
                        Analyzing your portfolio...
                      </p>
                    </div>
                  )}
                  
                  {analysisStatus === 'completed' && (
                    <div className="flex items-center p-4 bg-green-50 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Analysis completed!
                        </p>
                        <p className="text-xs text-green-600">
                          Redirecting to your portfolio review...
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {analysisStatus === 'error' && (
                    <div className="flex items-center p-4 bg-red-50 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Analysis failed
                        </p>
                        <p className="text-xs text-red-600">
                          Please try again or contact support.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="flex items-center p-4 bg-red-50 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Upload failed
                    </p>
                    <p className="text-xs text-red-600">
                      Please try again or contact support if the problem persists.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {uploadStatus === 'idle' && (
                <button
                  onClick={handleUpload}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Upload & Analyze Portfolio
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          How to get the best results:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure your portfolio screenshot is clear and well-lit</li>
          <li>• Include all relevant information: stock symbols, quantities, prices</li>
          <li>• Avoid screenshots with overlapping windows or text</li>
          <li>• Supported formats: PNG, JPG, JPEG, GIF, BMP, WebP</li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Educational Purposes Only
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                All portfolio reviews and analysis are for educational purposes only and do not constitute financial advice. 
                Please consult with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
