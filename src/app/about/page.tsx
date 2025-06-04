'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { motion, useAnimation, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Award,
  BookMarked,
  BookOpen,
  GraduationCap,
  Heart,
  MessageCircle,
  PenTool,
  School,
  Shield,
  Sparkles,
  Star,
  Users
} from 'lucide-react';

// Floating icon component with random movement
const FloatingIcon = ({ icon: Icon, className, delay = 0 }: { icon: any; className?: string; delay?: number }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
          transition: {
            duration: 5 + Math.random() * 5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse'
          }
        });
      }
    };
    animate();
  }, [controls]);

  return (
    <motion.div
      className={cn('text-primary/20 absolute', className)}
      animate={controls}
      initial={{ x: 0, y: 0 }}
      style={{ x, y }}
      transition={{ delay }}>
      <Icon className='h-8 w-8' />
    </motion.div>
  );
};

// Particle effect component
const Particles = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Don't render anything during SSR
  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className='bg-primary/10 absolute h-1 w-1 rounded-full'
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            scale: Math.random() * 2
          }}
          animate={{
            y: [null, Math.random() * dimensions.height],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

// Floating star component with twinkling effect
const FloatingStar = ({ className, delay = 0 }: { className?: string; delay?: number }) => {
  const controls = useAnimation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let animationFrame: number;

    const animate = async () => {
      if (!isMounted) return;

      try {
        await controls.start({
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.8, 0.3],
          rotate: [0, 180, 360],
          transition: {
            duration: 3 + Math.random() * 2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse'
          }
        });
      } catch (error) {
        // Animation was cancelled, ignore
      }
    };

    if (isMounted) {
      animationFrame = requestAnimationFrame(() => animate());
    }

    return () => {
      setIsMounted(false);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      controls.stop();
    };
  }, [controls, isMounted]);

  if (!isMounted) return null;

  return (
    <motion.div
      className={cn('text-primary/30 absolute', className)}
      animate={controls}
      initial={{ scale: 1, opacity: 0.3, rotate: 0 }}
      transition={{ delay }}>
      <Sparkles className='h-6 w-6' />
    </motion.div>
  );
};

// Floating pen component with writing animation
const FloatingPen = ({ className, delay = 0 }: { className?: string; delay?: number }) => {
  const controls = useAnimation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let animationFrame: number;

    const animate = async () => {
      if (!isMounted) return;

      try {
        await controls.start({
          rotate: [0, 15, -15, 0],
          y: [0, -10, 0],
          transition: {
            duration: 4 + Math.random() * 2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse'
          }
        });
      } catch (error) {
        // Animation was cancelled, ignore
      }
    };

    if (isMounted) {
      animationFrame = requestAnimationFrame(() => animate());
    }

    return () => {
      setIsMounted(false);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      controls.stop();
    };
  }, [controls, isMounted]);

  if (!isMounted) return null;

  return (
    <motion.div
      className={cn('text-primary/40 absolute', className)}
      animate={controls}
      initial={{ rotate: 0, y: 0 }}
      transition={{ delay }}>
      <PenTool className='h-7 w-7' />
    </motion.div>
  );
};

// Enhanced background pattern component
const BackgroundPattern = () => (
  <div className='fixed inset-0 -z-10 h-full w-full'>
    <div className='absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]' />
    <div className='bg-primary/20 absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full blur-[100px]' />
    <div className='bg-primary/10 absolute right-0 bottom-0 -z-10 m-auto h-[310px] w-[310px] rounded-full blur-[100px]' />
    <Particles />

    {/* Floating decorative icons */}
    <FloatingIcon icon={GraduationCap} className='top-1/4 left-1/4' delay={0} />
    <FloatingIcon icon={BookMarked} className='top-1/3 right-1/4' delay={1} />
    <FloatingIcon icon={Award} className='bottom-1/4 left-1/3' delay={2} />
    <FloatingIcon icon={MessageCircle} className='right-1/3 bottom-1/3' delay={3} />

    {/* Floating stars */}
    <FloatingStar className='top-1/5 left-1/5' delay={0.5} />
    <FloatingStar className='top-2/5 right-1/5' delay={1.5} />
    <FloatingStar className='bottom-1/5 left-2/5' delay={2.5} />
    <FloatingStar className='right-2/5 bottom-2/5' delay={3.5} />
    <FloatingStar className='top-1/2 left-1/2' delay={4.5} />

    {/* Floating pens */}
    <FloatingPen className='top-1/6 right-1/6' delay={0.7} />
    {/* <FloatingPen className='top-3/5 left-1/6' delay={1.7} /> */}
    <FloatingPen className='right-2/5 bottom-1/6' delay={2.7} />
    {/* <FloatingPen className='bottom-3/5 left-2/5' delay={3.7} /> */}
  </div>
);

