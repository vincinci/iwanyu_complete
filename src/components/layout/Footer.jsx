import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  ArrowRight
} from 'lucide-react';
import IwanyuLogo from '../common/IwanyuLogo';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="border-b border-gray-200 py-12"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-900 mb-4">
              Stay in the loop
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Get notified about new products and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <IwanyuLogo className="w-12 h-12" textClassName="text-3xl" />
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Rwanda's premier marketplace where innovation meets elegance. 
                Connecting visionary creators with discerning customers.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-gray-100 hover:bg-orange-500 rounded-xl flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { name: 'All Products', href: '/products' },
                  { name: 'Categories', href: '/categories' },
                  { name: 'Vendors', href: '/vendors' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact', href: '/contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Customer Service */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Service</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Help Center', href: '/help' },
                  { name: 'Returns & Refunds', href: '/returns' },
                  { name: 'Shipping Info', href: '/shipping' },
                  { name: 'Track Order', href: '/track' },
                  { name: 'Size Guide', href: '/size-guide' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="text-gray-600">
                    Kigali, Rwanda
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Phone className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="text-gray-600">
                    +250 788 123 456
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="text-gray-600">
                    hello@iwanyu.rw
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-8 pb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Your transactions are protected with bank-level security"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Quick and reliable delivery across Rwanda"
              },
              {
                icon: CreditCard,
                title: "Easy Returns",
                description: "Hassle-free returns and refunds within 30 days"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-orange-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              © 2024 Iwanyu. Crafted with ❤️ in Rwanda.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-500 hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-orange-500 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
