"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Box, Upload, Image, BookOpen, Calculator, FileText, ChevronRight, Camera, Check, Divide, Plus, Zap } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ProFeature, PlanFeature } from '@/components/ui/PlanFeature';
import { useSubscription } from '@/context/SubscriptionContext';
import Link from 'next/link';

export default function HomeworkSolverPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const { subscription, isPro, isEnterprise } = useSubscription();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        // Reset any previous solutions
        setSolution(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });
  
  const handleSolve = () => {
    if (!preview) return;
    
    setSolving(true);
    // Simulate AI solving delay
    setTimeout(() => {
      setSolving(false);
      setSolution(
        "## Solution\n\nTo solve this quadratic equation: $3x^2 + 8x - 4 = 0$\n\nStep 1: Use the quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n\nStep 2: Identify the coefficients:\n- $a = 3$\n- $b = 8$\n- $c = -4$\n\nStep 3: Substitute into the formula:\n$x = \\frac{-8 \\pm \\sqrt{8^2 - 4 \\cdot 3 \\cdot (-4)}}{2 \\cdot 3}$\n$x = \\frac{-8 \\pm \\sqrt{64 + 48}}{6}$\n$x = \\frac{-8 \\pm \\sqrt{112}}{6}$\n$x = \\frac{-8 \\pm 2\\sqrt{28}}{6}$\n\nStep 4: Simplify:\n$x = \\frac{-8 \\pm 2\\sqrt{28}}{6}$\n$x = \\frac{-4 \\pm \\sqrt{28}}{3}$\n\nStep 5: Final answer:\n$x = \\frac{-4 + \\sqrt{28}}{3} \\approx 0.43$ or $x = \\frac{-4 - \\sqrt{28}}{3} \\approx -3.10$"
      );
    }, 2000);
  };
  
  const handleReset = () => {
    setUploadedFile(null);
    setPreview(null);
    setSolution(null);
  };
  
  const handleCameraTake = () => {
    // This would open the camera in a real implementation
    alert("Camera functionality would open here");
  };

  // Calculate remaining problems
  const remainingProblems = subscription.plan === 'free' ? 3 : 'Unlimited';

  return (
    <div className="h-full flex flex-col">
      {/* Header with gradient text */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-glow-cyan-strong">AI</span>{" "}
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Homework Solver
          </span>
        </h1>
        <p className="text-gray-400">
          Upload any homework problem and get step-by-step solutions instantly
          {subscription.plan === 'free' && (
            <span className="ml-2 text-[#0ff0fc]">
              ({remainingProblems} solves remaining today)
            </span>
          )}
        </p>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[calc(100vh-13rem)] overflow-hidden">
        {/* Left Side - Upload & Controls */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Upload Section */}
          <Card className="flex-1 bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Upload className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                Upload Homework
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col">
              {/* Upload Dropzone */}
              {!preview ? (
                <div 
                  {...getRootProps()} 
                  className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl ${
                    isDragActive ? 'border-[#0ff0fc] bg-[#0ff0fc]/5' : 'border-[#0ff0fc]/30'
                  } p-6 cursor-pointer transition-all hover:border-[#0ff0fc]/60`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-[#0ff0fc]" />
                  </div>
                  <p className="text-center text-white mb-2">Drag & drop your homework here</p>
                  <p className="text-center text-sm text-gray-400 mb-4">Or click to select files</p>
                  <p className="text-xs text-gray-500">Supports: JPG, PNG, PDF</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="relative flex-1 mb-4 border border-[#0ff0fc]/20 rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-contain bg-[#080f15]" 
                    />
                    <button 
                      onClick={handleReset}
                      className="absolute top-2 right-2 p-1 bg-[#0a1018] rounded-full border border-[#0ff0fc]/20 hover:bg-[#0ff0fc]/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0ff0fc]">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleReset} 
                      className="px-4 py-2 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/10 transition-all w-1/2"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSolve}
                      disabled={solving}
                      className={`px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 transition-all w-1/2 flex items-center justify-center ${
                        solving ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                    >
                      {solving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Solving...
                        </>
                      ) : (
                        <>
                          Solve Problem
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Separator */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-[#0ff0fc]/10"></div>
                <div className="px-3 text-sm text-gray-500">OR</div>
                <div className="flex-1 border-t border-[#0ff0fc]/10"></div>
              </div>
              
              {/* Take Photo Button */}
              <button 
                onClick={handleCameraTake}
                className="px-4 py-3 border border-[#0ff0fc]/30 rounded-md flex items-center justify-center hover:bg-[#0ff0fc]/10 transition-all"
              >
                <Camera className="h-5 w-5 text-[#0ff0fc] mr-2" />
                <span>Take a Photo</span>
              </button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Side - Solution Display */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                Solution
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
              {!solution ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#0a1018] rounded-lg border border-[#0ff0fc]/10 p-8">
                  <div className="w-16 h-16 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-[#0ff0fc]/70" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No Solution Yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Upload a homework problem and click "Solve Problem" to see the solution here</p>
                  
                  <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                    <div className="bg-[#0c1a29] p-3 rounded-md border border-[#0ff0fc]/20 flex flex-col items-center">
                      <Plus className="h-5 w-5 text-[#0ff0fc] mb-2" />
                      <span className="text-xs">Math</span>
                    </div>
                    <div className="bg-[#0c1a29] p-3 rounded-md border border-[#0ff0fc]/20 flex flex-col items-center">
                      <Divide className="h-5 w-5 text-[#0ff0fc] mb-2" />
                      <span className="text-xs">Physics</span>
                    </div>
                    <div className="bg-[#0c1a29] p-3 rounded-md border border-[#0ff0fc]/20 flex flex-col items-center">
                      <BookOpen className="h-5 w-5 text-[#0ff0fc] mb-2" />
                      <span className="text-xs">Chemistry</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 bg-[#0a1018] rounded-lg border border-[#0ff0fc]/10 p-6 overflow-y-auto">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#0ff0fc]/10 rounded-full flex items-center justify-center mr-3 border border-[#0ff0fc]/30">
                          <Check className="h-4 w-4 text-[#0ff0fc]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Problem Solved</h3>
                          <p className="text-xs text-[#0ff0fc]/70">Quadratic Equation</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Just now
                      </div>
                    </div>
                    
                    <div className="mt-2 rounded-md p-4 bg-[#0c1a29] border border-[#0ff0fc]/10 text-sm whitespace-pre-wrap text-gray-300 font-mono">
                      {solution}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <ProFeature>
                      <button className="flex-1 px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm hover:bg-[#0ff0fc]/30 transition-all flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
                      </button>
                    </ProFeature>
                    <button className="flex-1 px-4 py-2 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/10 transition-all">
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Upgrade Banner - Only show for free plan */}
      {subscription.plan === 'free' && (
        <div className="mt-6 bg-gradient-to-r from-[#0c1a29] to-[#1a1033] rounded-lg border border-[#0ff0fc]/20 p-5">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center mr-3">
                <Zap className="h-6 w-6 text-[#0ff0fc]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Upgrade to Pro for Unlimited Solves</h3>
                <p className="text-sm text-gray-400">Get unlimited homework solutions and access to premium features</p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-5 py-2.5 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-glow-cyan hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Available Features Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#0c1a29] p-4 rounded-lg border border-[#0ff0fc]/20">
            <h3 className="text-white font-medium mb-3">Basic Homework Features</h3>
            <PlanFeature feature="Simple math problems" availableOn={['free', 'pro', 'enterprise']} />
            <PlanFeature feature="Step-by-step solutions" availableOn={['free', 'pro', 'enterprise']} />
            <PlanFeature feature="3 daily solves" availableOn={['free', 'pro', 'enterprise']} />
            <PlanFeature feature="Basic subject coverage" availableOn={['free', 'pro', 'enterprise']} />
          </div>
          
          <div className="bg-[#0c1a29] p-4 rounded-lg border border-[#0ff0fc]/20">
            <h3 className="text-white font-medium mb-3">Pro Features</h3>
            <PlanFeature feature="Unlimited solves" availableOn={['pro', 'enterprise']} />
            <PlanFeature feature="Complex problem support" availableOn={['pro', 'enterprise']} />
            <PlanFeature feature="Export to PDF" availableOn={['pro', 'enterprise']} />
            <PlanFeature feature="All subjects covered" availableOn={['pro', 'enterprise']} />
          </div>
          
          <div className="bg-[#0c1a29] p-4 rounded-lg border border-[#0ff0fc]/20">
            <h3 className="text-white font-medium mb-3">Enterprise Features</h3>
            <PlanFeature feature="Team sharing" availableOn={['enterprise']} />
            <PlanFeature feature="Advanced explanations" availableOn={['enterprise']} />
            <PlanFeature feature="Custom problem format" availableOn={['enterprise']} />
            <PlanFeature feature="Priority support" availableOn={['enterprise']} />
          </div>
        </div>
      </div>
    </div>
  );
} 