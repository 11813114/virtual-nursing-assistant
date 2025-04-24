import { db } from "./db";
import { eq, desc, and, gt, gte } from "drizzle-orm";
import { 
  users, patients, vitalSigns, reminders, messages, resources, healthMetrics,
  User, InsertUser, Patient, InsertPatient, VitalSign, InsertVitalSign,
  Reminder, InsertReminder, Message, InsertMessage, Resource, InsertResource,
  HealthMetric, InsertHealthMetric
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatientStatus(id: number, status: string): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set({ status })
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async getVitalSigns(patientId: number, limit: number = 10): Promise<VitalSign[]> {
    return await db
      .select()
      .from(vitalSigns)
      .where(eq(vitalSigns.patientId, patientId))
      .orderBy(desc(vitalSigns.timestamp))
      .limit(limit);
  }

  async createVitalSign(insertVitalSign: InsertVitalSign): Promise<VitalSign> {
    const [vitalSign] = await db
      .insert(vitalSigns)
      .values(insertVitalSign)
      .returning();
    return vitalSign;
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await db.select().from(reminders);
  }

  async getReminders(patientId: number): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.patientId, patientId))
      .orderBy(reminders.dueTime);
  }

  async getUpcomingReminders(limit: number = 5): Promise<Reminder[]> {
    const now = new Date();
    return await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.completed, false),
          gte(reminders.dueTime, now)
        )
      )
      .orderBy(reminders.dueTime)
      .limit(limit);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db
      .insert(reminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async completeReminder(id: number): Promise<Reminder | undefined> {
    const [reminder] = await db
      .update(reminders)
      .set({ completed: true })
      .where(eq(reminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async getMessages(limit: number = 20): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(messages.timestamp)
      .limit(limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // If this is a user message, automatically generate a bot response
    if (!message.isBot) {
      const botResponse: InsertMessage = {
        senderId: 0, // Bot ID
        content: this.generateBotResponse(message.content),
        timestamp: new Date(new Date(message.timestamp).getTime() + 1000), // 1 second later
        isBot: true,
      };
      
      await db.insert(messages).values(botResponse);
    }
    
    return message;
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values(insertResource)
      .returning();
    return resource;
  }

  async getHealthMetrics(metricType: string, days: number = 7): Promise<HealthMetric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(healthMetrics)
      .where(
        and(
          eq(healthMetrics.metricType, metricType),
          gte(healthMetrics.date, startDate)
        )
      )
      .orderBy(healthMetrics.date);
  }

  async createHealthMetric(insertHealthMetric: InsertHealthMetric): Promise<HealthMetric> {
    const [healthMetric] = await db
      .insert(healthMetrics)
      .values(insertHealthMetric)
      .returning();
    return healthMetric;
  }

  private generateBotResponse(message: string): string {
    // Simple bot response logic
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (message.toLowerCase().includes("help")) {
      return "I'm here to help. You can ask me about patient information, reminders, or health data.";
    } else if (message.toLowerCase().includes("thank")) {
      return "You're welcome! Is there anything else you need?";
    } else {
      return "I understand. Is there anything specific you would like to know about your patients or reminders?";
    }
  }
}