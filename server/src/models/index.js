import { sequelize } from '../config/db.js';

// ─── User ──────────────────────────────────────────────
import User from '../modules/user/user.model.js';

// ─── Catalogue ─────────────────────────────────────────
import Category from '../modules/category/category.model.js';
import Product from '../modules/product/product.model.js';
import ProductImage from '../modules/product/productImage.model.js';
import ProductSpec from '../modules/product/productSpec.model.js';
import ProductPackingOption from '../modules/product/productPackingOption.model.js';
import Certificate from '../modules/certificate/certificate.model.js';
import ProductCertificate from '../modules/product/productCertificate.model.js';

// ─── Leads ─────────────────────────────────────────────
import Inquiry from '../modules/inquiry/inquiry.model.js';
import InquiryItem from '../modules/inquiry/inquiryItem.model.js';
import InquiryNote from '../modules/inquiry/inquiryNote.model.js';
import Customer from '../modules/customer/customer.model.js';
import CustomerNote from '../modules/customer/customerNote.model.js';
import SampleRequest from '../modules/sample/sample.model.js';
import SampleProduct from '../modules/sample/sampleProduct.model.js';

// ─── Sales ─────────────────────────────────────────────
import Quotation from '../modules/quotation/quotation.model.js';
import QuotationItem from '../modules/quotation/quotationItem.model.js';
import Order from '../modules/order/order.model.js';
import OrderItem from '../modules/order/orderItem.model.js';
import OrderDocument from '../modules/order/orderDocument.model.js';

// ─── Content & Trust ───────────────────────────────────
import BlogPost from '../modules/blog/blog.model.js';
import Testimonial from '../modules/testimonial/testimonial.model.js';
import MarketRegion from '../modules/marketRegion/marketRegion.model.js';
import MarketRegionCountry from '../modules/marketRegion/marketRegionCountry.model.js';
import Faq from '../modules/faq/faq.model.js';
import Task from '../modules/task/task.model.js';

// ─── AI & Knowledge Base ──────────────────────────────
import AiUsageLog from '../modules/ai/aiUsageLog.model.js';
import Embedding from '../modules/ai/embedding.model.js';
import CompanyFact from '../modules/companyFact/companyFact.model.js';

// ─── Associations ──────────────────────────────────────

// Product child tables
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'imagesList', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductSpec, { foreignKey: 'product_id', as: 'specsList', onDelete: 'CASCADE' });
ProductSpec.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductPackingOption, { foreignKey: 'product_id', as: 'packingList', onDelete: 'CASCADE' });
ProductPackingOption.belongsTo(Product, { foreignKey: 'product_id' });

// Product ↔ Certificate (M:N)
Product.belongsToMany(Certificate, { through: ProductCertificate, foreignKey: 'product_id', otherKey: 'certificate_id', as: 'certificates' });
Certificate.belongsToMany(Product, { through: ProductCertificate, foreignKey: 'certificate_id', otherKey: 'product_id', as: 'products' });

// Inquiry associations
Inquiry.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
User.hasMany(Inquiry, { foreignKey: 'assigned_to', as: 'assignedInquiries' });

Inquiry.hasMany(InquiryItem, { foreignKey: 'inquiry_id', as: 'itemsList', onDelete: 'CASCADE' });
InquiryItem.belongsTo(Inquiry, { foreignKey: 'inquiry_id' });
InquiryItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Inquiry.hasMany(InquiryNote, { foreignKey: 'inquiry_id', as: 'notesList', onDelete: 'CASCADE' });
InquiryNote.belongsTo(Inquiry, { foreignKey: 'inquiry_id' });

Inquiry.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Inquiry, { foreignKey: 'customer_id', as: 'inquiries' });

// Customer associations
Customer.belongsTo(User, { foreignKey: 'assigned_salesperson', as: 'salesperson' });
Customer.hasMany(CustomerNote, { foreignKey: 'customer_id', as: 'notesList', onDelete: 'CASCADE' });
CustomerNote.belongsTo(Customer, { foreignKey: 'customer_id' });

// Sample associations
SampleRequest.hasMany(SampleProduct, { foreignKey: 'sample_id', as: 'productsList', onDelete: 'CASCADE' });
SampleProduct.belongsTo(SampleRequest, { foreignKey: 'sample_id' });
SampleProduct.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Quotation associations
Quotation.belongsTo(Inquiry, { foreignKey: 'inquiry_id', as: 'inquiry' });
Quotation.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Quotation.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Quotation.hasMany(QuotationItem, { foreignKey: 'quotation_id', as: 'itemsList', onDelete: 'CASCADE' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotation_id' });
QuotationItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Customer.hasMany(Quotation, { foreignKey: 'customer_id', as: 'quotations' });

// Order associations
Order.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
Order.belongsTo(Inquiry, { foreignKey: 'inquiry_id', as: 'inquiry' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Order.belongsTo(User, { foreignKey: 'assigned_salesperson', as: 'salesperson' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'productsList', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(OrderDocument, { foreignKey: 'order_id', as: 'documentsList', onDelete: 'CASCADE' });
OrderDocument.belongsTo(Order, { foreignKey: 'order_id' });

Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });

// Market region → countries
MarketRegion.hasMany(MarketRegionCountry, { foreignKey: 'market_region_id', as: 'countriesList', onDelete: 'CASCADE' });
MarketRegionCountry.belongsTo(MarketRegion, { foreignKey: 'market_region_id' });

// Task associations
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Task.belongsTo(Inquiry, { foreignKey: 'inquiry_id', as: 'inquiry' });
Task.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Provide backward-compatible _id virtual accessors without polluting SQL columns
const registeredModels = [
  User, Category, Product, ProductImage, ProductSpec, ProductPackingOption,
  Certificate, ProductCertificate, Inquiry, InquiryItem, InquiryNote,
  Customer, CustomerNote, SampleRequest, SampleProduct, Quotation,
  QuotationItem, Order, OrderItem, OrderDocument, BlogPost, Testimonial,
  MarketRegion, MarketRegionCountry, Faq, Task, AiUsageLog, Embedding,
  CompanyFact,
];

for (const model of registeredModels) {
  if (model?.prototype && !Object.getOwnPropertyDescriptor(model.prototype, '_id')) {
    Object.defineProperty(model.prototype, '_id', {
      get() {
        return this.getDataValue ? this.getDataValue('id') : this.id;
      },
      enumerable: true,
      configurable: true,
    });
  }
}

export {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  ProductSpec,
  ProductPackingOption,
  Certificate,
  ProductCertificate,
  Inquiry,
  InquiryItem,
  InquiryNote,
  Customer,
  CustomerNote,
  SampleRequest,
  SampleRequest as Sample,
  SampleProduct,
  Quotation,
  QuotationItem,
  Order,
  OrderItem,
  OrderDocument,
  BlogPost,
  BlogPost as Blog,
  Testimonial,
  MarketRegion,
  MarketRegionCountry,
  Faq,
  Task,
  AiUsageLog,
  Embedding,
  CompanyFact,
};

export default {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  ProductSpec,
  ProductPackingOption,
  Certificate,
  ProductCertificate,
  Inquiry,
  InquiryItem,
  InquiryNote,
  Customer,
  CustomerNote,
  SampleRequest,
  Sample: SampleRequest,
  SampleProduct,
  Quotation,
  QuotationItem,
  Order,
  OrderItem,
  OrderDocument,
  BlogPost,
  Blog: BlogPost,
  Testimonial,
  MarketRegion,
  MarketRegionCountry,
  Faq,
  Task,
  AiUsageLog,
  Embedding,
  CompanyFact,
};
