import { motion } from 'framer-motion';
import { Award, BookOpen,PenTool, Star, Users } from 'lucide-react';

export default function HeroSection() {
  // Animation variants for floating elements
  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const starAnimation = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.0, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className='from-primary/10 to-background relative flex min-h-[80vh] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b p-6 md:p-10'>
      {/* Background pattern */}
      <div className='absolute inset-0 opacity-5'>
        <svg className='h-full w-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'>
            <path d='M 10 0 L 0 0 0 10' fill='none' stroke='currentColor' strokeWidth='0.5' />
          </pattern>
          <rect width='100' height='100' fill='url(#grid)' />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='relative z-10 mx-auto max-w-4xl text-center'>
        <motion.h1
          className='from-primary to-primary/60 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl'
          variants={fadeInUp}>
          Find & Rate Your Professors
        </motion.h1>
        <motion.p className='text-muted-foreground mx-auto mb-12 max-w-2xl text-xl' variants={fadeInUp}>
          Make informed decisions about your classes with real student reviews and ratings for professors
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial='initial'
          animate='animate'
          className='mx-auto grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4'>
          {[
            { icon: BookOpen, text: 'Browse Courses', delay: 0 },
            { icon: Users, text: 'Read User Reviews', delay: 0.2 },
            { icon: Star, text: 'Rate Professors', delay: 0.4 },
            { icon: Award, text: 'Check Ratings', delay: 0.6 }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              transition={{ delay: item.delay }}
              className='bg-background/50 border-primary/10 hover:border-primary/30 rounded-xl border p-6 backdrop-blur-sm transition-colors'>
              <item.icon className='text-primary mx-auto mb-3 h-8 w-8' />
              <h3 className='text-lg font-semibold'>{item.text}</h3>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating pen animation */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className='absolute top-1/4 right-10 hidden lg:block'>
        <motion.div variants={floatingAnimation} initial='initial' animate='animate' className='relative'>
          <PenTool className='text-primary/40 h-16 w-16' />
          <motion.div variants={starAnimation} initial='initial' animate='animate' className='absolute -top-2 -right-2'>
            {/* <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' /> */}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating review cards */}
      <div className='absolute top-1/2 right-12 hidden lg:block'>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className='relative'>
          <motion.div
            variants={floatingAnimation}
            initial='initial'
            animate='animate'
            className='rotate-3 transform rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-sm'>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className='mt-2 text-sm dark:text-white/90'>"Amazing teaching style!"</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Additional floating review card */}
      <div className='absolute bottom-1/4 left-16 hidden lg:block'>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className='relative'>
          <motion.div
            variants={floatingAnimation}
            initial='initial'
            animate='animate'
            className='-rotate-3 transform rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-sm'>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className='mt-2 text-sm dark:text-white/90'>"Best professor ever!"</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative stars */}
      <div className='absolute top-1/3 left-10'>
        <motion.div variants={starAnimation} initial='initial' animate='animate'>
          <Star className='text-primary/20 h-8 w-8' />
        </motion.div>
      </div>
      <div className='absolute right-1/4 bottom-1/4'>
        <motion.div variants={starAnimation} initial='initial' animate='animate' transition={{ delay: 0.5 }}>
          <Star className='text-primary/20 h-6 w-6' />
        </motion.div>
      </div>
      <div className='absolute right-1/6 bottom-1/10'>
        <motion.div variants={starAnimation} initial='initial' animate='animate' transition={{ delay: 0.5 }}>
          <Star className='text-primary/40 h-6 w-6' />
        </motion.div>
      </div>

      {/* Enhanced decorative elements */}
      <div className='bg-primary/5 absolute top-10 right-10 h-32 w-32 rounded-full blur-3xl' />
      <div className='bg-primary/10 absolute bottom-10 left-10 h-40 w-40 rounded-full blur-3xl' />
      <div className='bg-primary/5 absolute top-1/2 left-1/4 h-24 w-24 rounded-full blur-2xl' />
    </section>
  );
}
