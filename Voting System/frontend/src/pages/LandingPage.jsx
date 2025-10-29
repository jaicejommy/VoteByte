import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FloatingShape = ({ color, size, top, left, delay, theme }) => {
  const shapeColor = theme === "dark" 
    ? color 
    : color.replace("green", "blue").replace("emerald", "indigo");
  
  return (
    <motion.div
      className={`absolute ${shapeColor} ${size} rounded-full blur-3xl opacity-20`}
      style={{ top, left }}
      animate={{
        y: [0, 100, 0],
        x: [0, 50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
};

const ParticleField = ({ theme }) => {
  const particles = Array.from({ length: 50 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 ${
            theme === "dark" ? "bg-green-400" : "bg-blue-400"
          } rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

const GlowingOrb = ({ delay = 0, theme }) => {
  const color = theme === "dark" ? "34,197,94" : "59,91,255";
  
  return (
    <motion.div
      className="absolute w-96 h-96 rounded-full"
      style={{
        background: `radial-linear(circle, rgba(${color},0.3) 0%, rgba(${color},0) 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay: delay,
      }}
    />
  );
};

const FeatureCard = ({ icon, title, description, delay, theme }) => {
  const linearClass = theme === "dark"
    ? "from-green-400/20 to-emerald-400/20"
    : "from-blue-400/20 to-indigo-400/20";
  
  const borderColor = theme === "dark"
    ? "border-green-400/20 hover:border-green-400/50"
    : "border-blue-400/20 hover:border-blue-400/50";
  
  const bgColor = theme === "dark"
    ? "bg-gray-900/50"
    : "bg-white/50";
  
  const titleColor = theme === "dark"
    ? "text-green-400"
    : "text-[#2643B3]";
  
  const textColor = theme === "dark"
    ? "text-gray-300"
    : "text-[#5A678A]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3 }
      }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-linear-to-r ${linearClass} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100`} />

      <div className={`relative ${bgColor} backdrop-blur-xl border ${borderColor} rounded-2xl p-8 transition-all duration-300`}>
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className={`text-2xl font-bold ${titleColor} mb-3`}>{title}</h3>
        <p className={`${textColor} leading-relaxed`} style={{fontFamily:"cursive"}}>{description}</p>
      </div>
    </motion.div>
  );
};

const LandingPage = ({ theme }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const bglinear = theme === "dark"
    ? "from-gray-900 via-gray-800 to-gray-900"
    : "from-[#F8FAFF] via-[#EDF2FF] to-[#F8FAFF]";

  const textColor = theme === "dark" ? "text-white" : "text-[#1E3A8A]";
  const secondaryTextColor = theme === "dark" ? "text-gray-300" : "text-[#5A678A]";
  const headinglinear = theme === "dark"
    ? "from-green-400 via-emerald-400 to-green-400"
    : "from-[#2A3A68] via-[#4F62C2] to-[#2A3A68]";
  
  const buttonlinear = theme === "dark"
    ? "from-green-500 to-emerald-500"
    : "from-[#3B5BFF] to-[#2F49D1]";
  
  const buttonHoverlinear = theme === "dark"
    ? "from-emerald-500 to-green-500"
    : "from-[#2F49D1] to-[#3B5BFF]";
  
  const borderColor = theme === "dark"
    ? "border-green-400"
    : "border-[#3B5BFF]";
  
  const borderHoverBg = theme === "dark"
    ? "hover:bg-green-400/10"
    : "hover:bg-blue-400/10";

  return (
    <div className={`relative w-full min-h-screen overflow-hidden bg-linear-to-br ${bglinear} ${textColor}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <FloatingShape color="bg-green-400" size="w-72 h-72" top="15%" left="5%" delay={0} theme={theme} />
        <FloatingShape color="bg-emerald-400" size="w-56 h-56" top="60%" left="80%" delay={4} theme={theme} />
        <FloatingShape color="bg-green-300" size="w-64 h-64" top="40%" left="50%" delay={2} theme={theme} />
        <ParticleField theme={theme} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <motion.div style={{ opacity, scale }} className="w-full">
          {/* Glowing Orbs */}
          <div className="absolute top-1/4 left-1/4 pointer-events-none">
            <GlowingOrb delay={0} theme={theme} />
          </div>
          <div className="absolute bottom-1/4 right-1/4 pointer-events-none">
            <GlowingOrb delay={2} theme={theme} />
          </div>

          <div className="container mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row items-center gap-16">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 z-10"
              >
                <div className="inline-block mb-4 rounded-full max-w-full">
                  <h1 
                    className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                    style={{ 
                      fontFamily: "'Permanent Marker', cursive",
                      wordBreak: "keep-all",
                      overflowWrap: "break-word",
                      whiteSpace: "normal"
                    }}
                  >
                    {"Empower Your Campus.".split(" ").map((word, wordIndex) => (
                      <span key={wordIndex} style={{ display: "inline-block", whiteSpace: "nowrap", marginRight: "0.3em" }}>
                        {word.split("").map((char, charIndex) => (
                          <motion.span
                            key={charIndex}
                            className={`inline-block bg-linear-to-r ${headinglinear} bg-clip-text text-transparent cursor-default`}
                            whileHover={{
                              textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
                              filter: "brightness(0.3)",
                              scale: 1.1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </span>
                    ))}
                  </h1>
                </div>
                
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-5xl md:text-6xl font-bold ${textColor} mb-6`}
                >
                  Vote Smarter.
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-xl ${secondaryTextColor} mb-8 leading-relaxed max-w-xl`}
                >
                  Experience the future of campus democracy with our secure, real-time voting platform designed for the next generation of student leaders.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: theme === "dark" ? "0 0 30px rgba(34,197,94,0.5)" : "0 0 30px rgba(59,91,255,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group bg-linear-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold overflow-hidden"
                    style={{ background: theme === "dark" ? undefined : "linear-linear(to right, #3B5BFF, #2F49D1)" }}
                  >
                    <Link to="/signup" className="relative z-10">
                      Get Started
                    </Link>
                    <motion.div
                      className={`absolute inset-0 bg-linear-to-r ${buttonHoverlinear} opacity-0 group-hover:opacity-100 transition-opacity`}
                      whileHover={{ scale: 1.1 }}
                    />
                  </motion.div>

                  <motion.a
                    href="#demo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative border-2 ${borderColor} px-8 py-4 rounded-xl font-semibold backdrop-blur-sm ${borderHoverBg} transition-all duration-300`}
                    style={{ color: theme === "dark" ? "#4ade80" : "#3B5BFF" }}
                  >
                    Watch Demo
                    <motion.span
                      className={`absolute inset-0 border-2 ${borderColor} rounded-xl`}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.a>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex gap-8 mt-12"
                >
                  {[
                    { value: "50K+", label: "Active Users" },
                    { value: "99.9%", label: "Uptime" },
                    { value: "500+", label: "Campuses" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-3xl font-bold ${theme === "dark" ? "text-green-400" : "text-[#3B5BFF]"}`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-[#8B92B8]"}`}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right 3D-like Display */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{
                  rotateY: mousePosition.x * 0.5,
                  rotateX: -mousePosition.y * 0.5,
                }}
                className="flex-1 relative perspective-1000"
              >
                <div className="relative">
                  {/* Floating Card Effect */}
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-4 bg-linear-to-r ${
                      theme === "dark" ? "from-green-400 to-emerald-400" : "from-blue-400 to-indigo-400"
                    } rounded-3xl blur-3xl opacity-30`} />
                    
                    {/* Main Card */}
                    <div className={`relative bg-linear-to-br ${
                      theme === "dark" ? "from-gray-800/90 to-gray-900/90" : "from-white/90 to-blue-50/90"
                    } backdrop-blur-xl border ${
                      theme === "dark" ? "border-green-400/30" : "border-blue-400/30"
                    } rounded-3xl p-8 shadow-2xl`}>
                      <div className={`aspect-video bg-linear-to-br ${
                        theme === "dark" ? "from-green-900/30 to-emerald-900/30" : "from-blue-100/50 to-indigo-100/50"
                      } rounded-2xl flex items-center justify-center overflow-hidden`}>
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, 0],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                          }}
                          className="text-9xl"
                        >
                          🗳️
                        </motion.div>
                      </div>
                      
                      {/* Floating Elements */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`absolute -top-6 -right-6 ${
                          theme === "dark" ? "bg-green-500" : "bg-[#3B5BFF]"
                        } text-white px-6 py-3 rounded-full font-bold shadow-lg`}
                      >
                        Live Now!
                      </motion.div>
                      
                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        className={`absolute -bottom-4 -left-4 ${
                          theme === "dark" ? "bg-emerald-500" : "bg-[#4F62C2]"
                        } text-white px-6 py-3 rounded-full font-bold shadow-lg`}
                      >
                        100% Secure
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className={`bg-linear-to-r ${headinglinear} bg-clip-text text-transparent`}>
                Why Choose VoteByte?
              </span>
            </h2>
            <p className={`text-xl ${theme === "dark" ? "text-gray-400" : "text-[#8B92B8]"} max-w-2xl mx-auto`}>
              Built with cutting-edge technology to ensure every vote counts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔒"
              title="Bank-Level Security"
              description="End-to-end encryption with blockchain verification ensures your vote is protected and tamper-proof."
              delay={0}
              theme={theme}
            />
            <FeatureCard
              icon="⚡"
              title="Real-Time Results"
              description="Watch democracy in action with live vote counting and instant result updates as they happen."
              delay={0.2}
              theme={theme}
            />
            <FeatureCard
              icon="📱"
              title="Mobile First"
              description="Vote anywhere, anytime from any device. Our responsive design works seamlessly on all platforms."
              delay={0.4}
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`absolute inset-0 bg-linear-to-r ${
              theme === "dark" ? "from-green-500 to-emerald-500" : "from-blue-500 to-indigo-500"
            } rounded-3xl blur-3xl opacity-20`} />
            <div className={`relative bg-linear-to-br ${
              theme === "dark" ? "from-gray-800/80 to-gray-900/80" : "from-white/80 to-blue-50/80"
            } backdrop-blur-xl border ${
              theme === "dark" ? "border-green-400/30" : "border-blue-400/30"
            } rounded-3xl p-16 text-center`}>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${textColor}`}>
                Ready to Transform Your Campus Elections?
              </h2>
              <p className={`text-xl ${secondaryTextColor} mb-10 max-w-2xl mx-auto`}>
                Join thousands of students already using VoteByte to make their voices heard.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-block bg-linear-to-r ${buttonlinear} text-white px-12 py-5 rounded-xl font-bold text-lg shadow-lg transition-all`}
                style={{ 
                  boxShadow: theme === "dark" 
                    ? "0 10px 40px rgba(34,197,94,0.3)" 
                    : "0 10px 40px rgba(59,91,255,0.3)" 
                }}
              >
                <Link to="/signup">
                  Start Voting Today
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;