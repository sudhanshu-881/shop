type AllTranslations = {
  [key: string]: string | ((...args: any[]) => string);
}

interface LanguageTranslations {
  en: AllTranslations,
  hi: AllTranslations
}

export const translations: LanguageTranslations = {
  en: {
    // Onboarding
    welcome: "Welcome to InvenShop!",
    setup: "Let's set up your digital shop in a few seconds.",
    shopNameLabel: "What is your shop's name?",
    shopNamePlaceholder: "e.g., Rajesh Kirana Store",
    shopTypeLabel: "What type of shop do you own?",
    shopTypePlaceholder: "e.g., Grocery, Cosmetics, Pharmacy",
    languageLabel: "Select Language",
    getStarted: "Get Started",

    // General
    dashboard: "Dashboard",
    inventory: "Inventory",
    khata: "Khata (Credit)",
    suppliers: "Suppliers",
    analytics: "Analytics",
    addProduct: "Add Product",
    cancel: "Cancel",
    all: "All",
    backToList: "Back to List",

    // App Header
    viewTitle: (view: string) => view.replace('-', ' ').toUpperCase(),

    // Dashboard
    totalProducts: "Total Products",
    lowStockItems: "Low Stock Items",
    expiringSoon: "Expiring Soon",
    totalCustomerDues: "Total Customer Dues",
    totalSupplierDues: "Total Supplier Dues",
    notAvailable: "N/A",
    quickActions: "Quick Actions",
    addNewProduct: "Add New Product",
    bulkImport: "Bulk Import",
    lowStockAlerts: "Low Stock Alerts",

    // Inventory
    fullInventory: "Full Inventory",
    searchPlaceholder: "Search for a product...",

    // Product Table
    product: "Product",
    stock: "Stock",
    price: "Price",
    expiryDate: "Expiry Date",
    status: "Status",
    lowStock: "Low Stock",
    expired: "Expired",
    inStock: "In Stock",
    noProducts: "No products to display.",

    // Modals
    // Add Product
    modalAddTitle: "Add New Product",
    productName: "Product Name",
    category: "Category",
    lowStockAt: "Low Stock At",
    costPrice: "Cost Price",
    sellingPrice: "Selling Price",
    supplier: "Supplier",
    noSuppliers: "Add a supplier first",
    variantsLabel: "Variants (e.g., Size, Color)",
    variantsPlaceholder: "e.g., 1kg, Red, Pack of 4",
    add: "Add",
    barcode: "Barcode",
    scanBarcode: "Scan Barcode",
    scanBarcodePlaceholder: "Scan or enter barcode",
    scanProductBarcode: "Scan Product Barcode",

    // Bulk Import
    modalImportTitle: "Bulk Import Products",
    importInstructions: "Import Instructions",
    importInfo: "Paste your product data below. Each line should represent one product, with fields separated by commas.",
    importFormat: "Format:",
    importExample: "Example:",
    importPlaceholder: "Paste your product data here...",
    importError: "Please paste some data to import.",
    importButton: "Import Products",
    
    // AI Assistant
    aiTitle: "Dukaan Mitra",
    aiWelcome: "Hello! I'm Dukaan Mitra, your smart shop assistant. How can I help you today?",
    aiPlaceholder: "Ask about your inventory...",
    aiSuggestions: "Suggestions",
    aiSuggestion1: "Which items are low on stock?",
    aiSuggestion2: "What's expiring soon?",
    aiSuggestion3: "Summarize my inventory",
    aiSuggestion4: "How can I increase sales?",
    aiSuggestion5: "What are my most profitable items?",
    aiGenerating: "Thinking...",
    
    // Notifications
    lowStockNotification: (name: string) => `Low stock alert for ${name}. An email notification has been sent.`,
    
    // Khata / Suppliers
    customerKhata: "Customer Khata",
    addCustomer: "Add Customer",
    searchCustomer: "Search customer...",
    noCustomers: "No customers found. Add your first customer to start managing credit.",
    customerName: "Customer Name",
    customerPhone: "Phone Number",
    balance: "Balance",
    transactionHistory: "Transaction History",
    noTransactions: "No transactions recorded.",
    addTransaction: "Add Transaction",
    amount: "Amount",
    transactionType: "Transaction Type",
    credit: "Credit (Udhaar)",
    payment: "Payment",
    saveTransaction: "Save Transaction",
    supplierKhata: "Supplier Hub",
    addSupplier: "Add Supplier",
    searchSupplier: "Search supplier...",
    noSuppliersFound: "No suppliers found. Add your first supplier to manage purchases.",
    supplierName: "Supplier Name",
    contactPerson: "Contact Person",
    address: "Address",
    purchase: "Purchase",

    // Analytics
    analyticsOverview: "Analytics Overview",
    totalInventoryValue: "Total Inventory Value",
    inventoryBreakdown: "Inventory Breakdown",
    stockStatus: "Stock Status",
    valueByCategory: "Inventory Value by Category",
    profitMarginByCategory: "Profit Margin by Category",
  },
  hi: {
    // Onboarding
    welcome: "इनवेनशॉप में आपका स्वागत है!",
    setup: "आइए कुछ ही सेकंड में आपकी डिजिटल दुकान स्थापित करें।",
    shopNameLabel: "आपकी दुकान का नाम क्या है?",
    shopNamePlaceholder: "उदा., राजेश किराना स्टोर",
    shopTypeLabel: "आप किस प्रकार की दुकान के मालिक हैं?",
    shopTypePlaceholder: "उदा., किराना, सौंदर्य प्रसाधन, फार्मेसी",
    languageLabel: "भाषा चुनें",
    getStarted: "शुरू करें",

    // General
    dashboard: "डैशबोर्ड",
    inventory: "इन्वेंटरी",
    khata: "खाता (उधार)",
    suppliers: "सप्लायर्स",
    analytics: "एनालिटिक्स",
    addProduct: "उत्पाद जोड़ें",
    cancel: "रद्द करें",
    all: "सभी",
    backToList: "सूची पर वापस जाएं",

    // App Header
    viewTitle: (view: string) => {
        const titles: { [key: string]: string } = {
            'dashboard': 'डैशबोर्ड',
            'inventory': 'इन्वेंटरी',
            'khata': 'ग्राहक खाता',
            'suppliers': 'सप्लायर्स',
            'analytics': 'एनालिटिक्स'
        };
        return titles[view] || view.toUpperCase();
    },

    // Dashboard
    totalProducts: "कुल उत्पाद",
    lowStockItems: "कम स्टॉक",
    expiringSoon: "जल्द समाप्त होगा",
    totalCustomerDues: "कुल ग्राहक बकाया",
    totalSupplierDues: "कुल सप्लायर बकाया",
    notAvailable: "N/A",
    quickActions: "त्वरित कार्रवाइयां",
    addNewProduct: "नया उत्पाद जोड़ें",
    bulkImport: "थोक आयात",
    lowStockAlerts: "कम स्टॉक अलर्ट",

    // Inventory
    fullInventory: "पूरी इन्वेंटरी",
    searchPlaceholder: "उत्पाद खोजें...",

    // Product Table
    product: "उत्पाद",
    stock: "स्टॉक",
    price: "कीमत",
    expiryDate: "समाप्ति तिथि",
    status: "स्थिति",
    lowStock: "कम स्टॉक",
    expired: "म्याद पूरी",
    inStock: "स्टॉक में",
    noProducts: "कोई उत्पाद नहीं।",

    // Modals
    // Add Product
    modalAddTitle: "नया उत्पाद जोड़ें",
    productName: "उत्पाद का नाम",
    category: "श्रेणी",
    lowStockAt: "कम स्टॉक पर",
    costPrice: "लागत मूल्य",
    sellingPrice: "बिक्री मूल्य",
    supplier: "प्रदायक",
    noSuppliers: "पहले एक सप्लायर जोड़ें",
    variantsLabel: "वेरिएंट (जैसे, आकार, रंग)",
    variantsPlaceholder: "उदा., 1 किलो, लाल, 4 का पैक",
    add: "जोड़ें",
    barcode: "बारकोड",
    scanBarcode: "बारकोड स्कैन करें",
    scanBarcodePlaceholder: "बारकोड स्कैन करें या दर्ज करें",
    scanProductBarcode: "उत्पाद बारकोड स्कैन करें",


    // Bulk Import
    modalImportTitle: "थोक में उत्पाद आयात करें",
    importInstructions: "आयात निर्देश",
    importInfo: "अपना उत्पाद डेटा नीचे पेस्ट करें। प्रत्येक पंक्ति में एक उत्पाद होना चाहिए, जिसमें फ़ील्ड अल्पविराम से अलग हों।",
    importFormat: "प्रारूप:",
    importExample: "उदाहरण:",
    importPlaceholder: "अपना उत्पाद डेटा यहाँ पेस्ट करें...",
    importError: "कृपया आयात करने के लिए कुछ डेटा पेस्ट करें।",
    importButton: "उत्पाद आयात करें",

    // AI Assistant
    aiTitle: "दुकान मित्र",
    aiWelcome: "नमस्ते! मैं दुकान मित्र हूं, आपका स्मार्ट दुकान सहायक। आज मैं आपकी क्या मदद कर सकता हूं?",
    aiPlaceholder: "अपनी इन्वेंट्री के बारे में पूछें...",
    aiSuggestions: "सुझाव",
    aiSuggestion1: "कौन से आइटम स्टॉक में कम हैं?",
    aiSuggestion2: "जल्द ही क्या समाप्त हो रहा है?",
    aiSuggestion3: "मेरी इन्वेंट्री का सारांश दें",
    aiSuggestion4: "मैं अपनी बिक्री कैसे बढ़ा सकता हूं?",
    aiSuggestion5: "मेरे सबसे ज़्यादा मुनाफ़े वाले आइटम कौन से हैं?",
    aiGenerating: "सोच रहा हूँ...",
    
    // Notifications
    lowStockNotification: (name: string) => `${name} के लिए कम स्टॉक की चेतावनी। एक ईमेल सूचना भेज दी गई है।`,
    
    // Khata / Suppliers
    customerKhata: "ग्राहक खाता",
    addCustomer: "ग्राहक जोड़ें",
    searchCustomer: "ग्राहक खोजें...",
    noCustomers: "कोई ग्राहक नहीं मिला। उधार प्रबंधित करने के लिए अपना पहला ग्राहक जोड़ें।",
    customerName: "ग्राहक का नाम",
    customerPhone: "फ़ोन नंबर",
    balance: "शेष",
    transactionHistory: "लेन-देन का इतिहास",
    noTransactions: "कोई लेन-देन दर्ज नहीं किया गया है।",
    addTransaction: "लेन-देन जोड़ें",
    amount: "राशि",
    transactionType: "लेन-देन का प्रकार",
    credit: "उधार (Credit)",
    payment: "भुगतान",
    saveTransaction: "लेन-देन सहेजें",
    supplierKhata: "सप्लायर हब",
    addSupplier: "सप्लायर जोड़ें",
    searchSupplier: "सप्लायर खोजें...",
    noSuppliersFound: "कोई सप्लायर नहीं मिला। खरीदारी प्रबंधित करने के लिए अपना पहला सप्लायर जोड़ें।",
    supplierName: "सप्लायर का नाम",
    contactPerson: "संपर्क व्यक्ति",
    address: "पता",
    purchase: "खरीद",

    // Analytics
    analyticsOverview: "एनालिटिक्स अवलोकन",
    totalInventoryValue: "कुल इन्वेंटरी मूल्य",
    inventoryBreakdown: "इन्वेंटरी ब्रेकडाउन",
    stockStatus: "स्टॉक स्थिति",
    valueByCategory: "श्रेणी के अनुसार इन्वेंटरी मूल्य",
    profitMarginByCategory: "श्रेणी के अनुसार लाभ मार्जिन"
  },
};