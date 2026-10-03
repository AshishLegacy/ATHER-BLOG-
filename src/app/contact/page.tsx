"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate contact dispatch
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-12 min-h-screen space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Contact Our Team</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Have questions, editorial pitches, or partnership inquiries? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold">Contact Channels</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Email Editorial</p>
                  <p className="text-xs text-muted-foreground">editorial@aetherblog.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Community Discord</p>
                  <p className="text-xs text-muted-foreground">discord.gg/aetherblog</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Headquarters</p>
                  <p className="text-xs text-muted-foreground">San Francisco, CA & Remote Global</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <Card className="shadow-lg border-border/80 bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                We usually respond within 24 hours on business days.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Thank you for reaching out, {name}. Our team has received your note and will be in touch shortly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setMessageText("");
                      setSubject("");
                    }}
                    className="rounded-xl mt-2"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Your Name</label>
                      <Input
                        type="text"
                        placeholder="Alex Rivera"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Your Email</label>
                      <Input
                        type="email"
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Subject</label>
                    <Input
                      type="text"
                      placeholder="Editorial submission, bug report, feedback..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Message</label>
                    <Textarea
                      placeholder="How can we help you today?..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      required
                      className="rounded-xl min-h-[120px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-11 rounded-xl font-semibold shadow-md"
                    isLoading={isLoading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
