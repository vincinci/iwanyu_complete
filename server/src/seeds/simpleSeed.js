const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.chatMessage.deleteMany();
    await prisma.chatRoom.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@iwanyu.com',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        phone: '+250788123456'
      }
    });

    console.log('✅ Admin user created');

    // Create vendor user
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    const vendor1 = await prisma.user.create({
      data: {
        firstName: 'Jean',
        lastName: 'Uwimana',
        email: 'jean@iwanyu.com',
        password: vendorPassword,
        role: 'VENDOR',
        isActive: true,
        isVerified: true,
        phone: '+250788234567'
      }
    });

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer1 = await prisma.user.create({
      data: {
        firstName: 'David',
        lastName: 'Nkurunziza',
        email: 'david@iwanyu.com',
        password: customerPassword,
        role: 'CUSTOMER',
        isActive: true,
        isVerified: true,
        phone: '+250788456789'
      }
    });

    console.log('✅ Users created');

    // Create vendor profile
    const vendorProfile1 = await prisma.vendor.create({
      data: {
        userId: vendor1.id,
        businessName: 'Uwimana Electronics',
        businessPhone: '+250788234567',
        businessAddress: 'Kigali, Rwanda',
        businessLicense: 'LIC123456',
        taxId: 'TAX123456789',
        description: 'Leading electronics retailer in Rwanda',
        status: 'APPROVED',
        isActive: true
      }
    });

    console.log('✅ Vendor profile created');

    // Create categories
    const electronics = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true
      }
    });

    const fashion = await prisma.category.create({
      data: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and fashion accessories',
        isActive: true
      }
    });

    console.log('✅ Categories created');

    // Create products
    const product1 = await prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Latest iPhone with advanced features',
        price: 1500000,
        comparePrice: 1800000,
        sku: 'IPHONE15PRO',
        stock: 50,
        categoryId: electronics.id,
        vendorId: vendorProfile1.id,
        tags: ['smartphone', 'apple', 'premium'],
        isActive: true
      }
    });

    const product2 = await prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Premium Android smartphone',
        price: 1200000,
        comparePrice: 1400000,
        sku: 'SAMSUNGS24',
        stock: 30,
        categoryId: electronics.id,
        vendorId: vendorProfile1.id,
        tags: ['smartphone', 'samsung', 'android'],
        isActive: true
      }
    });

    console.log('✅ Products created');

    // Create product variants
    await prisma.productVariant.create({
      data: {
        productId: product1.id,
        name: 'Storage',
        value: '128GB',
        price: 0,
        stock: 20
      }
    });

    await prisma.productVariant.create({
      data: {
        productId: product1.id,
        name: 'Storage',
        value: '256GB',
        price: 200000,
        stock: 20
      }
    });

    console.log('✅ Product variants created');

    // Create a banner
    await prisma.banner.create({
      data: {
        title: 'Welcome to Iwanyu',
        subtitle: 'Your trusted marketplace in Rwanda',
        image: 'hero-banner.jpg',
        link: '/products',
        position: 'hero',
        isActive: true
      }
    });

    console.log('✅ Banner created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Demo accounts:');
    console.log('Admin: admin@iwanyu.com / admin123');
    console.log('Vendor: jean@iwanyu.com / vendor123');
    console.log('Customer: david@iwanyu.com / customer123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