// Enhanced animated icon component
const AnimatedIcon = ({ icon: Icon, className }: { icon: any; className?: string }) => {
  const springConfig = { stiffness: 300, damping: 20 };
  const scale = useSpring(1, springConfig);

  return (
    <motion.div
      className={cn('text-primary', className)}
      onHoverStart={() => scale.set(1.2)}
      onHoverEnd={() => scale.set(1)}
      style={{ scale }}
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}>
      <Icon className='h-5 w-5' />
    </motion.div>
  );
};

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className='relative mx-auto mt-4 max-w-4xl'>
      <BackgroundPattern />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='relative'
        style={{ y }}>
        {/* Hero Section with enhanced animation */}
        <motion.section
          className='from-background/80 to-background/40 relative mb-12 overflow-hidden rounded-lg bg-gradient-to-b p-8 text-center backdrop-blur-sm'
          style={{ opacity, scale }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <h1 className='from-primary via-primary/80 to-primary/60 mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent'>
              About ProfOMeter
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
              Helping students make informed decisions about their education through transparent professor reviews and
              ratings.
            </p>
          </motion.div>
        </motion.section>

        {/* Mission Section with hover effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}>
          <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 mb-8 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AnimatedIcon icon={Heart} />
                Our Mission
              </CardTitle>
              <CardDescription>What drives us to make education better</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                At ProfOMeter, we believe that every student deserves access to transparent, honest information about
                their professors. Our platform empowers students to make informed decisions about their education while
                helping professors receive constructive feedback to improve their teaching methods.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid with enhanced animations */}
        <motion.div
          className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-2'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}>
          {[
            {
              icon: Users,
              title: 'Community Driven',
              content:
                'Our platform thrives on student contributions, creating a valuable resource for the entire academic community.'
            },
            {
              icon: Star,
              title: 'Fair Ratings',
              content:
                'We ensure balanced, honest reviews through our comprehensive rating system and moderation process.'
            },
            {
              icon: Shield,
              title: 'Privacy First',
              content:
                'Student privacy is our priority. Review anonymously and control your data with our robust privacy features.'
            },
            {
              icon: BookOpen,
              title: 'Educational Impact',
              content:
                'By providing insights about teaching styles and course expectations, we help improve educational outcomes.'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 }
              }}>
              <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 h-full transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AnimatedIcon icon={feature.icon} />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground'>{feature.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}>
          <Card className='from-background to-background/80 mb-12 overflow-hidden bg-gradient-to-br backdrop-blur-sm'>
            <CardHeader>
              <CardTitle>Our Impact</CardTitle>
              <CardDescription>Growing together with the academic community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 text-center sm:grid-cols-2 md:grid-cols-4'>
                {[
                  { value: '2K+', label: 'Active Users' },
                  { value: '10K+', label: 'Professors Rated' },
                  { value: '15K+', label: 'Courses' },
                  { value: '100+', label: 'Reviews Written' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className='p-4'>
                    <p className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent'>
                      {stat.value}
                    </p>
                    <p className='text-muted-foreground text-sm'>{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Values with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}>
          <Card className='from-background to-background/80 overflow-hidden bg-gradient-to-br backdrop-blur-sm'>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
              <CardDescription>The principles that guide our platform</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {[
                {
                  title: 'Transparency',
                  content: 'We believe in open, honest communication about educational experiences.'
                },
                { title: 'Fairness', content: 'Our review system promotes balanced, constructive feedback.' },
                { title: 'Privacy', content: 'We protect user privacy while maintaining review authenticity.' },
                { title: 'Community', content: 'Building a supportive environment for students and educators alike.' }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className='border-border/50 bg-background/50 hover:bg-background/80 rounded-lg border p-4 transition-all duration-300'>
                  <h3 className='text-primary mb-2 font-medium'>{value.title}</h3>
                  <p className='text-muted-foreground'>{value.content}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
