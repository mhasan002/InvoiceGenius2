import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  email: varchar("email", { length: 255 }).unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  companyName: text("company_name"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id).notNull(), // Admin who created this team member
  email: varchar("email", { length: 255 }).notNull(),
  password: text("password").notNull(), // Hashed password for team member login
  fullName: varchar("full_name", { length: 255 }),
  role: varchar("role", { length: 100 }).default("Member"), // Optional role label like "Editor", "Manager"
  
  // Access permissions as individual boolean fields
  canCreateInvoices: varchar("can_create_invoices", { length: 10 }).default("false"),
  canDeleteInvoices: varchar("can_delete_invoices", { length: 10 }).default("false"),
  canManageServices: varchar("can_manage_services", { length: 10 }).default("false"),
  canManageCompanyProfiles: varchar("can_manage_company_profiles", { length: 10 }).default("false"),
  canManagePaymentMethods: varchar("can_manage_payment_methods", { length: 10 }).default("false"),
  canManageTemplates: varchar("can_manage_templates", { length: 10 }).default("false"),
  canViewOnlyAssignedInvoices: varchar("can_view_only_assigned_invoices", { length: 10 }).default("false"),
  canManageTeamMembers: varchar("can_manage_team_members", { length: 10 }).default("false"),
  
  isActive: varchar("is_active", { length: 10 }).default("true"), // Can be deactivated instead of deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: text("is_default").default("false"),
  config: jsonb("config").notNull(), // Stores TemplateConfig as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companyProfiles = pgTable("company_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  address: text("address"),
  logoUrl: text("logo_url"),
  tagline: text("tagline"),
  customFields: jsonb("custom_fields").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'bank', 'card', 'crypto', 'custom'
  name: varchar("name", { length: 255 }).notNull(),
  fields: jsonb("fields").notNull(), // Store all fields including predefined and custom
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  createdBy: varchar("created_by").references(() => teamMembers.id, { onDelete: "set null" }), // Track which team member created this invoice
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  
  // Client details
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 50 }),
  clientAddress: text("client_address"),
  clientEmail: varchar("client_email", { length: 255 }),
  clientCustomFields: jsonb("client_custom_fields").default([]),
  
  // Services and packages
  items: jsonb("items").notNull(), // Array of services and packages with quantities
  
  // Price modifiers
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default('0'),
  discountType: varchar("discount_type", { length: 20 }).default('flat'), // 'flat' or 'percentage'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default('0'),
  platform: varchar("platform", { length: 255 }),
  
  // Company and payment info
  companyProfileId: varchar("company_profile_id").references(() => companyProfiles.id),
  paymentMethodId: varchar("payment_method_id").references(() => paymentMethods.id),
  paymentReceivedBy: varchar("payment_received_by", { length: 255 }),
  
  // Template and customization
  templateId: varchar("template_id").references(() => templates.id),
  notes: text("notes"),
  terms: text("terms"),
  
  // Calculated totals
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  status: varchar("status", { length: 50 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  services: jsonb("services").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const signupUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Invoice schemas - Custom schema to handle number to string conversion
export const insertInvoiceSchema = z.object({
  invoiceNumber: z.string(),
  clientName: z.string(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientEmail: z.string().optional(),
  clientCustomFields: z.array(z.any()).default([]),
  items: z.any(),
  taxPercentage: z.union([z.string(), z.number()]).transform(val => String(val)).default("0"),
  discountType: z.enum(["flat", "percentage"]).default("flat"),
  discountValue: z.union([z.string(), z.number()]).transform(val => String(val)).default("0"),
  platform: z.string().optional(),
  companyProfileId: z.string().optional().nullable(),
  paymentMethodId: z.string().optional().nullable(),
  paymentReceivedBy: z.string().optional(),
  templateId: z.string().optional(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  subtotal: z.union([z.string(), z.number()]).transform(val => String(val)),
  taxAmount: z.union([z.string(), z.number()]).transform(val => String(val)).default("0"),
  discountAmount: z.union([z.string(), z.number()]).transform(val => String(val)).default("0"),
  total: z.union([z.string(), z.number()]).transform(val => String(val)),
  status: z.string().default("draft"),
});

export const updateInvoiceSchema = insertInvoiceSchema.partial();

// Service schemas
export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  unitPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
});

// Package schemas
export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
});

// Company profile schemas
export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Payment method schemas
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Template schemas
export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Team member schemas
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  adminId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Transform boolean strings to actual booleans for validation
  canCreateInvoices: z.boolean().transform(val => val ? "true" : "false").default(false),
  canDeleteInvoices: z.boolean().transform(val => val ? "true" : "false").default(false),
  canManageServices: z.boolean().transform(val => val ? "true" : "false").default(false),
  canManageCompanyProfiles: z.boolean().transform(val => val ? "true" : "false").default(false),
  canManagePaymentMethods: z.boolean().transform(val => val ? "true" : "false").default(false),
  canManageTemplates: z.boolean().transform(val => val ? "true" : "false").default(false),
  canViewOnlyAssignedInvoices: z.boolean().transform(val => val ? "true" : "false").default(false),
  canManageTeamMembers: z.boolean().transform(val => val ? "true" : "false").default(false),
  isActive: z.boolean().transform(val => val ? "true" : "false").default(true),
});

export const updateTeamMemberSchema = insertTeamMemberSchema.partial();

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type SignupUser = z.infer<typeof signupUserSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

// User profile update schemas
export const updateUserProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
});

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type DeleteAccount = z.infer<typeof deleteAccountSchema>;
