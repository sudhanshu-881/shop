import { createClient } from '@supabase/supabase-js';
import { config } from '../src/config';
import logger from '../src/utils/logger';

const runSeeders = async () => {
  try {
    const supabase = createClient(config.database.url, config.database.serviceRoleKey);

    logger.info('Starting database seeding...');

    // Seed suppliers
    const suppliers = [
      {
        name: 'Parle Distributors',
        contact_person: 'Ramesh Patel',
        phone: '9876543210',
        address: 'Mumbai, Maharashtra',
        balance: 15000
      },
      {
        name: 'Amul Dairy',
        contact_person: 'Sita Sharma',
        phone: '9876543211',
        address: 'Anand, Gujarat',
        balance: 22000
      },
      {
        name: 'Tata Chemicals',
        contact_person: 'Vijay Kumar',
        phone: '9876543212',
        address: 'Delhi, NCR',
        balance: 5000
      },
      {
        name: 'Adani Wilmar',
        contact_person: 'Anjali Mehta',
        phone: '9876543213',
        address: 'Ahmedabad, Gujarat',
        balance: 0
      },
      {
        name: 'Nestle India',
        contact_person: 'Arun Singh',
        phone: '9876543214',
        address: 'Gurgaon, Haryana',
        balance: 8500
      }
    ];

    const { data: seededSuppliers, error: supplierError } = await supabase
      .from('suppliers')
      .insert(suppliers)
      .select();

    if (supplierError) {
      throw supplierError;
    }

    logger.info(`Seeded ${seededSuppliers.length} suppliers`);

    // Seed customers
    const customers = [
      {
        name: 'Anita Desai',
        phone: '9123456780',
        balance: 150.50
      },
      {
        name: 'Vikram Singh',
        phone: '9123456781',
        balance: 0
      },
      {
        name: 'Pooja Sharma',
        phone: '9123456782',
        balance: 320.00
      },
      {
        name: 'Rohan Joshi',
        phone: '9123456783',
        balance: 75.00
      }
    ];

    const { data: seededCustomers, error: customerError } = await supabase
      .from('customers')
      .insert(customers)
      .select();

    if (customerError) {
      throw customerError;
    }

    logger.info(`Seeded ${seededCustomers.length} customers`);

    // Seed products
    const products = [
      {
        name: 'Parle-G Biscuits',
        category: 'Biscuits',
        stock: 15,
        low_stock_threshold: 20,
        price: 10,
        cost: 7,
        expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplier_id: seededSuppliers[0].id,
        image_url: 'https://picsum.photos/seed/parleg/200',
        variants: ['50g', '100g'],
        barcode: '8901719125211'
      },
      {
        name: 'Amul Gold Milk',
        category: 'Dairy',
        stock: 8,
        low_stock_threshold: 10,
        price: 27,
        cost: 22,
        expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplier_id: seededSuppliers[1].id,
        image_url: 'https://picsum.photos/seed/amul/200',
        variants: ['500ml', '1L'],
        barcode: '8901262020054'
      },
      {
        name: 'Tata Salt',
        category: 'Spices',
        stock: 50,
        low_stock_threshold: 15,
        price: 20,
        cost: 15,
        expiry_date: '2025-12-31',
        supplier_id: seededSuppliers[2].id,
        image_url: 'https://picsum.photos/seed/tatasalt/200',
        barcode: '8904014101103'
      },
      {
        name: 'Fortune Sunlite Oil',
        category: 'Oils',
        stock: 25,
        low_stock_threshold: 10,
        price: 150,
        cost: 130,
        expiry_date: '2025-08-15',
        supplier_id: seededSuppliers[3].id,
        image_url: 'https://picsum.photos/seed/fortuneoil/200',
        variants: ['1L Pouch', '5L Jar']
      },
      {
        name: 'Maggi Noodles',
        category: 'Snacks',
        stock: 30,
        low_stock_threshold: 25,
        price: 12,
        cost: 9,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplier_id: seededSuppliers[4].id,
        image_url: 'https://picsum.photos/seed/maggi/200',
        variants: ['Single Pack', 'Pack of 4'],
        barcode: '8901058862358'
      }
    ];

    const { data: seededProducts, error: productError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productError) {
      throw productError;
    }

    logger.info(`Seeded ${seededProducts.length} products`);

    // Seed transactions
    const transactions = [
      {
        customer_id: seededCustomers[0].id,
        type: 'credit',
        amount: 200.50,
        description: 'Purchase of groceries'
      },
      {
        customer_id: seededCustomers[0].id,
        type: 'payment',
        amount: 50.00,
        description: 'Partial payment'
      },
      {
        customer_id: seededCustomers[2].id,
        type: 'credit',
        amount: 320.00,
        description: 'Monthly grocery purchase'
      },
      {
        customer_id: seededCustomers[3].id,
        type: 'credit',
        amount: 75.00,
        description: 'Small purchase'
      }
    ];

    const { data: seededTransactions, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (transactionError) {
      throw transactionError;
    }

    logger.info(`Seeded ${seededTransactions.length} transactions`);

    // Seed supplier transactions
    const supplierTransactions = [
      {
        supplier_id: seededSuppliers[0].id,
        type: 'purchase',
        amount: 20000,
        description: 'Biscuit stock purchase'
      },
      {
        supplier_id: seededSuppliers[0].id,
        type: 'payment',
        amount: 5000,
        description: 'Partial payment to supplier'
      },
      {
        supplier_id: seededSuppliers[1].id,
        type: 'purchase',
        amount: 22000,
        description: 'Dairy products purchase'
      }
    ];

    const { data: seededSupplierTransactions, error: supplierTransactionError } = await supabase
      .from('supplier_transactions')
      .insert(supplierTransactions)
      .select();

    if (supplierTransactionError) {
      throw supplierTransactionError;
    }

    logger.info(`Seeded ${seededSupplierTransactions.length} supplier transactions`);

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();