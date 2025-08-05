import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import "../css/LandingPage.css";

const LandingPage = () => {
  const { isAuthenticated } = useSelector((state) => state.AuthReducer);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      text: "History lives in stories and stories are meant to be heard.",
    author: "SilAI Team"
    },
    {
      text: "A revolution is a struggle to the death between the future and the past.",
    author: "Fidel Castro"
    },
    {
      text: "We are not makers of history. We are made by history.",
    author: "Martin Luther King Jr."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="landing-page">
      {/* Navigation Bar for Landing Page */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand">SilAI</Link>
          <div className="nav-links">
            {isAuthenticated ? (
              <Link to="/home" className="nav-link">Dashboard</Link>
            ) : (
              <Link to="/login" className="nav-link">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ perspective: 1000 }}
          animate={{ perspective: 1000 }}
          style={{ perspective: 1000 }}
        >
          <div 
            className="hero-text"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h1 
              className="hero-title"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span
                style={{ 
                  display: "inline-block",
                  transformStyle: "preserve-3d"
                }}
              >
                Welcome to 
              </span>
              <span 
                className="brand-highlight"
                style={{ 
                  display: "inline-block",
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center"
                }}
              >
                SilAI
              </span>
            </h1>
            <div className="testimonial-slider">
              <p className="hero-subtitle testimonial-text">
                {testimonials[currentTestimonial].text}
              </p>
              <span className="testimonial-author">
                — {testimonials[currentTestimonial].author}
              </span>
            </div>
            <div 
              className="hero-description-container"
              style={{ transformStyle: "preserve-3d" }}
            >
              <p className="hero-description">
                Converse with the minds that shaped civilizations. Learn from their experiences, and gain insights that shaped our world.
              </p>
              <p className="hero-description highlight-text">
                SilAI brings the past to life through the fusion of History and AI.
              </p>
            </div>
            <div 
              className="cta-buttons"
              style={{ transformStyle: "preserve-3d" }}
            >
              {isAuthenticated ? (
                <div
                  className="cta-wrapper"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link to="/home" className="cta-primary">
                    <span>
                      Go to Dashboard
                    </span>
                    <div className="button-shine" />
                  </Link>
                </div>
              ) : (
                <div
                  className="cta-wrapper"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link to="/signup" className="cta-primary">
                    <span>
                      Start Your Journey
                    </span>
                    <div className="button-shine" />
                  </Link>
                </div>
              )}
            </div>
          </div>
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ 
              duration: 1.2, 
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <motion.div 
              className="floating-card"
              animate={{ 
                y: [0, -15, 0],
                rotateX: [0, 2, 0, -2, 0],
                rotateY: [0, 3, 0, -3, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.08,
                rotateX: 8,
                rotateY: 12,
                z: 30,
                transition: { 
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -15;
                const rotateY = (x - centerX) / centerX * 15;
                
                event.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
              }}
              style={{ 
                transformStyle: "preserve-3d",
                transition: "transform 0.2s ease-out"
              }}
            >
              <motion.div 
                className="card-glow"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="card-content">
                <div className="chat-preview">
                  <motion.div 
                    className="chat-bubble user"
                    initial={{ opacity: 0, x: -30, rotateY: -20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ 
                      delay: 1.5, 
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      z: 10,
                      transition: { duration: 0.3 }
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <p>What inspired you to lead India's independence movement?</p>
                  </motion.div>
                  <motion.div 
                    className="chat-bubble ai"
                    initial={{ opacity: 0, x: 30, rotateY: 20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ 
                      delay: 2.2, 
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: -5,
                      z: 10,
                      transition: { duration: 0.3 }
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.8, duration: 1.2 }}
                    >
                      The desire for freedom burns in every human heart...
                    </motion.p>
                  </motion.div>
                </div>
                <motion.h3
                  initial={{ opacity: 0, y: 20, rotateX: -20 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    delay: 3.5, 
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotateX: 5,
                    color: "#FFD700",
                    transition: { duration: 0.3 }
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  Chat with Leaders
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20, rotateX: -20 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    delay: 4, 
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateX: 3,
                    transition: { duration: 0.3 }
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  Experience history through AI-powered conversations
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Animated Background Elements */}
        <div className="floating-elements">
          <motion.div 
            className="float-element element-1"
            animate={{ 
              y: [0, -40, 0],
              x: [0, 20, 0],
              rotate: [0, 180, 360],
              rotateX: [0, 15, 0, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformStyle: "preserve-3d" }}
          />
          <motion.div 
            className="float-element element-2"
            animate={{ 
              y: [0, 50, 0],
              x: [0, -30, 0],
              rotate: [0, -180, -360],
              rotateY: [0, 20, 0, -20, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            style={{ transformStyle: "preserve-3d" }}
          />
          <motion.div 
            className="float-element element-3"
            animate={{ 
              y: [0, -35, 0],
              x: [0, 35, 0],
              rotate: [0, 90, 180, 270, 360],
              rotateZ: [0, 30, 0, -30, 0],
              scale: [1, 1.4, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            style={{ transformStyle: "preserve-3d" }}
          />
          <motion.div 
            className="float-element element-4"
            animate={{ 
              y: [0, 45, 0],
              x: [0, -25, 0],
              rotate: [0, 270, 540],
              rotateX: [0, -25, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 13,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 6
            }}
            style={{ transformStyle: "preserve-3d" }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose SilAI?
          </motion.h2>
          <div className="features-grid">
            {[
              {
                icon: "🧠",
                title: "AI-Powered Conversations",
                description: "Engage with historically accurate AI representations of legendary leaders"
              },
              {
                icon: "📚",
                title: "Rich Historical Context", 
                description: "Learn from comprehensive databases of speeches, writings, and documented thoughts"
              },
              {
                icon: "🌟",
                title: "Interactive Learning",
                description: "Experience history like never before through immersive, personalized interactions"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What People Are Saying
          </motion.h2>
          
          <div className="testimonials-grid">
            {testimonials.map((item, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "{item.text}"
                  </p>
                  <p className="testimonial-author">
                    — {item.author}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaders Preview Section */}
      <section className="leaders-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Meet Our Leaders
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover wisdom from some of history's most influential figures
          </motion.p>
          <div className="leaders-preview">
            {[
              {
                initials: "MB",
                name: "Mahatma Gandhi",
                description: "Learn about non-violence and civil rights"
              },
              {
                initials: "SB", 
                name: "Subhas Chandra Bose",
                description: "Explore revolutionary leadership and patriotism"
              },
              {
                initials: "AB",
                name: "Annie Besant", 
                description: "Understand social reform and women's rights"
              }
            ].map((leader, index) => (
              <motion.div
                key={index}
                className="leader-preview-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="leader-avatar">
                  <div className="avatar-placeholder">{leader.initials}</div>
                </div>
                <h4>{leader.name}</h4>
                <p>{leader.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.div 
            className="leaders-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <Link to="/signup" className="explore-button">
              Explore All Leaders
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <div className="steps-container">
            {[
              {
                number: "1",
                title: "Sign Up",
                description: "Create your account in seconds"
              },
              {
                number: "2", 
                title: "Choose a Leader",
                description: "Select from our collection of historical figures"
              },
              {
                number: "3",
                title: "Start Chatting", 
                description: "Begin your journey through history"
              }
            ].map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
                  className="step"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </motion.div>
                {index < 2 && (
                  <motion.div 
                    className="step-connector"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                    viewport={{ once: true }}
                  ></motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="container">
          <motion.div 
            className="footer-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="footer-brand"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>SilAI</h3>
              <p>Bridging the past and future through AI</p>
            </motion.div>
            <motion.div 
              className="footer-links"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="link-group">
                <h4>Product</h4>
                <Link to="/signup">Sign Up</Link>
                <Link to="/login">Login</Link>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="footer-bottom"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 SilAI. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
