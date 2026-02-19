/**
 * ==================================================================================
 * DANIKA'S LAW - HOME PAGE
 * ==================================================================================
 * 
 * Main landing page for Danika's Law legal platform featuring:
 * - Case management portal
 * - Document vault access
 * - Compliance portal
 * - Law Bubble widget integration
 * - Sponsor zones for legal services
 * 
 * ==================================================================================
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { LawBubbleWidget } from '@/components/law-bubble/LawBubbleWidget';

export default function DanikasLawHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Law Bubble Widget - Embeddable anywhere */}
      <LawBubbleWidget 
        userId="demo-user-dlaw"
        position="bottom-right"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">⚖️</span>
            <div>
              <h1 className="text-5xl font-bold mb-2">Danika's Law</h1>
              <p className="text-xl text-blue-200">Professional Legal Case Management Platform</p>
            </div>
          </div>
          
          <p className="text-lg max-w-2xl mb-8">
            Complete legal workflow management system featuring AI-powered case analysis,
            secure document storage, compliance tracking, and real-time collaboration tools.
          </p>

          <div className="flex gap-4">
            <Link
              href="/danikaslaw/cases"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Access Case Vault
            </Link>
            <Link
              href="/danikaslaw/documents"
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition border-2 border-white"
            >
              Document Repository
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Complete Legal Platform Suite
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Case Management */}
          <Link href="/danikaslaw/cases" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition border-2 border-gray-200 hover:border-blue-500">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">Case Management</h3>
              <p className="text-gray-600 text-sm">
                Organize and track all legal cases with AI-powered insights and workflow automation.
              </p>
            </div>
          </Link>

          {/* Document Vault */}
          <Link href="/danikaslaw/documents" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition border-2 border-gray-200 hover:border-blue-500">
              <div className="text-4xl mb-4">🗄️</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">Document Vault</h3>
              <p className="text-gray-600 text-sm">
                Secure, encrypted document storage with version control and access management.
              </p>
            </div>
          </Link>

          {/* Compliance Portal */}
          <Link href="/danikaslaw/compliance" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition border-2 border-gray-200 hover:border-blue-500">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">Compliance Portal</h3>
              <p className="text-gray-600 text-sm">
                Track warrants, subpoenas, and legal compliance requests with automated workflows.
              </p>
            </div>
          </Link>

          {/* Law Bubble */}
          <Link href="/danikaslaw/law-bubble" className="group">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl shadow-lg p-6 hover:shadow-2xl transition border-2 border-orange-300 hover:border-orange-500">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600">Law Bubble</h3>
              <p className="text-gray-600 text-sm">
                Quick legal Q&A widget - $1 per question. Embeddable on any page.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Sponsor Zone 1: Top Banner */}
      <section className="bg-yellow-50 border-y-4 border-orange-300 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600 mb-2">SPONSORED LEGAL SERVICES</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Featured Legal Partners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">🏛️</div>
              <h4 className="font-semibold">Smith & Associates</h4>
              <p className="text-xs text-gray-600">Corporate Law Specialists</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">⚖️</div>
              <h4 className="font-semibold">Legal Defense Group</h4>
              <p className="text-xs text-gray-600">Criminal Defense Experts</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">📜</div>
              <h4 className="font-semibold">Patent Law Partners</h4>
              <p className="text-xs text-gray-600">IP & Patent Attorneys</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Features */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          AI-Powered Legal Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Case Analysis</h3>
            <p className="text-gray-600 text-sm">
              Automated case review with precedent matching and risk assessment.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-gray-600 text-sm">
              Case outcome predictions based on historical data and patterns.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✍️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Document Generation</h3>
            <p className="text-gray-600 text-sm">
              AI-powered legal document drafting with template customization.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsor Zone 2: Sidebar Ads */}
      <section className="bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Main Content */}
            <div className="md:col-span-3 bg-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">Why Choose Danika's Law?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>SOC 2 Type II certified - Enterprise-grade security</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>99.9% uptime SLA - Always accessible when you need it</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>HIPAA & GDPR compliant - Full regulatory compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>24/7 support - Expert assistance around the clock</span>
                </li>
              </ul>
            </div>

            {/* Sponsor Sidebar */}
            <div className="space-y-4">
              <div className="bg-yellow-100 border-2 border-orange-300 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 mb-2">SPONSORED</p>
                <div className="text-3xl mb-2">💼</div>
                <p className="font-semibold text-sm">Legal Insurance</p>
                <button className="mt-2 bg-orange-600 text-white px-4 py-1 rounded text-xs hover:bg-orange-700">
                  Learn More
                </button>
              </div>

              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 mb-2">SPONSORED</p>
                <div className="text-3xl mb-2">🎓</div>
                <p className="font-semibold text-sm">Law School Prep</p>
                <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-xs hover:bg-blue-700">
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Legal Workflow?</h2>
          <p className="text-xl mb-8 text-blue-200">
            Join thousands of legal professionals using Danika's Law platform.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition">
              Start Free Trial
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/danikaslaw/cases" className="hover:text-white">Case Management</Link></li>
              <li><Link href="/danikaslaw/documents" className="hover:text-white">Documents</Link></li>
              <li><Link href="/danikaslaw/compliance" className="hover:text-white">Compliance</Link></li>
              <li><Link href="/danikaslaw/law-bubble" className="hover:text-white">Law Bubble</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API Reference</a></li>
              <li><a href="#" className="hover:text-white">Training</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
              <li><a href="#" className="hover:text-white">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© 2026 Danika's Law. All rights reserved. SOC 2 Type II Certified.</p>
        </div>
      </footer>
    </div>
  );
}
