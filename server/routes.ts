import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReminderSchema, insertMessageSchema, insertResourceSchema, insertPatientSchema, insertHealthMetricSchema, insertVitalSignsSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Endpoints
  const apiRouter = express.Router();
  
  // Error handler for API routes
  const apiErrorHandler = (err: any, req: any, res: any, next: any) => {
    console.error(err);
    
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
    
    res.status(500).json({
      message: "An internal server error occurred",
    });
  };
  
  // Users
  apiRouter.get("/users/me", async (req, res) => {
    // Mock current user for demo purposes
    const user = await storage.getUserByUsername("sarah.chen");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Patients
  apiRouter.get("/patients", async (req, res) => {
    const patients = await storage.getAllPatients();
    res.json(patients);
  });
  
  apiRouter.get("/patients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const patient = await storage.getPatient(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  });
  
  apiRouter.post("/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      throw err;
    }
  });
  
  apiRouter.patch("/patients/:id/status", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const patient = await storage.updatePatientStatus(id, status);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  });
  
  // Vital Signs
  apiRouter.get("/patients/:id/vital-signs", async (req, res) => {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const vitalSigns = await storage.getVitalSigns(patientId, limit);
    res.json(vitalSigns);
  });
  
  apiRouter.post("/vital-signs", async (req, res) => {
    try {
      const validatedData = insertVitalSignsSchema.parse(req.body);
      const vitalSign = await storage.createVitalSign(validatedData);
      res.status(201).json(vitalSign);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      throw err;
    }
  });
  
  // Reminders
  apiRouter.get("/reminders", async (req, res) => {
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    const upcoming = req.query.upcoming === "true";
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let reminders;
    
    if (upcoming) {
      reminders = await storage.getUpcomingReminders(limit);
    } else if (patientId) {
      reminders = await storage.getReminders(patientId);
    } else {
      reminders = await storage.getAllReminders();
    }
    
    res.json(reminders);
  });
  
  apiRouter.post("/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      throw err;
    }
  });
  
  apiRouter.patch("/reminders/:id/complete", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reminder ID" });
    }
    
    const reminder = await storage.completeReminder(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    
    res.json(reminder);
  });
  
  // Messages (Virtual Assistant)
  apiRouter.get("/messages", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const messages = await storage.getMessages(limit);
    res.json(messages);
  });
  
  apiRouter.post("/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // Simulate bot response with simple responses based on keywords
      if (!validatedData.isBot) {
        const userMessageLower = validatedData.content.toLowerCase();
        let botResponse = "";
        
        if (userMessageLower.includes("oxygen") || userMessageLower.includes("o2")) {
          botResponse = "The latest oxygen saturation readings for this patient are within normal range (95-98%).";
        } else if (userMessageLower.includes("medication") || userMessageLower.includes("medicine") || userMessageLower.includes("med")) {
          botResponse = "The patient's medication adherence is at 92%. Their next dosage is scheduled in 2 hours.";
        } else if (userMessageLower.includes("vital") || userMessageLower.includes("bp") || userMessageLower.includes("blood pressure")) {
          botResponse = "The patient's vitals are stable. Blood pressure: 128/85, Heart rate: 72 bpm, Temperature: 37.1°C.";
        } else if (userMessageLower.includes("appointment") || userMessageLower.includes("schedule")) {
          botResponse = "The patient has an upcoming appointment on Friday at 2:30 PM with Dr. Roberts.";
        } else {
          botResponse = "I'm here to help! Is there anything specific about the patient's care that you would like to know?";
        }
        
        // Create bot response
        setTimeout(async () => {
          await storage.createMessage({
            senderId: 0,
            content: botResponse,
            timestamp: new Date(),
            isBot: true,
          });
        }, 1000);
      }
      
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      throw err;
    }
  });
  
  // Education Resources
  apiRouter.get("/resources", async (req, res) => {
    const resources = await storage.getAllResources();
    res.json(resources);
  });
  
  apiRouter.get("/resources/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }
    
    const resource = await storage.getResource(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(resource);
  });
  
  apiRouter.post("/resources", async (req, res) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validatedData);
      res.status(201).json(resource);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      throw err;
    }
  });
  
  // Health Metrics
  apiRouter.get("/health-metrics", async (req, res) => {
    const metricType = req.query.type as string;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    
    if (!metricType) {
      return res.status(400).json({ message: "Metric type is required" });
    }
    
    const metrics = await storage.getHealthMetrics(metricType, days);
    res.json(metrics);
  });
  
  apiRouter.post("/health-metrics", async (req, res) => {
    try {
      const validatedData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.createHealthMetric(validatedData);
      res.status(201).json(metric);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      throw err;
    }
  });
  
  // Register API routes
  app.use("/api", apiRouter);
  app.use("/api", apiErrorHandler);

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
