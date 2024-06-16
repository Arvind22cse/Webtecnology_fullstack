const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");

// Create Express app
const app = express();
const port = 4055;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection parameters
const mongoUrl = "mongodb://localhost:27017/";
const dbName = "mydatabase";
let db;

// Connect to MongoDB server
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

// Route to serve the HTML form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "employee.html"));
});
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/customer", (req, res) => {
    res.sendFile(path.join(__dirname, "customer.html"));
});


// Route to handle form submission and insert data into MongoDB
app.post("/insert", async (req, res) => {
    const { type, employee, price } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const result = await db.collection("items").insertOne({ type, employee, price });
        console.log("Number of documents inserted: " + result.insertedCount);
        res.redirect("/admin");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Endpoint to retrieve and display a simple report from MongoDB
app.get("/view", async (req, res) => {
    
    try {
        const items = await db.collection("items").find().toArray();
        console.log(items);

        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Type</th><th>No of Employees</th><th>Cost</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.type}</td><td>${item.employee}</td><td>${item.price}</td></tr>`).join("");
        tableContent += "</table><a href='/'>Back to form</a>";

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});
app.get("/order",(req, res) => {
    res.sendFile(path.join(__dirname, "order.html"));
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
