"use client";

import { motion } from "framer-motion";
import { School, Users, Star, Shield, BookOpen, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About RateThatProf</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Helping students make informed decisions about their education through transparent professor reviews and ratings.
          </p>
        </section>
        
        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
            <CardDescription>
              What drives us to make education better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At RateThatProf, we believe that every student deserves access to transparent, honest information about their professors. Our platform empowers students to make informed decisions about their education while helping professors receive constructive feedback to improve their teaching methods.
            </p>
          </CardContent>
        </Card>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Driven
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our platform thrives on student contributions, creating a valuable resource for the entire academic community.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Fair Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We ensure balanced, honest reviews through our comprehensive rating system and moderation process.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Student privacy is our priority. Review anonymously and control your data with our robust privacy features.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Educational Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By providing insights about teaching styles and course expectations, we help improve educational outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Stats Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Impact</CardTitle>
            <CardDescription>
              Growing together with the academic community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Professors Rated</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-primary">100K+</p>
                <p className="text-sm text-muted-foreground">Reviews Written</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Universities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Team Values */}
        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
            <CardDescription>
              The principles that guide our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Transparency</h3>
              <p className="text-muted-foreground">
                We believe in open, honest communication about educational experiences.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Fairness</h3>
              <p className="text-muted-foreground">
                Our review system promotes balanced, constructive feedback.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Privacy</h3>
              <p className="text-muted-foreground">
                We protect user privacy while maintaining review authenticity.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Community</h3>
              <p className="text-muted-foreground">
                Building a supportive environment for students and educators alike.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}