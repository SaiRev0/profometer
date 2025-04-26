"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GitBranch,
  GitFork,
  Search,
  Shield,
  Clock,
  ChevronRight,
  ChevronDown,
  User,
  Star,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Branch {
  name: string;
  isDefault: boolean;
  isProtected: boolean;
  lastCommit: {
    message: string;
    date: string;
    hash: string;
    author: {
      name: string;
      avatar: string;
    };
  };
  aheadBy: number;
  behindBy: number;
}

// Mock data for branches
const mockBranches: Branch[] = [
  {
    name: "main",
    isDefault: true,
    isProtected: true,
    lastCommit: {
      message: "Update deployment configuration",
      date: "2024-03-20T10:30:00Z",
      hash: "8f4d2e1",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg"
      }
    },
    aheadBy: 0,
    behindBy: 0
  },
  {
    name: "feature/user-authentication",
    isDefault: false,
    isProtected: false,
    lastCommit: {
      message: "Implement OAuth2 login flow",
      date: "2024-03-19T15:45:00Z",
      hash: "3a9c7b2",
      author: {
        name: "Michael Chen",
        avatar: "https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg"
      }
    },
    aheadBy: 3,
    behindBy: 1
  },
  {
    name: "feature/api-integration",
    isDefault: false,
    isProtected: false,
    lastCommit: {
      message: "Add REST API endpoints",
      date: "2024-03-18T09:15:00Z",
      hash: "5e2f8d4",
      author: {
        name: "Emily Wilson",
        avatar: "https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg"
      }
    },
    aheadBy: 5,
    behindBy: 2
  },
  {
    name: "develop",
    isDefault: false,
    isProtected: true,
    lastCommit: {
      message: "Merge feature/user-profile",
      date: "2024-03-17T14:20:00Z",
      hash: "2b6a9c4",
      author: {
        name: "Alex Thompson",
        avatar: "https://images.pexels.com/photos/5905521/pexels-photo-5905521.jpeg"
      }
    },
    aheadBy: 8,
    behindBy: 0
  }
];

// More mock branches for the collapsed section
const moreBranches: Branch[] = Array.from({ length: 6 }, (_, i) => ({
  name: `feature/branch-${i + 1}`,
  isDefault: false,
  isProtected: false,
  lastCommit: {
    message: `Update component ${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    hash: Math.random().toString(16).slice(2, 9),
    author: {
      name: ["David Lee", "Emma Brown", "James Wilson"][i % 3],
      avatar: [
        "https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg",
        "https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg",
        "https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg"
      ][i % 3]
    }
  },
  aheadBy: Math.floor(Math.random() * 5),
  behindBy: Math.floor(Math.random() * 3)
}));

export default function BranchesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filteredBranches = [...mockBranches, ...(showMore ? moreBranches : [])].filter(
    branch => branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const defaultBranch = filteredBranches.find(b => b.isDefault);
  const otherBranches = filteredBranches.filter(b => !b.isDefault);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-5xl mx-auto mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GitBranch className="h-7 w-7 text-primary" />
              Repository Branches
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage repository branches
            </p>
          </div>
          
          <Button>
            <GitFork className="mr-2 h-4 w-4" />
            New Branch
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Find a branch..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBranches.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No branches found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Default Branch */}
            {defaultBranch && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{defaultBranch.name}</h3>
                        <Badge variant="secondary" className="shrink-0">Default</Badge>
                        {defaultBranch.isProtected && (
                          <Badge variant="outline" className="shrink-0">
                            <Shield className="h-3 w-3 mr-1" />
                            Protected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">{defaultBranch.lastCommit.hash}</span>
                        <span>•</span>
                        <span className="truncate">{defaultBranch.lastCommit.message}</span>
                        <span>•</span>
                        <span className="whitespace-nowrap">{formatDate(defaultBranch.lastCommit.date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={defaultBranch.lastCommit.author.avatar} />
                        <AvatarFallback>
                          {defaultBranch.lastCommit.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Active Branches */}
            <div className="space-y-2">
              {otherBranches.map((branch) => (
                <Card key={branch.name} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{branch.name}</h3>
                          {branch.isProtected && (
                            <Badge variant="outline" className="shrink-0">
                              <Shield className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                          {(branch.aheadBy > 0 || branch.behindBy > 0) && (
                            <Badge variant="secondary" className="shrink-0">
                              {branch.aheadBy > 0 && `${branch.aheadBy} ahead`}
                              {branch.aheadBy > 0 && branch.behindBy > 0 && ", "}
                              {branch.behindBy > 0 && `${branch.behindBy} behind`}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{branch.lastCommit.hash}</span>
                          <span>•</span>
                          <span className="truncate">{branch.lastCommit.message}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{formatDate(branch.lastCommit.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={branch.lastCommit.author.avatar} />
                          <AvatarFallback>
                            {branch.lastCommit.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <Button variant="outline" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Show More Button */}
            {!searchQuery && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMore(!showMore)}
              >
                <ChevronDown className={cn(
                  "h-4 w-4 mr-2 transition-transform",
                  showMore && "rotate-180"
                )} />
                {showMore ? "Show Less" : "Show More Branches"}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}