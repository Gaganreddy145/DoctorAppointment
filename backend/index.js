import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import pg from "pg";
import dotenv from "dotenv";
import multer from "multer";

const app = express();
const port = 3000;

dotenv.config();
const secretKey = process.env.SECRET_KEY;

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DBNAME,
  password: process.env.DBPWD,
  port: process.env.PORT,
});

db.connect();

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/"); // Save files to 'public' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Rename file with a unique identifier
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH,PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM admin WHERE email=$1 AND password=$2",
      [email, password]
    );
    if (result.rows.length > 0) {
      const token = jwt.sign(result.rows[0], secretKey);
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Email or Password is Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to login" });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired Token" });
    }
    req.user = decoded;
    next();
  });
};

app.get("/protect", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.get("/all-doctors", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT did,image,dname,speciality,isavail FROM doctor_info"
    );
    const doctorsArray = result.rows;
    res.status(200).json({ doctors: doctorsArray });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch Doctors" });
  }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, interval = 30) {
  const slots = [];
  let currentTime = new Date(startTime.getTime());

  while (currentTime < endTime) {
    slots.push(new Date(currentTime));
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return slots;
}

app.get("/all-doctors/:did", verifyToken, async (req, res) => {
  const doctorId = Number(req.params.did);
  const daysAhead = 7;
  const workingHoursStart = 8;
  const workingHoursEnd = 20;

  try {
    const result = await db.query("SELECT * FROM doctor_info WHERE did=$1", [
      doctorId,
    ]);
    const specificDoctor = result.rows[0];

    const today = new Date();
    const slots = [];
    // Generate time slots for each day within the specified range
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const startTime = new Date(date.setHours(workingHoursStart, 0, 0, 0));
      const endTime = new Date(date.setHours(workingHoursEnd, 0, 0, 0));
      const daySlots = generateTimeSlots(startTime, endTime);

      slots.push(...daySlots);
    }

    // Fetch booked appointments for the doctor and specified date range
    const result2 = await db.query(
      `
            SELECT app_date::TEXT AS app_date, app_time
            FROM appointments 
            WHERE did = $1 
            AND app_date >= CURRENT_DATE
            AND app_date <= CURRENT_DATE + interval '7 days'
        `,
      [doctorId]
    );

    // Convert booked slots into a set of strings for quick lookup
    const bookedSlots = new Set(
      result2.rows.map((row) => `${row.app_date} ${row.app_time.slice(0, 5)}`)
    );

    console.log(bookedSlots);

    // Filter out booked slots from the generated slots
    const availableSlots = slots.filter((slot) => {
      const slotDate = slot.toISOString().split("T")[0];
      const slotTime = slot.toTimeString().slice(0, 5); // Format as HH:MM
      return !bookedSlots.has(`${slotDate} ${slotTime}`);
    });

    // Format available slots into date-time pairs for easier consumption by the frontend
    const formattedSlots = availableSlots.map((slot) => ({
      date: slot.toISOString().split("T")[0],
      time: slot.toTimeString().slice(0, 5),
    }));

    res
      .status(200)
      .json({ doctor: specificDoctor, formattedSlots: formattedSlots });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch the requested doctor" });
  }
});

app.post("/book-appointment", verifyToken, async (req, res) => {
  const { date, time, doctorId } = req.body;
  const { pid } = req.user;

  try {
    await db.query(
      "INSERT INTO appointments(pid,did,app_date,app_time,action) VALUES ($1,$2,$3,$4,'request')",
      [pid, Number(doctorId), date, time]
    );
    res.status(201).json({ message: "Success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to book" });
  }
});

app.get("/my-appointments", verifyToken, async (req, res) => {
  const { pid } = req.user;
  try {
    const result = await db.query(
      "select a.app_id,a.pid,a.app_date::TEXT AS app_date,a.app_time,d.dname,d.image,d.speciality,d.address,a.action from patient p join appointments a on p.pid = a.pid join doctor_info d on d.did = a.did where a.pid = $1",
      [pid]
    );

    const appointments = result.rows;
    res.status(200).json({ appointments: appointments });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch appointments" });
  }
});

app.post(
  "/add-doctor",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const doctorData = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File upload is required" });
    }

    const filename = file.filename;
    const {
      name: dname,
      email: demail,
      degree,
      password: pwd,
      address,
      experience,
      fees,
      about,
      speciality,
    } = doctorData;
    const queryParams =
      "dname,demail,degree,pwd,address,experience,fees,about,image,isavail,speciality";

    try {
      await db.query(
        "INSERT INTO doctor_info(" +
          queryParams +
          ") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
        [
          dname,
          demail,
          degree,
          pwd,
          address,
          experience,
          fees,
          about,
          filename,
          1,
          speciality,
        ]
      );
      res.status(201).json({ message: "Successfully added a doctor" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Unable to add the doctor" });
    }
  }
);

app.get("/appointments", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "select p.pname,a.app_date,a.app_time,d.dname,d.fees,a.action,p.birthday from patient p join appointments a on p.pid = a.pid join doctor_info d on d.did = a.did"
    );
    const appointments = result.rows;
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch appointments" });
  }
});

app.put("/cancel/:id", verifyToken, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await db.query(
      "UPDATE appointments SET action = 'cancelled' WHERE app_id = $1",
      [id]
    );
    res.status(201).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete" });
  }
});

app.post("/login-patient", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT pid,pemail,pwd FROM patient WHERE pemail=$1 AND pwd=$2",
      [email, password]
    );
    if (result.rows.length > 0) {
      const token = jwt.sign(result.rows[0], secretKey);
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Email or Password is Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to login" });
  }
});

app.post("/register-patient", async (req, res) => {
  const { fname, email, password, phone, address, gender, birthday } = req.body;

  try {
    await db.query(
      "INSERT INTO patient(pname,pemail,pwd,phone,paddress,gender,birthday) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [fname, email, password, phone, address, gender, birthday]
    );
    res.status(201).json({ message: "Success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to register" });
  }
});

app.get("/available-doctors", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT did,dname,speciality,image FROM doctor_info WHERE isavail = TRUE"
    );
    const doctors = result.rows;
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch doctors" });
  }
});

app.get("/count", verifyToken, async (req, res) => {
  try {
    const res1 = await db.query(
      "select count(pid) as patient_count from patient"
    );
    const patient_count = res1.rows[0].patient_count;
    const res2 = await db.query(
      "select count(did) as doctors_count from doctor_info"
    );
    const doctors_count = res2.rows[0].doctors_count;
    const res3 = await db.query(
      "	select count(app_id) as app_count from appointments"
    );
    const app_count = res3.rows[0].app_count;

    const res4 = await db.query(
      "select a.app_id,d.dname,a.app_date::TEXT as app_date,a.action from appointments a join doctor_info d on d.did = a.did where app_date >= CURRENT_DATE"
    );
    const latestAppointments = res4.rows;
    const data = {
      patient_count,
      doctors_count,
      app_count,
      latestAppointments,
    };

    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to fetch" });
  }
});

app.put("/cancel-byadmin/:id", verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.query(
      "UPDATE appointments SET action = 'cancelled' WHERE app_id =$1",
      [id]
    );
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Unable to update" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
