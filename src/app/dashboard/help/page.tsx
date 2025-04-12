"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Book, FileQuestion, LifeBuoy, Mail, MessageSquare, Code, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HelpPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Common questions by category
  const faqs = [
    {
      category: 'Account',
      questions: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Profile > Security > Change Password. You\'ll need to enter your current password and then your new password twice to confirm.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Navigate to the Profile page from the sidebar or user menu. You can edit your name, email, profile picture, and other details there.'
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account from Profile > Settings > Delete Account. This action is permanent and will remove all your data.'
        }
      ]
    },
    {
      category: 'Billing',
      questions: [
        {
          question: 'How do I upgrade my plan?',
          answer: 'Visit the Billing page from the sidebar menu and select the plan you want to upgrade to. You\'ll be guided through the payment process.'
        },
        {
          question: 'Can I cancel my subscription?',
          answer: 'Yes, you can cancel your subscription anytime from the Billing page. Your subscription will remain active until the end of your current billing period.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.'
        }
      ]
    },
    {
      category: 'Features',
      questions: [
        {
          question: 'What features are included in the free plan?',
          answer: 'The free plan gives you access to the basic dashboard and a demo version of the boilerplate. You\'ll need to upgrade to Pro or Enterprise for full access.'
        },
        {
          question: 'How do I access the boilerplate source code?',
          answer: 'Pro and Enterprise subscribers can access the full source code repository through the Boilerplate page in the dashboard.'
        },
        {
          question: 'What technologies does the boilerplate include?',
          answer: 'Our boilerplate includes Next.js 14, React 18, TypeScript, Tailwind CSS, NextAuth, Supabase, and Stripe integration for payments.'
        }
      ]
    }
  ];
  
  // Filtered FAQs based on search query
  const filteredFaqs = searchQuery 
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
               q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-glow-cyan-strong">Help &</span>{" "}
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Support
          </span>
        </h1>
        <p className="text-gray-400 text-lg">Find answers, documentation, and support for your questions</p>
      </div>
      
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0ff0fc]" />
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full bg-[#0c1a29] border border-[#0ff0fc]/30 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#0ff0fc]/50 focus:border-[#0ff0fc]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {/* Help Content Tabs */}
      <Tabs defaultValue="faq" className="max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8 bg-[#0c1a29] p-1 border border-[#0ff0fc]/20 rounded-lg">
          <TabsTrigger value="faq" className="data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-[#0ff0fc] data-[state=active]:border-b-2 data-[state=active]:border-[#0ff0fc] rounded-md py-3">
            <FileQuestion className="h-5 w-5 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-[#0ff0fc] data-[state=active]:border-b-2 data-[state=active]:border-[#0ff0fc] rounded-md py-3">
            <Book className="h-5 w-5 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-[#0ff0fc] data-[state=active]:border-b-2 data-[state=active]:border-[#0ff0fc] rounded-md py-3">
            <LifeBuoy className="h-5 w-5 mr-2" />
            Contact Support
          </TabsTrigger>
        </TabsList>
        
        {/* FAQs Content */}
        <TabsContent value="faq" className="space-y-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, index) => (
              <Card key={index} className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#0c1a29] to-[#121a2a] border-b border-[#0ff0fc]/10 pb-3">
                  <CardTitle className="text-white text-lg">{category.category} Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#0ff0fc]/10">
                    {category.questions.map((faq, idx) => (
                      <details key={idx} className="group px-6 py-4">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                          <h3 className="text-white font-medium text-base">{faq.question}</h3>
                          <ChevronRight className="h-5 w-5 text-[#0ff0fc] transform transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="mt-3 text-gray-300 leading-relaxed text-sm">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <FileQuestion className="h-10 w-10 text-[#0ff0fc]/50 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-400">Try searching with different keywords or browse our documentation.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Documentation Content */}
        <TabsContent value="docs" className="space-y-6">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Code className="h-5 w-5 mr-3 text-[#0ff0fc]" />
                Technical Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">Explore our comprehensive documentation to learn how to get the most out of the SaaS boilerplate.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Link href="#" className="p-4 bg-[#0a1018] rounded-lg border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all group">
                    <h3 className="text-white font-medium mb-2 flex items-center">
                      Getting Started
                      <ExternalLink className="h-4 w-4 ml-2 text-[#0ff0fc] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 text-sm">Installation guides and setup instructions for new users.</p>
                  </Link>
                  
                  <Link href="#" className="p-4 bg-[#0a1018] rounded-lg border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all group">
                    <h3 className="text-white font-medium mb-2 flex items-center">
                      API Reference
                      <ExternalLink className="h-4 w-4 ml-2 text-[#0ff0fc] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 text-sm">Detailed documentation of all API endpoints and usage.</p>
                  </Link>
                  
                  <Link href="#" className="p-4 bg-[#0a1018] rounded-lg border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all group">
                    <h3 className="text-white font-medium mb-2 flex items-center">
                      Component Library
                      <ExternalLink className="h-4 w-4 ml-2 text-[#0ff0fc] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 text-sm">UI components guide with examples and customization options.</p>
                  </Link>
                  
                  <Link href="#" className="p-4 bg-[#0a1018] rounded-lg border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all group">
                    <h3 className="text-white font-medium mb-2 flex items-center">
                      Authentication
                      <ExternalLink className="h-4 w-4 ml-2 text-[#0ff0fc] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 text-sm">Auth flow implementation and security best practices.</p>
                  </Link>
                </div>
                
                <div className="mt-6">
                  <a 
                    href="#" 
                    className="w-full py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md text-center text-white hover:bg-[#0ff0fc]/10 hover:text-[#0ff0fc] transition-all flex items-center justify-center"
                  >
                    <Book className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-3 text-[#0ff0fc]" />
                Tutorials & Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">Step-by-step tutorials and guides to help you implement common features.</p>
                
                <div className="space-y-3 mt-4">
                  <Link href="#" className="block p-3 bg-[#0a1018] rounded-md border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">Setting up Stripe Subscriptions</h3>
                      <ExternalLink className="h-4 w-4 text-[#0ff0fc]" />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Learn how to configure and test Stripe subscription workflows.</p>
                  </Link>
                  
                  <Link href="#" className="block p-3 bg-[#0a1018] rounded-md border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">Custom Authentication Flows</h3>
                      <ExternalLink className="h-4 w-4 text-[#0ff0fc]" />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Customize the authentication process with additional steps or providers.</p>
                  </Link>
                  
                  <Link href="#" className="block p-3 bg-[#0a1018] rounded-md border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 transition-all">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">Deploying to Production</h3>
                      <ExternalLink className="h-4 w-4 text-[#0ff0fc]" />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Best practices for deploying your SaaS application to production.</p>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Support Content */}
        <TabsContent value="support" className="space-y-6">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#0ff0fc]" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">Need personalized help? Our support team is ready to assist you.</p>
                
                <form className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0ff0fc]/50 focus:border-[#0ff0fc]"
                        defaultValue={session?.user?.name || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0ff0fc]/50 focus:border-[#0ff0fc]"
                        defaultValue={session?.user?.email || ''}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                    <select className="w-full bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0ff0fc]/50 focus:border-[#0ff0fc]">
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <textarea 
                      rows={5}
                      className="w-full bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0ff0fc]/50 focus:border-[#0ff0fc] resize-none"
                      placeholder="Please describe your issue or question in detail..."
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-glow-cyan-strong hover:bg-[#0ff0fc]/30 transition-all font-medium flex items-center justify-center"
                  >
                    <LifeBuoy className="h-4 w-4 mr-2" />
                    Submit Support Request
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-[#0ff0fc]" />
                  </div>
                  <h3 className="text-white font-medium text-lg">Live Chat</h3>
                </div>
                <p className="text-gray-300 mb-4">Get instant answers from our support team through live chat.</p>
                <button className="w-full py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md text-white hover:bg-[#0ff0fc]/10 hover:text-[#0ff0fc] transition-all">
                  Start Chat Session
                </button>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mr-3">
                    <Code className="h-5 w-5 text-[#0ff0fc]" />
                  </div>
                  <h3 className="text-white font-medium text-lg">Developer Community</h3>
                </div>
                <p className="text-gray-300 mb-4">Join our community forum to discuss with other developers.</p>
                <a 
                  href="#"
                  className="w-full py-2 bg-[#0a1018] border border-[#0ff0fc]/30 rounded-md text-center text-white hover:bg-[#0ff0fc]/10 hover:text-[#0ff0fc] transition-all block"
                >
                  Visit Community Forum
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Floating particles for consistent theme */}
      <div className="fixed bottom-[10%] right-[5%] w-2 h-2 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30 pointer-events-none" style={{ animationDuration: "8s" }}></div>
      <div className="fixed top-[40%] right-[10%] w-1.5 h-1.5 rounded-full bg-[#0ff0fc]/10 animate-float border border-[#0ff0fc]/20 pointer-events-none" style={{ animationDuration: "6s", animationDelay: "1s" }}></div>
    </div>
  );
} 