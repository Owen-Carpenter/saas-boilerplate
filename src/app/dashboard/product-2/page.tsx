"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, BookOpen, Send, ChevronRight, Clock, Check, Zap, Sparkles, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ProFeature, PlanFeature } from '@/components/ui/PlanFeature';
import { useSubscription } from '@/context/SubscriptionContext';
import Link from 'next/link';

export default function AIEssayAssistantPage() {
  const [essayTopic, setEssayTopic] = useState('');
  const [wordCount, setWordCount] = useState('500');
  const [tone, setTone] = useState('academic');
  const [generating, setGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState<string | null>(null);
  const { subscription, isPro, isEnterprise } = useSubscription();
  
  // Track essay history (simulated)
  const essayHistory = [
    {
      topic: "Climate Change Impact on Biodiversity",
      date: "2 days ago",
      words: 750,
      completed: true
    },
    {
      topic: "The Ethics of Artificial Intelligence",
      date: "Last week",
      words: 1200,
      completed: true
    }
  ];
  
  const handleGenerateEssay = () => {
    if (!essayTopic) return;
    
    setGenerating(true);
    // Simulate AI generating essay
    setTimeout(() => {
      setGenerating(false);
      setGeneratedEssay(
        "# The Role of Technology in Modern Education\n\n" +
        "## Introduction\n\n" +
        "In recent decades, technology has transformed virtually every aspect of our lives, and education is no exception. The integration of technology in educational settings has revolutionized how knowledge is delivered, accessed, and processed by students across all levels of learning. This essay explores the multifaceted role of technology in modern education, examining both its benefits and challenges, while considering its future implications for learning methodologies.\n\n" +
        "## The Digital Transformation of Learning Environments\n\n" +
        "Traditional classrooms have evolved significantly with the introduction of interactive whiteboards, tablets, and educational software. These tools have created more dynamic learning environments where information is no longer confined to textbooks but exists in various digital formats. The COVID-19 pandemic accelerated this transformation, forcing educational institutions worldwide to adopt remote learning technologies practically overnight.\n\n" +
        "Learning management systems (LMS) like Canvas, Blackboard, and Google Classroom have become essential infrastructure for schools and universities. These platforms serve as centralized hubs where educators can distribute materials, collect assignments, and communicate with students efficiently. The accessibility of these systems has extended learning beyond physical classroom walls, allowing for asynchronous education that accommodates diverse learning schedules and styles.\n\n" +
        "## Enhanced Engagement Through Multimedia and Interactivity\n\n" +
        "One of technology's most significant contributions to education is the ability to present information through multiple media channels. Visual learners benefit from infographics and videos, while auditory learners can access podcasts and recorded lectures. Interactive simulations and educational games provide kinesthetic learning opportunities that were previously difficult to implement at scale.\n\n" +
        "Research indicates that this multimedia approach can significantly improve student engagement and information retention. According to a study by the University of California, students who used interactive learning tools demonstrated 30% better retention of complex concepts compared to those who relied solely on traditional textbook learning.\n\n" +
        "## Personalized Learning Pathways\n\n" +
        "Perhaps the most revolutionary aspect of educational technology is its ability to personalize the learning experience. Adaptive learning systems use algorithms to assess student performance and adjust content difficulty in real-time. This creates individualized learning pathways that address each student's strengths and weaknesses.\n\n"
      );
    }, 3000);
  };
  
  const handleReset = () => {
    setEssayTopic('');
    setGeneratedEssay(null);
  };
  
  // Calculate remaining essays
  const remainingEssays = subscription.plan === 'free' ? 2 : 'Unlimited';

  return (
    <div className="h-full flex flex-col">
      {/* Header with gradient text */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-glow-cyan-strong">AI</span>{" "}
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Essay Assistant
          </span>
        </h1>
        <p className="text-gray-400">
          Generate well-structured essays on any topic in seconds
          {subscription.plan === 'free' && (
            <span className="ml-2 text-[#0ff0fc]">
              ({remainingEssays} essays remaining today)
            </span>
          )}
        </p>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[calc(100vh-13rem)] overflow-hidden">
        {/* Left Side - Controls */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Essay Generator */}
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                Essay Generator
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Essay Topic</label>
                  <textarea 
                    value={essayTopic}
                    onChange={(e) => setEssayTopic(e.target.value)}
                    placeholder="Enter your essay topic or question"
                    className="w-full px-3 py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0ff0fc] text-white"
                    rows={3}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Word Count</label>
                    <select 
                      value={wordCount}
                      onChange={(e) => setWordCount(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0ff0fc] text-white"
                    >
                      <option value="300">300 words</option>
                      <option value="500">500 words</option>
                      <option value="750">750 words</option>
                      <option value="1000">1000 words</option>
                      <option value="1500">1500 words</option>
                      <option value="2000">2000 words</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tone</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0ff0fc] text-white"
                    >
                      <option value="academic">Academic</option>
                      <option value="creative">Creative</option>
                      <option value="persuasive">Persuasive</option>
                      <option value="informative">Informative</option>
                      <option value="conversational">Conversational</option>
                    </select>
                  </div>
                </div>
                
                <ProFeature>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Advanced Options</label>
                    <div className="px-3 py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md text-white flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Citation Style, Format Settings, etc.</span>
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </ProFeature>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/10 transition-all w-1/3"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleGenerateEssay}
                    disabled={!essayTopic || generating}
                    className={`px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 transition-all w-2/3 flex items-center justify-center ${
                      !essayTopic || generating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {generating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Generate Essay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Essays */}
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg overflow-hidden flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                Recent Essays
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 overflow-auto">
              {essayHistory.length > 0 ? (
                <div className="space-y-3">
                  {essayHistory.map((essay, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-[#0a1018] border border-[#0ff0fc]/10 rounded-md hover:border-[#0ff0fc]/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white text-sm">{essay.topic}</h4>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{essay.date}</span>
                            <span className="mx-2">•</span>
                            <span>{essay.words} words</span>
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-[#0ff0fc]/10 rounded-full flex items-center justify-center border border-[#0ff0fc]/30">
                          <Check className="h-3 w-3 text-[#0ff0fc]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent essays</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Side - Essay Display */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                Generated Essay
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
              {!generatedEssay ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#0a1018] rounded-lg border border-[#0ff0fc]/10 p-8">
                  <div className="w-16 h-16 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-[#0ff0fc]/70" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No Essay Generated Yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Enter a topic and click "Generate Essay" to create a well-structured essay on any subject</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-[#0c1a29] p-3 rounded-md border border-[#0ff0fc]/20 flex flex-col items-center">
                      <FileText className="h-5 w-5 text-[#0ff0fc] mb-2" />
                      <span className="text-xs">Academic Papers</span>
                    </div>
                    <div className="bg-[#0c1a29] p-3 rounded-md border border-[#0ff0fc]/20 flex flex-col items-center">
                      <BookOpen className="h-5 w-5 text-[#0ff0fc] mb-2" />
                      <span className="text-xs">Creative Writing</span>
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
                          <h3 className="font-medium text-white">Essay Generated</h3>
                          <p className="text-xs text-[#0ff0fc]/70">{wordCount} words • {tone} tone</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 rounded-md p-4 bg-[#0c1a29] border border-[#0ff0fc]/10 text-sm whitespace-pre-wrap text-gray-300">
                      {generatedEssay}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <button className="flex-1 px-4 py-2 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/10 transition-all flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </button>
                    <ProFeature>
                      <button className="flex-1 px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm hover:bg-[#0ff0fc]/30 transition-all flex items-center justify-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Add Citations
                      </button>
                    </ProFeature>
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
                <Sparkles className="h-6 w-6 text-[#0ff0fc]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Upgrade to Pro for Premium Essay Features</h3>
                <p className="text-sm text-gray-400">Get unlimited essays, citations, advanced formatting, and more</p>
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
            <h3 className="text-white font-medium mb-3">Basic Essay Features</h3>
            <PlanFeature feature="Basic essay generation" availableOn={['free', 'pro', 'enterprise']} />
            <PlanFeature feature="Up to 750 words" availableOn={['free', 'pro', 'enterprise']} />
            <PlanFeature feature="Standard essay formats" availableOn={['free', 'pro', 'enterprise']} />
            <PlanFeature feature="2 daily essays" availableOn={['free', 'pro', 'enterprise']} />
          </div>
          
          <div className="bg-[#0c1a29] p-4 rounded-lg border border-[#0ff0fc]/20">
            <h3 className="text-white font-medium mb-3">Pro Essay Features</h3>
            <PlanFeature feature="Unlimited essays" availableOn={['pro', 'enterprise']} />
            <PlanFeature feature="Up to 2000 words" availableOn={['pro', 'enterprise']} />
            <PlanFeature feature="Citation generation" availableOn={['pro', 'enterprise']} />
            <PlanFeature feature="Advanced formatting" availableOn={['pro', 'enterprise']} />
          </div>
          
          <div className="bg-[#0c1a29] p-4 rounded-lg border border-[#0ff0fc]/20">
            <h3 className="text-white font-medium mb-3">Enterprise Essay Features</h3>
            <PlanFeature feature="Research integration" availableOn={['enterprise']} />
            <PlanFeature feature="Custom citation styles" availableOn={['enterprise']} />
            <PlanFeature feature="Specialized formats" availableOn={['enterprise']} />
            <PlanFeature feature="Topic expansion" availableOn={['enterprise']} />
          </div>
        </div>
      </div>
    </div>
  );
} 