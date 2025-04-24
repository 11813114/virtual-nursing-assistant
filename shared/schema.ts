import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Nurses, Doctors, etc.)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("nurse"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  condition: text("condition").notNull(),
  status: text("status").notNull().default("stable"),
  notes: text("notes"),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

// Vital Signs
export const vitalSigns = pgTable("vital_signs", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  heartRate: integer("heart_rate"),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  temperature: real("temperature"),
  respiratoryRate: integer("respiratory_rate"),
  oxygenSaturation: integer("oxygen_saturation"),
  painLevel: integer("pain_level"),
});

export const insertVitalSignsSchema = createInsertSchema(vitalSigns).omit({
  id: true,
});

// Reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  patientId: integer("patient_id").notNull(),
  dueTime: timestamp("due_time").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  type: text("type").notNull(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isBot: boolean("is_bot").notNull().default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
});

// Education Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resourceType: text("resource_type").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

// Health Metrics
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(),
  date: timestamp("date").notNull(),
  value: real("value").notNull(),
  change: real("change"),
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type VitalSign = typeof vitalSigns.$inferSelect;
export type InsertVitalSign = z.infer<typeof insertVitalSignsSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
