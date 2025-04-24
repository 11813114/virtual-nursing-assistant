import { 
  users, User, InsertUser,
  patients, Patient, InsertPatient,
  vitalSigns, VitalSign, InsertVitalSign,
  reminders, Reminder, InsertReminder,
  messages, Message, InsertMessage,
  resources, Resource, InsertResource,
  healthMetrics, HealthMetric, InsertHealthMetric
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patients
  getAllPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatientStatus(id: number, status: string): Promise<Patient | undefined>;
  
  // Vital Signs
  getVitalSigns(patientId: number, limit?: number): Promise<VitalSign[]>;
  createVitalSign(vitalSign: InsertVitalSign): Promise<VitalSign>;
  
  // Reminders
  getAllReminders(): Promise<Reminder[]>;
  getReminders(patientId: number): Promise<Reminder[]>;
  getUpcomingReminders(limit?: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  completeReminder(id: number): Promise<Reminder | undefined>;
  
  // Messages
  getMessages(limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Education Resources
  getAllResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Health Metrics
  getHealthMetrics(metricType: string, days?: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private vitalSigns: Map<number, VitalSign>;
  private reminders: Map<number, Reminder>;
  private messages: Map<number, Message>;
  private resources: Map<number, Resource>;
  private healthMetrics: Map<number, HealthMetric>;
  
  private currentUserId: number;
  private currentPatientId: number;
  private currentVitalSignId: number;
  private currentReminderId: number;
  private currentMessageId: number;
  private currentResourceId: number;
  private currentHealthMetricId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.vitalSigns = new Map();
    this.reminders = new Map();
    this.messages = new Map();
    this.resources = new Map();
    this.healthMetrics = new Map();
    
    this.currentUserId = 1;
    this.currentPatientId = 1;
    this.currentVitalSignId = 1;
    this.currentReminderId = 1;
    this.currentMessageId = 1;
    this.currentResourceId = 1;
    this.currentHealthMetricId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Patients
  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }
  
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = { ...insertPatient, id };
    this.patients.set(id, patient);
    return patient;
  }
  
  async updatePatientStatus(id: number, status: string): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, status };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }
  
  // Vital Signs
  async getVitalSigns(patientId: number, limit: number = 10): Promise<VitalSign[]> {
    return Array.from(this.vitalSigns.values())
      .filter(vitalSign => vitalSign.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  async createVitalSign(insertVitalSign: InsertVitalSign): Promise<VitalSign> {
    const id = this.currentVitalSignId++;
    const vitalSign: VitalSign = { ...insertVitalSign, id };
    this.vitalSigns.set(id, vitalSign);
    return vitalSign;
  }
  
  // Reminders
  async getAllReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values());
  }
  
  async getReminders(patientId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.patientId === patientId)
      .sort((a, b) => new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime());
  }
  
  async getUpcomingReminders(limit: number = 5): Promise<Reminder[]> {
    const now = new Date();
    return Array.from(this.reminders.values())
      .filter(reminder => !reminder.completed && new Date(reminder.dueTime) > now)
      .sort((a, b) => new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime())
      .slice(0, limit);
  }
  
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = { ...insertReminder, id };
    this.reminders.set(id, reminder);
    return reminder;
  }
  
  async completeReminder(id: number): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, completed: true };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  // Messages
  async getMessages(limit: number = 20): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(0, limit);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }
  
  // Education Resources
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }
  
  // Health Metrics
  async getHealthMetrics(metricType: string, days: number = 7): Promise<HealthMetric[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.healthMetrics.values())
      .filter(metric => 
        metric.metricType === metricType && 
        new Date(metric.date) >= cutoffDate
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async createHealthMetric(insertHealthMetric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.currentHealthMetricId++;
    const healthMetric: HealthMetric = { ...insertHealthMetric, id };
    this.healthMetrics.set(id, healthMetric);
    return healthMetric;
  }
  
  // Initialize with sample data
  private initializeSampleData() {
    // Sample users
    this.createUser({
      username: "sarah.chen",
      password: "password123", // In production, this would be hashed
      name: "Dr. Sarah Chen",
      email: "sarah.chen@medicalpro.com",
      role: "head_nurse",
      avatar: "",
    });
    
    // Sample patients
    this.createPatient({
      patientId: "P-2458",
      name: "James Wilson",
      avatar: "",
      condition: "Type 2 Diabetes",
      status: "stable",
      notes: "Patient is responding well to treatment",
    });
    
    this.createPatient({
      patientId: "P-3721",
      name: "Maria Garcia",
      avatar: "",
      condition: "Hypertension",
      status: "monitor",
      notes: "Blood pressure has been fluctuating, requires close monitoring",
    });
    
    this.createPatient({
      patientId: "P-1192",
      name: "Robert Johnson",
      avatar: "",
      condition: "COPD",
      status: "attention",
      notes: "Oxygen levels dropped below 92% last night, needs respiratory assessment",
    });
    
    // Sample vital signs
    this.createVitalSign({
      patientId: 1,
      timestamp: new Date(),
      heartRate: 88,
      bloodPressureSystolic: 128,
      bloodPressureDiastolic: 85,
      temperature: 36.7,
      respiratoryRate: 17,
      oxygenSaturation: 98,
      painLevel: 1,
    });
    
    this.createVitalSign({
      patientId: 2,
      timestamp: new Date(),
      heartRate: 76,
      bloodPressureSystolic: 142,
      bloodPressureDiastolic: 92,
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 97,
      painLevel: 2,
    });
    
    this.createVitalSign({
      patientId: 3,
      timestamp: new Date(),
      heartRate: 92,
      bloodPressureSystolic: 132,
      bloodPressureDiastolic: 86,
      temperature: 37.1,
      respiratoryRate: 22,
      oxygenSaturation: 91,
      painLevel: 3,
    });
    
    // Sample reminders
    const now = new Date();
    
    this.createReminder({
      title: "Medication Check",
      description: "Verify Robert Johnson's antibiotic adherence",
      patientId: 3,
      dueTime: now,
      completed: false,
      priority: "high",
      type: "medication",
    });
    
    let thirtyMinFromNow = new Date(now);
    thirtyMinFromNow.setMinutes(now.getMinutes() + 30);
    
    this.createReminder({
      title: "Blood Pressure Check",
      description: "Maria Garcia needs BP monitoring",
      patientId: 2,
      dueTime: thirtyMinFromNow,
      completed: false,
      priority: "medium",
      type: "vital_check",
    });
    
    let twoHoursFromNow = new Date(now);
    twoHoursFromNow.setHours(now.getHours() + 2);
    
    this.createReminder({
      title: "Position Change",
      description: "Assist Dorothy Miller with position change",
      patientId: 1,
      dueTime: twoHoursFromNow,
      completed: false,
      priority: "low",
      type: "general_care",
    });
    
    let sixPM = new Date(now);
    sixPM.setHours(18, 0, 0, 0);
    
    this.createReminder({
      title: "Meal Assistance",
      description: "Help Thomas Wright with dinner",
      patientId: 1,
      dueTime: sixPM,
      completed: false,
      priority: "medium",
      type: "nutrition",
    });
    
    // Sample messages
    let tenThirtyAM = new Date();
    tenThirtyAM.setHours(10, 32, 0, 0);
    
    this.createMessage({
      senderId: 0, // 0 for bot
      content: "Hello Dr. Chen! How can I assist you today?",
      timestamp: tenThirtyAM,
      isBot: true,
    });
    
    let tenThirtyThreeAM = new Date(tenThirtyAM);
    tenThirtyThreeAM.setMinutes(tenThirtyAM.getMinutes() + 1);
    
    this.createMessage({
      senderId: 1,
      content: "I need to check on Robert Johnson's oxygen levels for the past 24 hours.",
      timestamp: tenThirtyThreeAM,
      isBot: false,
    });
    
    let tenThirtyFourAM = new Date(tenThirtyThreeAM);
    tenThirtyFourAM.setMinutes(tenThirtyThreeAM.getMinutes() + 1);
    
    this.createMessage({
      senderId: 0,
      content: "Robert Johnson's oxygen levels in the last 24 hours have ranged between 91-94%. His lowest reading was at 2:15 AM (91%). Would you like me to schedule a respiratory assessment?",
      timestamp: tenThirtyFourAM,
      isBot: true,
    });
    
    // Sample resources
    this.createResource({
      title: "Diabetes Management Guide",
      description: "For patients with Type 1 & 2 diabetes",
      resourceType: "pdf",
      url: "/resources/diabetes-management.pdf",
      icon: "file-pdf",
    });
    
    this.createResource({
      title: "Hypertension Care Video Series",
      description: "Educational videos on blood pressure management",
      resourceType: "video",
      url: "/resources/hypertension-series",
      icon: "video",
    });
    
    this.createResource({
      title: "COPD Home Care Instructions",
      description: "Printable guide for patients",
      resourceType: "document",
      url: "/resources/copd-homecare.pdf",
      icon: "file-alt",
    });
    
    // Sample health metrics
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Add blood pressure metrics for the past week
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);
      
      this.createHealthMetric({
        metricType: "blood_pressure",
        date,
        value: 130 - i,
        change: i === 0 ? 0 : -1,
      });
    }
    
    // Add glucose metrics for the past week
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);
      
      this.createHealthMetric({
        metricType: "glucose",
        date,
        value: 110 + (i % 3),
        change: i === 0 ? 0 : i % 3 === 0 ? 2 : -1,
      });
    }
    
    // Add medication adherence metrics for the past week
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);
      
      this.createHealthMetric({
        metricType: "medication_adherence",
        date,
        value: 85 + i,
        change: i === 0 ? 0 : 1,
      });
    }
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
