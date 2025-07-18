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
        emailVerified: true,
        phone: '+250788123456'
      }
    });

    console.log('✅ Admin user created');

    // Create vendor users
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    const vendor1 = await prisma.user.create({
      data: {
        firstName: 'Jean',
        lastName: 'Uwimana',
        email: 'jean@iwanyu.com',
        password: vendorPassword,
        role: 'VENDOR',
        isActive: true,
        emailVerified: true,
        phone: '+250788234567'
      }
    });

    const vendor2 = await prisma.user.create({
      data: {
        firstName: 'Marie',
        lastName: 'Mukamana',
        email: 'marie@iwanyu.com',
        password: vendorPassword,
        role: 'VENDOR',
        isActive: true,
        emailVerified: true,
        phone: '+250788345678'
      }
    });

    // Create customer users
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer1 = await prisma.user.create({
      data: {
        firstName: 'David',
        lastName: 'Nkurunziza',
        email: 'david@iwanyu.com',
        password: customerPassword,
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true,
        phone: '+250788456789'
      }
    });

    const customer2 = await prisma.user.create({
      data: {
        firstName: 'Grace',
        lastName: 'Mutoni',
        email: 'grace@iwanyu.com',
        password: customerPassword,
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true,
        phone: '+250788567890'
      }
    });

    console.log('✅ Users created');

    // Create vendor profiles
    const vendorProfile1 = await prisma.vendor.create({
      data: {
        userId: vendor1.id,
        businessName: 'Uwimana Electronics',
        businessAddress: 'Kigali, Rwanda',
        businessPhone: '+250788234567',
        businessEmail: 'info@uwimana-electronics.com',
        description: 'Leading electronics retailer in Rwanda',
        businessType: 'RETAIL',
        taxId: 'TAX123456789',
        status: 'APPROVED',
        isVerified: true,
        reviewedBy: admin.id,
        reviewedAt: new Date()
      }
    });

    const vendorProfile2 = await prisma.vendor.create({
      data: {
        userId: vendor2.id,
        businessName: 'Mukamana Fashion',
        businessAddress: 'Kigali, Rwanda',
        businessPhone: '+250788345678',
        businessEmail: 'info@mukamana-fashion.com',
        description: 'Premium fashion and clothing store',
        businessType: 'RETAIL',
        taxId: 'TAX987654321',
        status: 'APPROVED',
        isVerified: true,
        reviewedBy: admin.id,
        reviewedAt: new Date()
      }
    });

    console.log('✅ Vendor profiles created');

    // Create categories
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics'
      },
      {
        name: 'Fashion',
        description: 'Clothing and fashion accessories',
        slug: 'fashion'
      },
      {
        name: 'Home & Living',
        description: 'Home decor and living essentials',
        slug: 'home-living'
      },
      {
        name: 'Books',
        description: 'Books and educational materials',
        slug: 'books'
      },
      {
        name: 'Sports',
        description: 'Sports equipment and accessories',
        slug: 'sports'
      }
    ];

    const createdCategories = await Promise.all(
      categories.map(category => prisma.category.create({ data: category }))
    );

    console.log('✅ Categories created');

    // Create products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced features',
        price: 1500000,
        stock: 50,
        categoryId: createdCategories[0].id,
        vendorId: vendorProfile1.id,
        slug: 'iphone-15-pro',
        tags: ['smartphone', 'apple', 'premium'],
        isActive: true
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone',
        price: 1200000,
        stock: 30,
        categoryId: createdCategories[0].id,
        vendorId: vendorProfile1.id,
        slug: 'samsung-galaxy-s24',
        tags: ['smartphone', 'samsung', 'android'],
        isActive: true
      },
      {
        name: 'Designer Dress',
        description: 'Elegant evening dress',
        price: 80000,
        stock: 20,
        categoryId: createdCategories[1].id,
        vendorId: vendorProfile2.id,
        slug: 'designer-dress',
        tags: ['dress', 'fashion', 'elegant'],
        isActive: true
      },
      {
        name: 'Casual T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 15000,
        stock: 100,
        categoryId: createdCategories[1].id,
        vendorId: vendorProfile2.id,
        slug: 'casual-t-shirt',
        tags: ['t-shirt', 'casual', 'cotton'],
        isActive: true
      },
      {
        name: 'Laptop Stand',
        description: 'Adjustable laptop stand for ergonomic working',
        price: 35000,
        stock: 25,
        categoryId: createdCategories[2].id,
        vendorId: vendorProfile1.id,
        slug: 'laptop-stand',
        tags: ['laptop', 'stand', 'ergonomic'],
        isActive: true
      }
    ];

    const createdProducts = await Promise.all(
      products.map(product => prisma.product.create({ data: product }))
    );

    console.log('✅ Products created');

    // Create product images
    const productImages = [
      // iPhone 15 Pro
      {
        productId: createdProducts[0].id,
        url: 'iphone-15-pro-1.jpg',
        altText: 'iPhone 15 Pro front view',
        isPrimary: true
      },
      {
        productId: createdProducts[0].id,
        url: 'iphone-15-pro-2.jpg',
        altText: 'iPhone 15 Pro back view',
        isPrimary: false
      },
      // Samsung Galaxy S24
      {
        productId: createdProducts[1].id,
        url: 'samsung-s24-1.jpg',
        altText: 'Samsung Galaxy S24 front view',
        isPrimary: true
      },
      // Designer Dress
      {
        productId: createdProducts[2].id,
        url: 'designer-dress-1.jpg',
        altText: 'Designer dress full view',
        isPrimary: true
      },
      // Casual T-Shirt
      {
        productId: createdProducts[3].id,
        url: 'casual-tshirt-1.jpg',
        altText: 'Casual t-shirt front view',
        isPrimary: true
      },
      // Laptop Stand
      {
        productId: createdProducts[4].id,
        url: 'laptop-stand-1.jpg',
        altText: 'Laptop stand in use',
        isPrimary: true
      }
    ];

    await Promise.all(
      productImages.map(image => prisma.productImage.create({ data: image }))
    );

    console.log('✅ Product images created');

    // Create product variants
    const productVariants = [
      // iPhone 15 Pro variants
      {
        productId: createdProducts[0].id,
        name: 'Storage',
        value: '128GB',
        price: 0,
        stock: 20
      },
      {
        productId: createdProducts[0].id,
        name: 'Storage',
        value: '256GB',
        price: 200000,
        stock: 20
      },
      {
        productId: createdProducts[0].id,
        name: 'Storage',
        value: '512GB',
        price: 400000,
        stock: 10
      },
      // Designer Dress variants
      {
        productId: createdProducts[2].id,
        name: 'Size',
        value: 'S',
        price: 0,
        stock: 5
      },
      {
        productId: createdProducts[2].id,
        name: 'Size',
        value: 'M',
        price: 0,
        stock: 10
      },
      {
        productId: createdProducts[2].id,
        name: 'Size',
        value: 'L',
        price: 0,
        stock: 5
      },
      // Casual T-Shirt variants
      {
        productId: createdProducts[3].id,
        name: 'Size',
        value: 'S',
        price: 0,
        stock: 25
      },
      {
        productId: createdProducts[3].id,
        name: 'Size',
        value: 'M',
        price: 0,
        stock: 35
      },
      {
        productId: createdProducts[3].id,
        name: 'Size',
        value: 'L',
        price: 0,
        stock: 25
      },
      {
        productId: createdProducts[3].id,
        name: 'Size',
        value: 'XL',
        price: 0,
        stock: 15
      }
    ];

    await Promise.all(
      productVariants.map(variant => prisma.productVariant.create({ data: variant }))
    );

    console.log('✅ Product variants created');

    // Create reviews
    const reviews = [
      {
        userId: customer1.id,
        productId: createdProducts[0].id,
        rating: 5,
        comment: 'Excellent phone! Very fast and great camera quality.'
      },
      {
        userId: customer2.id,
        productId: createdProducts[0].id,
        rating: 4,
        comment: 'Good phone but a bit expensive.'
      },
      {
        userId: customer1.id,
        productId: createdProducts[2].id,
        rating: 5,
        comment: 'Beautiful dress, perfect fit and great quality.'
      },
      {
        userId: customer2.id,
        productId: createdProducts[3].id,
        rating: 4,
        comment: 'Comfortable t-shirt, good value for money.'
      }
    ];

    await Promise.all(
      reviews.map(review => prisma.review.create({ data: review }))
    );

    console.log('✅ Reviews created');

    // Create banners
    const banners = [
      {
        title: 'Welcome to Iwanyu',
        subtitle: 'Your trusted marketplace in Rwanda',
        buttonText: 'Shop Now',
        buttonUrl: '/products',
        position: 'HERO',
        image: 'hero-banner.jpg',
        isActive: true
      },
      {
        title: 'Electronics Sale',
        subtitle: 'Up to 30% off on all electronics',
        buttonText: 'View Deals',
        buttonUrl: '/products?category=electronics',
        position: 'PROMOTIONAL',
        image: 'electronics-sale.jpg',
        isActive: true
      },
      {
        title: 'Fashion Week',
        subtitle: 'Latest fashion trends',
        buttonText: 'Explore',
        buttonUrl: '/products?category=fashion',
        position: 'SECONDARY',
        image: 'fashion-week.jpg',
        isActive: true
      }
    ];

    await Promise.all(
      banners.map(banner => prisma.banner.create({ data: banner }))
    );

    console.log('✅ Banners created');

    // Create sample orders
    const order1 = await prisma.order.create({
      data: {
        userId: customer1.id,
        total: 1500000,
        status: 'DELIVERED',
        shippingAddress: 'Kigali, Rwanda',
        paidAt: new Date(),
        deliveredAt: new Date()
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: createdProducts[0].id,
        quantity: 1,
        price: 1500000
      }
    });

    // Create sample payment
    await prisma.payment.create({
      data: {
        orderId: order1.id,
        userId: customer1.id,
        amount: 1500000,
        currency: 'RWF',
        provider: 'FLUTTERWAVE',
        transactionRef: 'iwanyu_sample_123',
        transactionId: 'flw_123456789',
        status: 'COMPLETED',
        paidAt: new Date()
      }
    });

    console.log('✅ Sample orders and payments created');

    // Create sample conversations
    const conversation1 = await prisma.conversation.create({
      data: {
        buyerId: customer1.id,
        sellerId: vendor1.id,
        productId: createdProducts[0].id
      }
    });

    await prisma.message.create({
      data: {
        conversationId: conversation1.id,
        userId: customer1.id,
        content: 'Hi, is this iPhone still available?'
      }
    });

    await prisma.message.create({
      data: {
        conversationId: conversation1.id,
        userId: vendor1.id,
        content: 'Yes, it is! We have it in stock.',
        isRead: true,
        readAt: new Date()
      }
    });

    console.log('✅ Sample conversations created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Demo accounts:');
    console.log('Admin: admin@iwanyu.com / admin123');
    console.log('Vendor 1: jean@iwanyu.com / vendor123');
    console.log('Vendor 2: marie@iwanyu.com / vendor123');
    console.log('Customer 1: david@iwanyu.com / customer123');
    console.log('Customer 2: grace@iwanyu.com / customer123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
