-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for suppliers table
CREATE POLICY "Users can view all suppliers" ON suppliers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update suppliers" ON suppliers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete suppliers" ON suppliers
    FOR DELETE USING (true);

-- Create policies for customers table
CREATE POLICY "Users can view all customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE USING (true);

-- Create policies for products table
CREATE POLICY "Users can view all products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (true);

-- Create policies for transactions table
CREATE POLICY "Users can view all transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update transactions" ON transactions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete transactions" ON transactions
    FOR DELETE USING (true);

-- Create policies for supplier_transactions table
CREATE POLICY "Users can view all supplier transactions" ON supplier_transactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert supplier transactions" ON supplier_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update supplier transactions" ON supplier_transactions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete supplier transactions" ON supplier_transactions
    FOR DELETE USING (true);