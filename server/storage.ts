import { 
  type User, 
  type InsertUser, 
  type Invoice, 
  type InsertInvoice, 
  type Service, 
  type InsertService, 
  type Package, 
  type InsertPackage, 
  type CompanyProfile, 
  type InsertCompanyProfile,
  type PaymentMethod,
  type InsertPaymentMethod,
  type Template,
  type InsertTemplate,
  type TeamMember,
  type InsertTeamMember
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, invoices, services, packages, companyProfiles, paymentMethods, templates, teamMembers } from "@shared/schema";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Invoice operations
  getInvoices(userId?: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  
  // Service operations
  getServices(userId: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService & { userId: string }): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Package operations
  getPackages(userId: string): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage & { userId: string }): Promise<Package>;
  updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package | undefined>;
  deletePackage(id: string): Promise<boolean>;
  
  // Company Profile operations
  getCompanyProfiles(userId: string): Promise<CompanyProfile[]>;
  getCompanyProfile(id: string): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile & { userId: string }): Promise<CompanyProfile>;
  updateCompanyProfile(id: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile | undefined>;
  deleteCompanyProfile(id: string): Promise<boolean>;
  
  // Payment Method operations
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod & { userId: string }): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<boolean>;
  
  // Template operations
  getTemplates(userId: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate & { userId: string }): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  setDefaultTemplate(userId: string, templateId: string): Promise<boolean>;
  
  // Team Member operations
  getTeamMembers(adminId: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  getTeamMemberByEmail(email: string): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember & { adminId: string }): Promise<TeamMember>;
  updateTeamMember(id: string, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  deactivateTeamMember(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = postgres(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await this.db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    // Delete user and cascade to related records
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getInvoices(userId?: string): Promise<Invoice[]> {
    if (userId) {
      return await this.db.select().from(invoices).where(eq(invoices.userId, userId));
    }
    return await this.db.select().from(invoices);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const result = await this.db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    return result[0];
  }

  async createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice> {
    const result = await this.db.insert(invoices).values(invoice).returning();
    return result[0];
  }

  async updateInvoice(id: string, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const result = await this.db.update(invoices).set(invoiceData).where(eq(invoices.id, id)).returning();
    return result[0];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await this.db.delete(invoices).where(eq(invoices.id, id)).returning();
    return result.length > 0;
  }

  // Service operations
  async getServices(userId: string): Promise<Service[]> {
    return await this.db.select().from(services).where(eq(services.userId, userId));
  }

  async getService(id: string): Promise<Service | undefined> {
    const result = await this.db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }

  async createService(service: InsertService & { userId: string }): Promise<Service> {
    const result = await this.db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const result = await this.db.update(services).set(service).where(eq(services.id, id)).returning();
    return result[0];
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await this.db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  // Package operations
  async getPackages(userId: string): Promise<Package[]> {
    return await this.db.select().from(packages).where(eq(packages.userId, userId));
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const result = await this.db.select().from(packages).where(eq(packages.id, id)).limit(1);
    return result[0];
  }

  async createPackage(packageData: InsertPackage & { userId: string }): Promise<Package> {
    const result = await this.db.insert(packages).values(packageData).returning();
    return result[0];
  }

  async updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package | undefined> {
    const result = await this.db.update(packages).set(packageData).where(eq(packages.id, id)).returning();
    return result[0];
  }

  async deletePackage(id: string): Promise<boolean> {
    const result = await this.db.delete(packages).where(eq(packages.id, id)).returning();
    return result.length > 0;
  }

  // Company Profile operations
  async getCompanyProfiles(userId: string): Promise<CompanyProfile[]> {
    return await this.db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId));
  }

  async getCompanyProfile(id: string): Promise<CompanyProfile | undefined> {
    const result = await this.db.select().from(companyProfiles).where(eq(companyProfiles.id, id)).limit(1);
    return result[0];
  }

  async createCompanyProfile(profile: InsertCompanyProfile & { userId: string }): Promise<CompanyProfile> {
    const result = await this.db.insert(companyProfiles).values(profile).returning();
    return result[0];
  }

  async updateCompanyProfile(id: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile | undefined> {
    const result = await this.db.update(companyProfiles).set(profile).where(eq(companyProfiles.id, id)).returning();
    return result[0];
  }

  async deleteCompanyProfile(id: string): Promise<boolean> {
    const result = await this.db.delete(companyProfiles).where(eq(companyProfiles.id, id)).returning();
    return result.length > 0;
  }

  // Payment Method operations
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await this.db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const result = await this.db.select().from(paymentMethods).where(eq(paymentMethods.id, id)).limit(1);
    return result[0];
  }

  async createPaymentMethod(method: InsertPaymentMethod & { userId: string }): Promise<PaymentMethod> {
    const result = await this.db.insert(paymentMethods).values(method).returning();
    return result[0];
  }

  async updatePaymentMethod(id: string, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const result = await this.db.update(paymentMethods).set(method).where(eq(paymentMethods.id, id)).returning();
    return result[0];
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await this.db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result.length > 0;
  }

  // Template operations
  async getTemplates(userId: string): Promise<Template[]> {
    return await this.db.select().from(templates).where(eq(templates.userId, userId));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await this.db.select().from(templates).where(eq(templates.id, id)).limit(1);
    return result[0];
  }

  async createTemplate(template: InsertTemplate & { userId: string }): Promise<Template> {
    const result = await this.db.insert(templates).values(template).returning();
    return result[0];
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const result = await this.db.update(templates).set(template).where(eq(templates.id, id)).returning();
    return result[0];
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }

  async setDefaultTemplate(userId: string, templateId: string): Promise<boolean> {
    try {
      // First unset all defaults for this user
      await this.db.update(templates).set({ isDefault: "false" }).where(eq(templates.userId, userId));
      // Then set the new default
      await this.db.update(templates).set({ isDefault: "true" }).where(eq(templates.id, templateId));
      return true;
    } catch (error) {
      console.error('Error setting default template:', error);
      return false;
    }
  }

  // Team Member operations
  async getTeamMembers(adminId: string): Promise<TeamMember[]> {
    // Return all team members (both active and inactive) for admin management
    return await this.db.select().from(teamMembers).where(eq(teamMembers.adminId, adminId));
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const result = await this.db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
    return result[0];
  }

  async getTeamMemberByEmail(email: string): Promise<TeamMember | undefined> {
    const result = await this.db.select().from(teamMembers).where(eq(teamMembers.email, email)).limit(1);
    return result[0];
  }

  async createTeamMember(teamMember: InsertTeamMember & { adminId: string }): Promise<TeamMember> {
    const result = await this.db.insert(teamMembers).values(teamMember).returning();
    return result[0];
  }

  async updateTeamMember(id: string, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const result = await this.db.update(teamMembers).set(teamMember).where(eq(teamMembers.id, id)).returning();
    return result[0];
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await this.db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return result.length > 0;
  }

  async deactivateTeamMember(id: string): Promise<boolean> {
    try {
      await this.db.update(teamMembers).set({ isActive: "false" }).where(eq(teamMembers.id, id));
      return true;
    } catch (error) {
      console.error('Error deactivating team member:', error);
      return false;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private invoices: Map<string, Invoice>;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...userData,
    };
    this.users.set(id, updated);
    return updated;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      companyName: insertUser.companyName || null,
      profilePicture: insertUser.profilePicture || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    // Also delete related data
    if (deleted) {
      // Delete user's invoices
      const userInvoices = Array.from(this.invoices.keys()).filter(invoiceId => {
        const invoice = this.invoices.get(invoiceId);
        return invoice?.userId === id;
      });
      userInvoices.forEach(invoiceId => this.invoices.delete(invoiceId));
      
      // Delete user's services, packages, etc.
      const userServices = Array.from(this.services.keys()).filter(serviceId => {
        const service = this.services.get(serviceId);
        return service?.userId === id;
      });
      userServices.forEach(serviceId => this.services.delete(serviceId));
    }
    return deleted;
  }

  async getInvoices(userId?: string): Promise<Invoice[]> {
    const allInvoices = Array.from(this.invoices.values());
    if (userId) {
      return allInvoices.filter(invoice => invoice.userId === userId);
    }
    return allInvoices;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice> {
    const id = randomUUID();
    const newInvoice: Invoice = {
      id,
      userId: invoice.userId,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientPhone: invoice.clientPhone || null,
      clientAddress: invoice.clientAddress || null,
      clientEmail: invoice.clientEmail || null,
      clientCustomFields: invoice.clientCustomFields || [],
      items: invoice.items,
      taxPercentage: invoice.taxPercentage || "0",
      discountType: invoice.discountType || "flat",
      discountValue: invoice.discountValue || "0",
      platform: invoice.platform || null,
      companyProfileId: invoice.companyProfileId || null,
      paymentMethodId: invoice.paymentMethodId || null,
      paymentReceivedBy: invoice.paymentReceivedBy || null,
      templateId: invoice.templateId || null,
      notes: invoice.notes || null,
      terms: invoice.terms || null,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount || "0",
      discountAmount: invoice.discountAmount || "0",
      total: invoice.total,
      status: invoice.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: string, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...invoiceData,
      updatedAt: new Date(),
    };
    this.invoices.set(id, updated);
    return updated;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Stub implementations for services, packages, company profiles, and payment methods
  async getServices(): Promise<Service[]> { return []; }
  async getService(): Promise<Service | undefined> { return undefined; }
  async createService(): Promise<Service> { throw new Error("Not implemented in MemStorage"); }
  async updateService(): Promise<Service | undefined> { return undefined; }
  async deleteService(): Promise<boolean> { return false; }

  async getPackages(): Promise<Package[]> { return []; }
  async getPackage(): Promise<Package | undefined> { return undefined; }
  async createPackage(): Promise<Package> { throw new Error("Not implemented in MemStorage"); }
  async updatePackage(): Promise<Package | undefined> { return undefined; }
  async deletePackage(): Promise<boolean> { return false; }

  async getCompanyProfiles(): Promise<CompanyProfile[]> { return []; }
  async getCompanyProfile(): Promise<CompanyProfile | undefined> { return undefined; }
  async createCompanyProfile(): Promise<CompanyProfile> { throw new Error("Not implemented in MemStorage"); }
  async updateCompanyProfile(): Promise<CompanyProfile | undefined> { return undefined; }
  async deleteCompanyProfile(): Promise<boolean> { return false; }

  async getPaymentMethods(): Promise<PaymentMethod[]> { return []; }
  async getPaymentMethod(): Promise<PaymentMethod | undefined> { return undefined; }
  async createPaymentMethod(): Promise<PaymentMethod> { throw new Error("Not implemented in MemStorage"); }
  async updatePaymentMethod(): Promise<PaymentMethod | undefined> { return undefined; }
  async deletePaymentMethod(): Promise<boolean> { return false; }

  async getTemplates(): Promise<Template[]> { return []; }
  async getTemplate(): Promise<Template | undefined> { return undefined; }
  async createTemplate(): Promise<Template> { throw new Error("Not implemented in MemStorage"); }
  async updateTemplate(): Promise<Template | undefined> { return undefined; }
  async deleteTemplate(): Promise<boolean> { return false; }
  async setDefaultTemplate(): Promise<boolean> { return false; }

  // Team member stub implementations
  async getTeamMembers(): Promise<TeamMember[]> { return []; }
  async getTeamMember(): Promise<TeamMember | undefined> { return undefined; }
  async getTeamMemberByEmail(): Promise<TeamMember | undefined> { return undefined; }
  async createTeamMember(): Promise<TeamMember> { throw new Error("Not implemented in MemStorage"); }
  async updateTeamMember(): Promise<TeamMember | undefined> { return undefined; }
  async deleteTeamMember(): Promise<boolean> { return false; }
  async deactivateTeamMember(): Promise<boolean> { return false; }
}

// Use database storage if DATABASE_URL is configured, otherwise use memory storage
export const storage: IStorage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
