import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students } from '@db/db.js';
import { type Student, type Course } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";
import { error } from 'node:console';

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program;
    const studentId = req.query.studentId;

    
    let result = students;

    
    if (studentId) {
      result = result.filter(
        (student) => String(student.studentId) === String(studentId)
      );
    }

    
    if (program) {
      result = result.filter(
        (student) => student.program === String(program)
      );
    }

    return res.status(200).json({
      ok: true,
      students: result
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err instanceof Error ? err.message : err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    
    const result = zStudentDeleteBody.safeParse(req.body); 
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        
        message: result.error.issues[0]?.message || "Student Id must contain 9 characters",
      });
    }

    
    const studentre = req.body;

   
    const found = students.findIndex((s) => String(s.studentId) === String(studentre.studentId));
    
    if (found === -1) {
      return res.status(404).json({
        ok: false,
        message: `Student ID ${studentre.studentId} does not exist`,
      });
    }

    students.splice(found, 1);
    
    return res.json({
      ok: true,
      message: `Student ID ${studentre.studentId} has been deleted` 
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error
    });
  }
});
// GET /api/me
app.get("/api/me",(req:Request,res:Response)=>{
return res.json({
    ok:true,
    fullname:"pannawat womgkeawjan",
    studentId:"680610694"



})
})

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;